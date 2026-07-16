package in.neupanepralad.esports.competition.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.competition.dto.FixtureParticipantResponse;
import in.neupanepralad.esports.competition.dto.FixtureRequest;
import in.neupanepralad.esports.competition.dto.FixtureResponse;
import in.neupanepralad.esports.competition.dto.GroupParticipantResponse;
import in.neupanepralad.esports.competition.dto.GroupRequest;
import in.neupanepralad.esports.competition.dto.GroupResponse;
import in.neupanepralad.esports.competition.dto.StageRequest;
import in.neupanepralad.esports.competition.dto.StageResponse;
import in.neupanepralad.esports.competition.model.Fixture;
import in.neupanepralad.esports.competition.model.FixtureParticipant;
import in.neupanepralad.esports.competition.model.FixtureStatus;
import in.neupanepralad.esports.competition.model.StageGroup;
import in.neupanepralad.esports.competition.model.StageGroupParticipant;
import in.neupanepralad.esports.competition.model.StageStatus;
import in.neupanepralad.esports.competition.model.StageType;
import in.neupanepralad.esports.competition.model.TournamentStage;
import in.neupanepralad.esports.competition.repository.FixtureParticipantRepository;
import in.neupanepralad.esports.competition.repository.FixtureRepository;
import in.neupanepralad.esports.competition.repository.StageGroupParticipantRepository;
import in.neupanepralad.esports.competition.repository.StageGroupRepository;
import in.neupanepralad.esports.competition.repository.TournamentStageRepository;
import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.leaderboard.repository.StageQualificationRepository;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompetitionService {

    private final TournamentStageRepository stageRepository;
    private final StageGroupRepository groupRepository;
    private final StageGroupParticipantRepository groupParticipantRepository;
    private final FixtureRepository fixtureRepository;
    private final FixtureParticipantRepository fixtureParticipantRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final StageQualificationRepository qualificationRepository;
    private final TournamentAccessService tournamentAccessService;

    @Transactional
    public StageResponse createStage(
            UUID tournamentId,
            UUID actorId,
            StageRequest request
    ) {
        TournamentStage stage = new TournamentStage();
        stage.setTournament(tournamentAccessService.requireManager(tournamentId, actorId));
        apply(stage, request);
        return StageResponse.from(stageRepository.save(stage));
    }

    @Transactional(readOnly = true)
    public List<StageResponse> listStages(UUID tournamentId) {
        tournamentAccessService.requireTournament(tournamentId);
        return stageRepository.findAllByTournamentIdOrderBySequenceNumberAsc(tournamentId)
                .stream().map(StageResponse::from).toList();
    }

    @Transactional
    public StageResponse updateStage(
            UUID tournamentId,
            UUID stageId,
            UUID actorId,
            StageRequest request
    ) {
        tournamentAccessService.requireManager(tournamentId, actorId);
        TournamentStage stage = requireStage(tournamentId, stageId);
        apply(stage, request);
        return StageResponse.from(stage);
    }

    @Transactional
    public void deleteStage(UUID tournamentId, UUID stageId, UUID actorId) {
        tournamentAccessService.requireManager(tournamentId, actorId);
        TournamentStage stage = requireStage(tournamentId, stageId);
        clearStage(stageId);
        stageRepository.delete(stage);
    }

    @Transactional
    public GroupResponse createGroup(
            UUID stageId,
            UUID actorId,
            GroupRequest request
    ) {
        TournamentStage stage = requireStage(stageId);
        tournamentAccessService.requireManager(stage.getTournament().getId(), actorId);
        StageGroup group = new StageGroup();
        group.setStage(stage);
        apply(group, request);
        return toGroupResponse(groupRepository.save(group));
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> listGroups(UUID stageId) {
        requireStage(stageId);
        return groupRepository.findAllByStageIdOrderByGroupNumberAsc(stageId)
                .stream().map(this::toGroupResponse).toList();
    }

    @Transactional
    public GroupResponse updateGroup(
            UUID stageId,
            UUID groupId,
            UUID actorId,
            GroupRequest request
    ) {
        TournamentStage stage = requireStage(stageId);
        tournamentAccessService.requireManager(stage.getTournament().getId(), actorId);
        StageGroup group = requireGroup(stageId, groupId);
        apply(group, request);
        return toGroupResponse(group);
    }

    @Transactional
    public FixtureResponse createFixture(
            UUID stageId,
            UUID actorId,
            FixtureRequest request
    ) {
        TournamentStage stage = requireStage(stageId);
        tournamentAccessService.requireManager(stage.getTournament().getId(), actorId);
        Fixture fixture = new Fixture();
        fixture.setStage(stage);
        applyFixture(fixture, request);
        fixtureRepository.save(fixture);
        replaceParticipants(fixture, request.participantRegistrationIds());
        return toFixtureResponse(fixture);
    }

    @Transactional(readOnly = true)
    public List<FixtureResponse> listFixtures(UUID stageId) {
        requireStage(stageId);
        return fixtureRepository.findAllByStageIdOrderByRoundNumberAscMatchNumberAsc(stageId)
                .stream().map(this::toFixtureResponse).toList();
    }

    @Transactional
    public FixtureResponse updateFixture(
            UUID stageId,
            UUID fixtureId,
            UUID actorId,
            FixtureRequest request
    ) {
        TournamentStage stage = requireStage(stageId);
        tournamentAccessService.requireManager(stage.getTournament().getId(), actorId);
        Fixture fixture = requireFixture(stageId, fixtureId);
        applyFixture(fixture, request);
        replaceParticipants(fixture, request.participantRegistrationIds());
        return toFixtureResponse(fixture);
    }

    @Transactional
    public void deleteFixture(UUID stageId, UUID fixtureId, UUID actorId) {
        TournamentStage stage = requireStage(stageId);
        tournamentAccessService.requireManager(stage.getTournament().getId(), actorId);
        Fixture fixture = requireFixture(stageId, fixtureId);
        fixtureParticipantRepository.deleteAllByFixtureId(fixtureId);
        fixtureRepository.delete(fixture);
    }

    @Transactional
    public StageResponse generate(UUID stageId, UUID actorId, int groupCount) {
        TournamentStage stage = requireStage(stageId);
        tournamentAccessService.requireManager(stage.getTournament().getId(), actorId);
        List<TournamentRegistration> registrations =
                qualificationRepository.findAllByToStageIdOrderBySourceRankAsc(stageId)
                        .stream()
                        .map(qualification -> qualification.getRegistration())
                        .toList();
        if (registrations.isEmpty()) {
            registrations = registrationRepository
                    .findAllByTournamentIdAndStatusOrderBySubmittedAtAsc(
                            stage.getTournament().getId(),
                            RegistrationStatus.APPROVED
                    );
        }
        if (registrations.size() < 2) {
            throw new BadRequestException("At least two approved registrations are required");
        }
        clearStage(stageId);
        if (stage.getType() == StageType.GROUP_STAGE
                || stage.getType() == StageType.ROUND_ROBIN) {
            generateGroups(stage, registrations, groupCount);
        } else {
            generateInitialRound(stage, registrations);
        }
        stage.setStatus(StageStatus.READY);
        return StageResponse.from(stage);
    }

    private void generateGroups(
            TournamentStage stage,
            List<TournamentRegistration> registrations,
            int groupCount
    ) {
        int actualGroupCount = Math.min(Math.max(groupCount, 1), registrations.size());
        List<StageGroup> groups = new ArrayList<>();
        for (int index = 0; index < actualGroupCount; index++) {
            StageGroup group = new StageGroup();
            group.setStage(stage);
            group.setName("Group " + (char) ('A' + index));
            group.setGroupNumber(index + 1);
            groups.add(groupRepository.save(group));
        }
        for (int index = 0; index < registrations.size(); index++) {
            StageGroup group = groups.get(index % actualGroupCount);
            StageGroupParticipant participant = new StageGroupParticipant();
            participant.setGroup(group);
            participant.setRegistration(registrations.get(index));
            participant.setSeed(index + 1);
            groupParticipantRepository.save(participant);
        }
        int matchNumber = 1;
        for (StageGroup group : groups) {
            List<TournamentRegistration> groupRegistrations =
                    groupParticipantRepository.findAllByGroupIdOrderBySeedAsc(group.getId())
                            .stream().map(StageGroupParticipant::getRegistration).toList();
            for (int first = 0; first < groupRegistrations.size(); first++) {
                for (int second = first + 1; second < groupRegistrations.size(); second++) {
                    createGeneratedFixture(
                            stage,
                            group,
                            1,
                            matchNumber++,
                            List.of(groupRegistrations.get(first), groupRegistrations.get(second))
                    );
                }
            }
        }
    }

    private void generateInitialRound(
            TournamentStage stage,
            List<TournamentRegistration> registrations
    ) {
        int matchNumber = 1;
        for (int index = 0; index < registrations.size(); index += 2) {
            List<TournamentRegistration> pair = index + 1 < registrations.size()
                    ? List.of(registrations.get(index), registrations.get(index + 1))
                    : List.of(registrations.get(index));
            createGeneratedFixture(stage, null, 1, matchNumber++, pair);
        }
    }

    private void createGeneratedFixture(
            TournamentStage stage,
            StageGroup group,
            int round,
            int match,
            List<TournamentRegistration> registrations
    ) {
        Fixture fixture = new Fixture();
        fixture.setStage(stage);
        fixture.setGroup(group);
        fixture.setRoundNumber(round);
        fixture.setMatchNumber(match);
        fixture.setStatus(registrations.size() == 1
                ? FixtureStatus.BYE
                : FixtureStatus.DRAFT);
        if (registrations.size() == 1) {
            fixture.setWinner(registrations.getFirst());
        }
        fixtureRepository.save(fixture);
        for (int index = 0; index < registrations.size(); index++) {
            FixtureParticipant participant = new FixtureParticipant();
            participant.setFixture(fixture);
            participant.setRegistration(registrations.get(index));
            participant.setSlotNumber(index + 1);
            participant.setSeed(index + 1);
            fixtureParticipantRepository.save(participant);
        }
    }

    private void replaceParticipants(Fixture fixture, List<UUID> registrationIds) {
        List<TournamentRegistration> registrations = registrationRepository.findAllById(
                registrationIds
        );
        if (registrations.size() != registrationIds.stream().distinct().count()
                || registrations.stream().anyMatch(registration ->
                !registration.getTournament().getId()
                        .equals(fixture.getStage().getTournament().getId()))) {
            throw new BadRequestException("One or more fixture participants are invalid");
        }
        fixtureParticipantRepository.deleteAllByFixtureId(fixture.getId());
        for (int index = 0; index < registrations.size(); index++) {
            FixtureParticipant participant = new FixtureParticipant();
            participant.setFixture(fixture);
            participant.setRegistration(registrations.get(index));
            participant.setSlotNumber(index + 1);
            participant.setSeed(index + 1);
            fixtureParticipantRepository.save(participant);
        }
        if (fixture.getWinner() != null
                && registrations.stream().noneMatch(registration ->
                registration.getId().equals(fixture.getWinner().getId()))) {
            throw new BadRequestException("Fixture winner must be a participant");
        }
    }

    private void applyFixture(Fixture fixture, FixtureRequest request) {
        if (request.groupId() == null) {
            fixture.setGroup(null);
        } else {
            fixture.setGroup(requireGroup(fixture.getStage().getId(), request.groupId()));
        }
        fixture.setRoundNumber(request.roundNumber());
        fixture.setMatchNumber(request.matchNumber());
        fixture.setStatus(request.status());
        fixture.setWinner(request.winnerRegistrationId() == null
                ? null
                : registrationRepository.findById(request.winnerRegistrationId())
                .orElseThrow(() -> new ResourceNotFoundException("Winner registration not found")));
    }

    private GroupResponse toGroupResponse(StageGroup group) {
        return GroupResponse.from(
                group,
                groupParticipantRepository.findAllByGroupIdOrderBySeedAsc(group.getId())
                        .stream().map(GroupParticipantResponse::from).toList()
        );
    }

    private FixtureResponse toFixtureResponse(Fixture fixture) {
        return FixtureResponse.from(
                fixture,
                fixtureParticipantRepository.findAllByFixtureIdOrderBySlotNumberAsc(
                                fixture.getId()
                        )
                        .stream().map(FixtureParticipantResponse::from).toList()
        );
    }

    private void clearStage(UUID stageId) {
        fixtureParticipantRepository.deleteAllByFixtureStageId(stageId);
        fixtureRepository.deleteAllByStageId(stageId);
        groupParticipantRepository.deleteAllByGroupStageId(stageId);
        groupRepository.deleteAllByStageId(stageId);
    }

    private TournamentStage requireStage(UUID tournamentId, UUID stageId) {
        TournamentStage stage = requireStage(stageId);
        if (!stage.getTournament().getId().equals(tournamentId)) {
            throw new ResourceNotFoundException("Tournament stage not found");
        }
        return stage;
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

    private Fixture requireFixture(UUID stageId, UUID fixtureId) {
        Fixture fixture = fixtureRepository.findById(fixtureId)
                .orElseThrow(() -> new ResourceNotFoundException("Fixture not found"));
        if (!fixture.getStage().getId().equals(stageId)) {
            throw new ResourceNotFoundException("Fixture not found");
        }
        return fixture;
    }

    private void apply(TournamentStage stage, StageRequest request) {
        stage.setName(request.name().trim());
        stage.setType(request.type());
        stage.setStatus(request.status());
        stage.setSequenceNumber(request.sequenceNumber());
        stage.setBestOf(request.bestOf());
        stage.setQualifiersPerGroup(request.qualifiersPerGroup());
    }

    private void apply(StageGroup group, GroupRequest request) {
        group.setName(request.name().trim());
        group.setGroupNumber(request.groupNumber());
    }
}
