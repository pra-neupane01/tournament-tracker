package in.neupanepralad.esports.result.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ForbiddenException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.competition.model.Fixture;
import in.neupanepralad.esports.competition.model.FixtureStatus;
import in.neupanepralad.esports.competition.repository.FixtureParticipantRepository;
import in.neupanepralad.esports.competition.repository.FixtureRepository;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.result.dto.ParticipantResultRequest;
import in.neupanepralad.esports.result.dto.ParticipantResultResponse;
import in.neupanepralad.esports.result.dto.ResultMetricResponse;
import in.neupanepralad.esports.result.dto.ResultReviewRequest;
import in.neupanepralad.esports.result.dto.ResultSubmissionRequest;
import in.neupanepralad.esports.result.dto.ResultSubmissionResponse;
import in.neupanepralad.esports.result.model.ParticipantResult;
import in.neupanepralad.esports.result.model.ResultMetric;
import in.neupanepralad.esports.result.model.ResultSubmission;
import in.neupanepralad.esports.result.model.ResultSubmissionStatus;
import in.neupanepralad.esports.result.repository.ParticipantResultRepository;
import in.neupanepralad.esports.result.repository.ResultMetricRepository;
import in.neupanepralad.esports.result.repository.ResultSubmissionRepository;
import in.neupanepralad.esports.scoring.model.MetricScoringRule;
import in.neupanepralad.esports.scoring.repository.MetricScoringRuleRepository;
import in.neupanepralad.esports.scoring.repository.PlacementScoringRuleRepository;
import in.neupanepralad.esports.team.service.TeamAccessService;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final FixtureRepository fixtureRepository;
    private final FixtureParticipantRepository fixtureParticipantRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final ResultSubmissionRepository submissionRepository;
    private final ParticipantResultRepository participantResultRepository;
    private final ResultMetricRepository resultMetricRepository;
    private final MetricScoringRuleRepository metricRuleRepository;
    private final PlacementScoringRuleRepository placementRuleRepository;
    private final TournamentAccessService tournamentAccessService;
    private final TeamAccessService teamAccessService;
    private final UserRepository userRepository;

    @Transactional
    public ResultSubmissionResponse submit(
            UUID fixtureId,
            UUID actorId,
            ResultSubmissionRequest request
    ) {
        Fixture fixture = requireFixture(fixtureId);
        requireSubmissionAccess(fixture, actorId);
        validateParticipants(fixtureId, request.results());
        Map<String, MetricScoringRule> metricRules = metricRuleRepository
                .findAllByStageIdOrderBySortOrderAsc(fixture.getStage().getId())
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        MetricScoringRule::getMetricKey,
                        rule -> rule
                ));

        ResultSubmission submission = new ResultSubmission();
        submission.setFixture(fixture);
        submission.setSubmittedBy(requireUser(actorId));
        submission.setSubmittedAt(LocalDateTime.now(ZoneOffset.UTC));
        submission.setStatus(ResultSubmissionStatus.PENDING);
        submission.setNotes(request.notes());
        submission.setEvidenceUrl(request.evidenceUrl());
        submissionRepository.save(submission);

        for (ParticipantResultRequest resultRequest : request.results()) {
            TournamentRegistration registration = registrationRepository
                    .findById(resultRequest.registrationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
            BigDecimal totalPoints = placementRuleRepository
                    .findByStageIdAndPlacement(
                            fixture.getStage().getId(),
                            resultRequest.placement()
                    )
                    .map(rule -> rule.getPoints())
                    .orElse(BigDecimal.ZERO);

            ParticipantResult result = new ParticipantResult();
            result.setSubmission(submission);
            result.setRegistration(registration);
            result.setPlacement(resultRequest.placement());
            result.setTotalPoints(BigDecimal.ZERO);
            participantResultRepository.save(result);

            for (Map.Entry<String, BigDecimal> entry : resultRequest.metrics().entrySet()) {
                String key = entry.getKey().toLowerCase(Locale.ROOT);
                MetricScoringRule rule = metricRules.get(key);
                if (rule == null) {
                    throw new BadRequestException("Unknown scoring metric: " + key);
                }
                BigDecimal awarded = entry.getValue().multiply(rule.getPointsPerUnit());
                totalPoints = totalPoints.add(awarded);
                ResultMetric metric = new ResultMetric();
                metric.setParticipantResult(result);
                metric.setMetricKey(key);
                metric.setMetricValue(entry.getValue());
                metric.setAwardedPoints(awarded);
                resultMetricRepository.save(metric);
            }
            result.setTotalPoints(totalPoints);
        }
        return toResponse(submission);
    }

    @Transactional(readOnly = true)
    public List<ResultSubmissionResponse> list(UUID fixtureId, UUID actorId) {
        Fixture fixture = requireFixture(fixtureId);
        requireReadAccess(fixture, actorId);
        return submissionRepository.findAllByFixtureIdOrderBySubmittedAtDesc(fixtureId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ResultSubmissionResponse review(
            UUID submissionId,
            UUID actorId,
            ResultReviewRequest request
    ) {
        ResultSubmission submission = requireSubmission(submissionId);
        Fixture fixture = submission.getFixture();
        tournamentAccessService.requireManager(
                fixture.getStage().getTournament().getId(),
                actorId
        );
        if (request.status() == ResultSubmissionStatus.PENDING) {
            throw new BadRequestException("Review status must confirm or reject the result");
        }
        submission.setStatus(request.status());
        submission.setReviewedBy(requireUser(actorId));
        submission.setReviewedAt(LocalDateTime.now(ZoneOffset.UTC));
        submission.setReviewNotes(request.reviewNotes());

        if (request.status() == ResultSubmissionStatus.CONFIRMED) {
            submissionRepository.findAllByFixtureIdAndStatus(
                            fixture.getId(),
                            ResultSubmissionStatus.PENDING
                    )
                    .stream()
                    .filter(other -> !other.getId().equals(submissionId))
                    .forEach(other -> {
                        other.setStatus(ResultSubmissionStatus.REJECTED);
                        other.setReviewedBy(submission.getReviewedBy());
                        other.setReviewedAt(submission.getReviewedAt());
                        other.setReviewNotes("Superseded by confirmed result");
                    });
            List<ParticipantResult> results =
                    participantResultRepository.findAllBySubmissionIdOrderByPlacementAsc(
                            submissionId
                    );
            List<ParticipantResult> winners = results.stream()
                    .filter(result -> result.getPlacement() == 1)
                    .toList();
            fixture.setWinner(winners.size() == 1
                    ? winners.getFirst().getRegistration()
                    : null);
            fixture.setStatus(FixtureStatus.COMPLETED);
        }
        return toResponse(submission);
    }

    private void validateParticipants(
            UUID fixtureId,
            List<ParticipantResultRequest> results
    ) {
        Set<UUID> expected = fixtureParticipantRepository
                .findAllByFixtureIdOrderBySlotNumberAsc(fixtureId)
                .stream()
                .map(participant -> participant.getRegistration().getId())
                .collect(java.util.stream.Collectors.toSet());
        Set<UUID> submitted = new HashSet<>();
        Set<Integer> placements = new HashSet<>();
        for (ParticipantResultRequest result : results) {
            if (!submitted.add(result.registrationId())) {
                throw new BadRequestException("Each fixture participant must appear once");
            }
            if (!placements.add(result.placement())) {
                throw new BadRequestException("Participant placements must be unique");
            }
        }
        if (!expected.equals(submitted)) {
            throw new BadRequestException(
                    "Result submission must include every fixture participant"
            );
        }
    }

    private void requireSubmissionAccess(Fixture fixture, UUID actorId) {
        try {
            tournamentAccessService.requireManager(
                    fixture.getStage().getTournament().getId(),
                    actorId
            );
            return;
        } catch (ForbiddenException ignored) {
            // Try team manager access.
        }
        for (var participant :
                fixtureParticipantRepository.findAllByFixtureIdOrderBySlotNumberAsc(
                        fixture.getId()
                )) {
            try {
                teamAccessService.requireManager(
                        participant.getRegistration().getTeam().getId(),
                        actorId
                );
                return;
            } catch (ForbiddenException ignored) {
                // Continue.
            }
        }
        throw new ForbiddenException("Result submission is restricted to fixture participants");
    }

    private void requireReadAccess(Fixture fixture, UUID actorId) {
        requireSubmissionAccess(fixture, actorId);
    }

    private ResultSubmissionResponse toResponse(ResultSubmission submission) {
        List<ParticipantResultResponse> results = participantResultRepository
                .findAllBySubmissionIdOrderByPlacementAsc(submission.getId())
                .stream()
                .map(result -> ParticipantResultResponse.from(
                        result,
                        resultMetricRepository
                                .findAllByParticipantResultIdOrderByMetricKeyAsc(result.getId())
                                .stream().map(ResultMetricResponse::from).toList()
                ))
                .toList();
        return ResultSubmissionResponse.from(submission, results);
    }

    private Fixture requireFixture(UUID fixtureId) {
        return fixtureRepository.findById(fixtureId)
                .orElseThrow(() -> new ResourceNotFoundException("Fixture not found"));
    }

    private ResultSubmission requireSubmission(UUID submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Result submission not found"
                ));
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
