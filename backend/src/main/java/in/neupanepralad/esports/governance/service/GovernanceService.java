package in.neupanepralad.esports.governance.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ForbiddenException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.competition.model.Fixture;
import in.neupanepralad.esports.competition.repository.FixtureParticipantRepository;
import in.neupanepralad.esports.competition.repository.FixtureRepository;
import in.neupanepralad.esports.governance.dto.DisputeCommentResponse;
import in.neupanepralad.esports.governance.dto.DisputeRequest;
import in.neupanepralad.esports.governance.dto.DisputeResponse;
import in.neupanepralad.esports.governance.dto.DisputeReviewRequest;
import in.neupanepralad.esports.governance.dto.PenaltyRequest;
import in.neupanepralad.esports.governance.dto.PenaltyResponse;
import in.neupanepralad.esports.governance.model.Dispute;
import in.neupanepralad.esports.governance.model.DisputeComment;
import in.neupanepralad.esports.governance.model.DisputeStatus;
import in.neupanepralad.esports.governance.model.Penalty;
import in.neupanepralad.esports.governance.model.PenaltyStatus;
import in.neupanepralad.esports.governance.model.PenaltyType;
import in.neupanepralad.esports.governance.repository.DisputeCommentRepository;
import in.neupanepralad.esports.governance.repository.DisputeRepository;
import in.neupanepralad.esports.governance.repository.PenaltyRepository;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.result.model.ResultSubmission;
import in.neupanepralad.esports.result.repository.ResultSubmissionRepository;
import in.neupanepralad.esports.team.service.TeamAccessService;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import in.neupanepralad.esports.notification.model.NotificationType;
import in.neupanepralad.esports.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GovernanceService {

    private final PenaltyRepository penaltyRepository;
    private final DisputeRepository disputeRepository;
    private final DisputeCommentRepository commentRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final FixtureRepository fixtureRepository;
    private final FixtureParticipantRepository fixtureParticipantRepository;
    private final ResultSubmissionRepository resultSubmissionRepository;
    private final TournamentAccessService tournamentAccessService;
    private final TeamAccessService teamAccessService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public PenaltyResponse issuePenalty(
            UUID tournamentId,
            UUID actorId,
            PenaltyRequest request
    ) {
        Tournament tournament = tournamentAccessService.requireManager(tournamentId, actorId);
        TournamentRegistration registration = requireRegistration(request.registrationId());
        if (!registration.getTournament().getId().equals(tournamentId)) {
            throw new BadRequestException("Registration is not part of this tournament");
        }
        if (request.type() == PenaltyType.POINT_DEDUCTION
                && request.pointsDeducted().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Point deductions require a positive points value");
        }
        Fixture fixture = null;
        if (request.fixtureId() != null) {
            fixture = requireFixture(request.fixtureId());
            if (!fixture.getStage().getTournament().getId().equals(tournamentId)) {
                throw new BadRequestException("Fixture is not part of this tournament");
            }
        }
        Penalty penalty = new Penalty();
        penalty.setTournament(tournament);
        penalty.setRegistration(registration);
        penalty.setFixture(fixture);
        penalty.setType(request.type());
        penalty.setPointsDeducted(request.type() == PenaltyType.POINT_DEDUCTION
                ? request.pointsDeducted()
                : BigDecimal.ZERO);
        penalty.setReason(request.reason().trim());
        penalty.setStatus(PenaltyStatus.ACTIVE);
        penalty.setIssuedBy(requireUser(actorId));
        penalty.setIssuedAt(LocalDateTime.now(ZoneOffset.UTC));
        return PenaltyResponse.from(penaltyRepository.save(penalty));
    }

    @Transactional(readOnly = true)
    public List<PenaltyResponse> listPenalties(UUID tournamentId) {
        tournamentAccessService.requireTournament(tournamentId);
        return penaltyRepository.findAllByTournamentIdOrderByIssuedAtDesc(tournamentId)
                .stream().map(PenaltyResponse::from).toList();
    }

    @Transactional
    public PenaltyResponse revokePenalty(UUID penaltyId, UUID actorId) {
        Penalty penalty = requirePenalty(penaltyId);
        tournamentAccessService.requireManager(penalty.getTournament().getId(), actorId);
        penalty.setStatus(PenaltyStatus.REVOKED);
        penalty.setRevokedBy(requireUser(actorId));
        penalty.setRevokedAt(LocalDateTime.now(ZoneOffset.UTC));
        return PenaltyResponse.from(penalty);
    }

    @Transactional
    public DisputeResponse openDispute(
            UUID fixtureId,
            UUID actorId,
            DisputeRequest request
    ) {
        Fixture fixture = requireFixture(fixtureId);
        TournamentRegistration registration = requireRegistration(request.registrationId());
        if (!fixtureParticipantRepository.existsByFixtureIdAndRegistrationId(
                fixtureId,
                request.registrationId()
        )) {
            throw new BadRequestException("Registration is not a fixture participant");
        }
        teamAccessService.requireManager(registration.getTeam().getId(), actorId);
        ResultSubmission resultSubmission = null;
        if (request.resultSubmissionId() != null) {
            resultSubmission = resultSubmissionRepository.findById(request.resultSubmissionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Result submission not found"
                    ));
            if (!resultSubmission.getFixture().getId().equals(fixtureId)) {
                throw new BadRequestException("Result submission is not for this fixture");
            }
        }
        Dispute dispute = new Dispute();
        dispute.setFixture(fixture);
        dispute.setRegistration(registration);
        dispute.setResultSubmission(resultSubmission);
        dispute.setOpenedBy(requireUser(actorId));
        dispute.setCategory(request.category().trim());
        dispute.setDescription(request.description().trim());
        dispute.setStatus(DisputeStatus.OPEN);
        disputeRepository.save(dispute);
        return toDisputeResponse(dispute);
    }

    @Transactional(readOnly = true)
    public PagedResponse<DisputeResponse> listDisputes(
            UUID tournamentId,
            UUID actorId,
            DisputeStatus status,
            int page,
            int size
    ) {
        tournamentAccessService.requireManager(tournamentId, actorId);
        PageRequest pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
        return PagedResponse.of(
                (status == null
                        ? disputeRepository.findAllByFixtureStageTournamentId(
                                tournamentId,
                                pageable
                        )
                        : disputeRepository.findAllByFixtureStageTournamentIdAndStatus(
                                tournamentId,
                                status,
                                pageable
                        )).map(this::toDisputeResponse)
        );
    }

    @Transactional(readOnly = true)
    public DisputeResponse getDispute(UUID disputeId, UUID actorId) {
        Dispute dispute = requireDispute(disputeId);
        requireDisputeAccess(dispute, actorId);
        return toDisputeResponse(dispute);
    }

    @Transactional
    public DisputeResponse reviewDispute(
            UUID disputeId,
            UUID actorId,
            DisputeReviewRequest request
    ) {
        Dispute dispute = requireDispute(disputeId);
        tournamentAccessService.requireManager(
                dispute.getFixture().getStage().getTournament().getId(),
                actorId
        );
        dispute.setStatus(request.status());
        dispute.setAssignedTo(requireUser(actorId));
        dispute.setResolution(request.resolution());
        if (request.status() == DisputeStatus.RESOLVED
                || request.status() == DisputeStatus.REJECTED) {
            dispute.setResolvedAt(LocalDateTime.now(ZoneOffset.UTC));
        } else {
            dispute.setResolvedAt(null);
        }
        notificationService.send(
                dispute.getOpenedBy(),
                NotificationType.DISPUTE,
                "Dispute " + request.status().name().toLowerCase(java.util.Locale.ROOT),
                "Your dispute for fixture " + dispute.getFixture().getId()
                        + " is now " + request.status().name().toLowerCase(
                        java.util.Locale.ROOT
                ),
                "/disputes/" + dispute.getId()
        );
        return toDisputeResponse(dispute);
    }

    @Transactional
    public DisputeResponse comment(
            UUID disputeId,
            UUID actorId,
            String message
    ) {
        Dispute dispute = requireDispute(disputeId);
        requireDisputeAccess(dispute, actorId);
        DisputeComment comment = new DisputeComment();
        comment.setDispute(dispute);
        comment.setAuthor(requireUser(actorId));
        comment.setMessage(message.trim());
        commentRepository.save(comment);
        return toDisputeResponse(dispute);
    }

    private void requireDisputeAccess(Dispute dispute, UUID actorId) {
        try {
            tournamentAccessService.requireManager(
                    dispute.getFixture().getStage().getTournament().getId(),
                    actorId
            );
            return;
        } catch (ForbiddenException ignored) {
            teamAccessService.requireManager(dispute.getRegistration().getTeam().getId(), actorId);
        }
    }

    private DisputeResponse toDisputeResponse(Dispute dispute) {
        return DisputeResponse.from(
                dispute,
                commentRepository.findAllByDisputeIdOrderByCreatedAtAsc(dispute.getId())
                        .stream().map(DisputeCommentResponse::from).toList()
        );
    }

    private Penalty requirePenalty(UUID penaltyId) {
        return penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new ResourceNotFoundException("Penalty not found"));
    }

    private Dispute requireDispute(UUID disputeId) {
        return disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
    }

    private Fixture requireFixture(UUID fixtureId) {
        return fixtureRepository.findById(fixtureId)
                .orElseThrow(() -> new ResourceNotFoundException("Fixture not found"));
    }

    private TournamentRegistration requireRegistration(UUID registrationId) {
        return registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
