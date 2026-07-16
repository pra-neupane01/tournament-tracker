package in.neupanepralad.esports.leaderboard.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.competition.model.StageGroup;
import in.neupanepralad.esports.competition.model.StageGroupParticipant;
import in.neupanepralad.esports.competition.model.TournamentStage;
import in.neupanepralad.esports.competition.repository.StageGroupParticipantRepository;
import in.neupanepralad.esports.competition.repository.StageGroupRepository;
import in.neupanepralad.esports.competition.repository.TournamentStageRepository;
import in.neupanepralad.esports.leaderboard.dto.LeaderboardEntryResponse;
import in.neupanepralad.esports.leaderboard.dto.ManualQualificationRequest;
import in.neupanepralad.esports.leaderboard.dto.QualificationRequest;
import in.neupanepralad.esports.leaderboard.dto.QualificationResponse;
import in.neupanepralad.esports.leaderboard.model.StageQualification;
import in.neupanepralad.esports.leaderboard.repository.StageQualificationRepository;
import in.neupanepralad.esports.governance.model.PenaltyStatus;
import in.neupanepralad.esports.governance.model.PenaltyType;
import in.neupanepralad.esports.governance.repository.PenaltyRepository;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.result.model.ParticipantResult;
import in.neupanepralad.esports.result.model.ResultSubmissionStatus;
import in.neupanepralad.esports.result.repository.ParticipantResultRepository;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final TournamentStageRepository stageRepository;
    private final StageGroupRepository groupRepository;
    private final StageGroupParticipantRepository groupParticipantRepository;
    private final ParticipantResultRepository participantResultRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final StageQualificationRepository qualificationRepository;
    private final PenaltyRepository penaltyRepository;
    private final TournamentAccessService tournamentAccessService;

    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> leaderboard(UUID stageId, UUID groupId) {
        requireStage(stageId);
        Set<UUID> eligibleRegistrations = null;
        if (groupId != null) {
            StageGroup group = requireGroup(stageId, groupId);
            eligibleRegistrations = groupParticipantRepository
                    .findAllByGroupIdOrderBySeedAsc(group.getId())
                    .stream()
                    .map(participant -> participant.getRegistration().getId())
                    .collect(java.util.stream.Collectors.toSet());
        }

        Map<UUID, Standing> standings = new HashMap<>();
        for (ParticipantResult result : participantResultRepository
                .findAllBySubmissionFixtureStageIdAndSubmissionStatus(
                        stageId,
                        ResultSubmissionStatus.CONFIRMED
                )) {
            UUID registrationId = result.getRegistration().getId();
            if (eligibleRegistrations != null && !eligibleRegistrations.contains(registrationId)) {
                continue;
            }
            Standing standing = standings.computeIfAbsent(
                    registrationId,
                    ignored -> new Standing(result.getRegistration())
            );
            standing.matchesPlayed++;
            standing.placementTotal += result.getPlacement();
            standing.points = standing.points.add(result.getTotalPoints());
            if (result.getPlacement() == 1) {
                standing.wins++;
            }
        }
        penaltyRepository.findAllByTournamentIdAndStatus(
                requireStage(stageId).getTournament().getId(),
                PenaltyStatus.ACTIVE
        ).forEach(penalty -> {
            Standing standing = standings.get(penalty.getRegistration().getId());
            if (standing == null) {
                return;
            }
            if (penalty.getType() == PenaltyType.POINT_DEDUCTION) {
                standing.penaltyPoints = standing.penaltyPoints.add(
                        penalty.getPointsDeducted()
                );
                standing.points = standing.points.subtract(penalty.getPointsDeducted());
            }
            if (penalty.getType() == PenaltyType.DISQUALIFICATION) {
                standing.disqualified = true;
            }
        });
        Set<UUID> qualified = qualificationRepository
                .findAllByFromStageIdOrderBySourceRankAsc(stageId)
                .stream()
                .map(qualification -> qualification.getRegistration().getId())
                .collect(java.util.stream.Collectors.toSet());
        List<Standing> ordered = standings.values().stream()
                .sorted(Comparator
                        .comparing((Standing standing) -> standing.disqualified)
                        .thenComparing(
                                Comparator.comparing(
                                                (Standing standing) -> standing.points
                                        )
                                        .reversed()
                        )
                        .thenComparing(
                                Comparator.comparingInt((Standing standing) -> standing.wins)
                                        .reversed()
                        )
                        .thenComparingInt(standing -> standing.placementTotal)
                        .thenComparing(standing -> standing.registration.getTeam().getName()))
                .toList();
        List<LeaderboardEntryResponse> response = new ArrayList<>();
        for (int index = 0; index < ordered.size(); index++) {
            Standing standing = ordered.get(index);
            response.add(new LeaderboardEntryResponse(
                    index + 1,
                    standing.registration.getId(),
                    standing.registration.getTeam().getId(),
                    standing.registration.getTeam().getName(),
                    standing.matchesPlayed,
                    standing.wins,
                    standing.placementTotal,
                    standing.points,
                    standing.penaltyPoints,
                    standing.disqualified,
                    qualified.contains(standing.registration.getId())
            ));
        }
        return response;
    }

    @Transactional
    public List<QualificationResponse> qualify(
            UUID stageId,
            UUID actorId,
            QualificationRequest request
    ) {
        TournamentStage fromStage = requireStage(stageId);
        TournamentStage toStage = requireStage(request.toStageId());
        validateDestination(fromStage, toStage);
        tournamentAccessService.requireManager(fromStage.getTournament().getId(), actorId);
        qualificationRepository.deleteAllByFromStageId(stageId);

        List<StageQualification> qualifications = new ArrayList<>();
        if (request.perGroup()) {
            List<StageGroup> groups =
                    groupRepository.findAllByStageIdOrderByGroupNumberAsc(stageId);
            if (groups.isEmpty()) {
                throw new BadRequestException("This stage does not contain groups");
            }
            for (StageGroup group : groups) {
                List<LeaderboardEntryResponse> entries = leaderboard(stageId, group.getId())
                        .stream().filter(entry -> !entry.disqualified()).toList();
                int count = Math.min(request.qualifierCount(), entries.size());
                for (int index = 0; index < count; index++) {
                    qualifications.add(createQualification(
                            fromStage,
                            toStage,
                            group,
                            entries.get(index).registrationId(),
                            index + 1,
                            false
                    ));
                }
            }
        } else {
            List<LeaderboardEntryResponse> entries = leaderboard(stageId, null)
                    .stream().filter(entry -> !entry.disqualified()).toList();
            int count = Math.min(request.qualifierCount(), entries.size());
            for (int index = 0; index < count; index++) {
                qualifications.add(createQualification(
                        fromStage,
                        toStage,
                        null,
                        entries.get(index).registrationId(),
                        index + 1,
                        false
                ));
            }
        }
        return qualifications.stream().map(QualificationResponse::from).toList();
    }

    @Transactional
    public List<QualificationResponse> qualifyManually(
            UUID stageId,
            UUID actorId,
            ManualQualificationRequest request
    ) {
        TournamentStage fromStage = requireStage(stageId);
        TournamentStage toStage = requireStage(request.toStageId());
        validateDestination(fromStage, toStage);
        tournamentAccessService.requireManager(fromStage.getTournament().getId(), actorId);
        qualificationRepository.deleteAllByFromStageId(stageId);
        Set<UUID> unique = new HashSet<>(request.registrationIds());
        if (unique.size() != request.registrationIds().size()) {
            throw new BadRequestException("Qualification registrations must be unique");
        }
        List<StageQualification> qualifications = new ArrayList<>();
        for (int index = 0; index < request.registrationIds().size(); index++) {
            qualifications.add(createQualification(
                    fromStage,
                    toStage,
                    null,
                    request.registrationIds().get(index),
                    index + 1,
                    true
            ));
        }
        return qualifications.stream().map(QualificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<QualificationResponse> listQualifications(UUID stageId) {
        requireStage(stageId);
        return qualificationRepository.findAllByFromStageIdOrderBySourceRankAsc(stageId)
                .stream().map(QualificationResponse::from).toList();
    }

    private StageQualification createQualification(
            TournamentStage fromStage,
            TournamentStage toStage,
            StageGroup group,
            UUID registrationId,
            int rank,
            boolean manual
    ) {
        TournamentRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        if (!registration.getTournament().getId()
                .equals(fromStage.getTournament().getId())) {
            throw new BadRequestException("Registration is not part of this tournament");
        }
        StageQualification qualification = new StageQualification();
        qualification.setFromStage(fromStage);
        qualification.setToStage(toStage);
        qualification.setSourceGroup(group);
        qualification.setRegistration(registration);
        qualification.setSourceRank(rank);
        qualification.setManual(manual);
        qualification.setQualifiedAt(LocalDateTime.now(ZoneOffset.UTC));
        return qualificationRepository.save(qualification);
    }

    private void validateDestination(TournamentStage fromStage, TournamentStage toStage) {
        if (!fromStage.getTournament().getId().equals(toStage.getTournament().getId())) {
            throw new BadRequestException("Qualification stages must belong to one tournament");
        }
        if (toStage.getSequenceNumber() <= fromStage.getSequenceNumber()) {
            throw new BadRequestException("Qualification destination must be a later stage");
        }
    }

    private TournamentStage requireStage(UUID stageId) {
        return stageRepository.findById(stageId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament stage not found"));
    }

    private StageGroup requireGroup(UUID stageId, UUID groupId) {
        StageGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Stage group not found"));
        if (!group.getStage().getId().equals(stageId)) {
            throw new ResourceNotFoundException("Stage group not found");
        }
        return group;
    }

    private static class Standing {
        private final TournamentRegistration registration;
        private int matchesPlayed;
        private int wins;
        private int placementTotal;
        private BigDecimal points = BigDecimal.ZERO;
        private BigDecimal penaltyPoints = BigDecimal.ZERO;
        private boolean disqualified;

        private Standing(TournamentRegistration registration) {
            this.registration = registration;
        }
    }
}
