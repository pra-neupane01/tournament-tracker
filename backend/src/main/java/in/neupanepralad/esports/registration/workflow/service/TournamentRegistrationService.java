package in.neupanepralad.esports.registration.workflow.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ConflictException;
import in.neupanepralad.esports.common.exception.ForbiddenException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.registration.form.model.FormFieldType;
import in.neupanepralad.esports.registration.form.model.RegistrationFormField;
import in.neupanepralad.esports.registration.form.repository.RegistrationFormFieldRepository;
import in.neupanepralad.esports.registration.workflow.dto.RegistrationPlayerResponse;
import in.neupanepralad.esports.registration.workflow.dto.RegistrationResponse;
import in.neupanepralad.esports.registration.workflow.dto.RegistrationReviewRequest;
import in.neupanepralad.esports.registration.workflow.dto.RegistrationSubmitRequest;
import in.neupanepralad.esports.registration.workflow.model.RegistrationAnswer;
import in.neupanepralad.esports.registration.workflow.model.RegistrationPlayer;
import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.registration.workflow.repository.RegistrationAnswerRepository;
import in.neupanepralad.esports.registration.workflow.repository.RegistrationPlayerRepository;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.team.model.RosterRole;
import in.neupanepralad.esports.team.model.Team;
import in.neupanepralad.esports.team.model.TeamMember;
import in.neupanepralad.esports.team.repository.TeamMemberRepository;
import in.neupanepralad.esports.team.service.TeamAccessService;
import in.neupanepralad.esports.team.service.TeamService;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.model.TournamentStatus;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TournamentRegistrationService {

    private final TournamentRegistrationRepository registrationRepository;
    private final RegistrationAnswerRepository answerRepository;
    private final RegistrationPlayerRepository playerRepository;
    private final RegistrationFormFieldRepository fieldRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamService teamService;
    private final TeamAccessService teamAccessService;
    private final TournamentAccessService tournamentAccessService;
    private final UserRepository userRepository;

    @Transactional
    public RegistrationResponse submit(
            UUID tournamentId,
            UUID actorId,
            RegistrationSubmitRequest request
    ) {
        Tournament tournament = tournamentAccessService.requireTournament(tournamentId);
        Team team = teamAccessService.requireManager(request.teamId(), actorId);
        validateWindow(tournament);
        if (!team.getGame().getId().equals(tournament.getGame().getId())) {
            throw new BadRequestException("Team and tournament games do not match");
        }
        if (registrationRepository.findByTournamentIdAndTeamId(
                tournamentId,
                team.getId()
        ).isPresent()) {
            throw new ConflictException("This team has already registered");
        }
        long activeRegistrations = registrationRepository.countByTournamentIdAndStatusIn(
                tournamentId,
                List.of(
                        RegistrationStatus.PENDING,
                        RegistrationStatus.APPROVED,
                        RegistrationStatus.WAITLISTED
                )
        );
        if (activeRegistrations >= tournament.getMaximumTeams()) {
            throw new ConflictException("Tournament registration capacity has been reached");
        }

        List<TeamMember> roster = validateRoster(tournament, team, request.rosterMemberIds());
        List<RegistrationFormField> fields =
                fieldRepository.findAllByTournamentIdOrderBySortOrderAsc(tournamentId);
        Map<RegistrationFormField, List<String>> validatedAnswers =
                validateAnswers(fields, request.answers());

        TournamentRegistration registration = new TournamentRegistration();
        registration.setTournament(tournament);
        registration.setTeam(team);
        registration.setSubmittedBy(requireUser(actorId));
        registration.setSubmittedAt(LocalDateTime.now(ZoneOffset.UTC));
        registration.setStatus(RegistrationStatus.PENDING);
        registrationRepository.save(registration);

        snapshotRoster(registration, roster);
        snapshotAnswers(registration, validatedAnswers);
        return toResponse(registration);
    }

    @Transactional(readOnly = true)
    public PagedResponse<RegistrationResponse> list(
            UUID tournamentId,
            UUID actorId,
            RegistrationStatus status,
            int page,
            int size
    ) {
        tournamentAccessService.requireManager(tournamentId, actorId);
        PageRequest pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.ASC, "submittedAt")
        );
        return PagedResponse.of(
                (status == null
                        ? registrationRepository.findAllByTournamentId(
                                tournamentId,
                                pageable
                        )
                        : registrationRepository.findAllByTournamentIdAndStatus(
                                tournamentId,
                                status,
                                pageable
                        ))
                        .map(this::toResponse)
        );
    }

    @Transactional(readOnly = true)
    public RegistrationResponse get(UUID registrationId, UUID actorId) {
        TournamentRegistration registration = requireRegistration(registrationId);
        try {
            teamAccessService.requireManager(registration.getTeam().getId(), actorId);
        } catch (ForbiddenException exception) {
            tournamentAccessService.requireManager(
                    registration.getTournament().getId(),
                    actorId
            );
        }
        return toResponse(registration);
    }

    @Transactional
    public RegistrationResponse review(
            UUID registrationId,
            UUID actorId,
            RegistrationReviewRequest request
    ) {
        TournamentRegistration registration = requireRegistration(registrationId);
        tournamentAccessService.requireManager(
                registration.getTournament().getId(),
                actorId
        );
        if (!Set.of(
                RegistrationStatus.APPROVED,
                RegistrationStatus.REJECTED,
                RegistrationStatus.WAITLISTED
        ).contains(request.status())) {
            throw new BadRequestException("Invalid registration review status");
        }
        if (request.status() == RegistrationStatus.APPROVED) {
            long approved = registrationRepository.countByTournamentIdAndStatus(
                    registration.getTournament().getId(),
                    RegistrationStatus.APPROVED
            );
            if (registration.getStatus() != RegistrationStatus.APPROVED
                    && approved >= registration.getTournament().getMaximumTeams()) {
                throw new ConflictException("Approved team capacity has been reached");
            }
        }
        registration.setStatus(request.status());
        registration.setReviewNotes(request.reviewNotes());
        registration.setReviewedBy(requireUser(actorId));
        registration.setReviewedAt(LocalDateTime.now(ZoneOffset.UTC));
        return toResponse(registration);
    }

    @Transactional
    public RegistrationResponse withdraw(UUID registrationId, UUID actorId) {
        TournamentRegistration registration = requireRegistration(registrationId);
        teamAccessService.requireManager(registration.getTeam().getId(), actorId);
        if (registration.getTournament().getStatus() == TournamentStatus.IN_PROGRESS
                || registration.getTournament().getStatus() == TournamentStatus.COMPLETED) {
            throw new BadRequestException("Registration can no longer be withdrawn");
        }
        registration.setStatus(RegistrationStatus.WITHDRAWN);
        return toResponse(registration);
    }

    private void validateWindow(Tournament tournament) {
        if (tournament.getStatus() != TournamentStatus.REGISTRATION_OPEN) {
            throw new BadRequestException("Tournament registration is not open");
        }
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        if (tournament.getRegistrationOpensAt() != null
                && now.isBefore(tournament.getRegistrationOpensAt())) {
            throw new BadRequestException("Tournament registration has not opened");
        }
        if (tournament.getRegistrationClosesAt() != null
                && now.isAfter(tournament.getRegistrationClosesAt())) {
            throw new BadRequestException("Tournament registration has closed");
        }
    }

    private List<TeamMember> validateRoster(
            Tournament tournament,
            Team team,
            List<UUID> rosterMemberIds
    ) {
        List<TeamMember> roster = teamMemberRepository.findAllById(rosterMemberIds);
        if (roster.size() != rosterMemberIds.stream().distinct().count()) {
            throw new BadRequestException("One or more roster members are invalid");
        }
        if (roster.stream().anyMatch(member ->
                !member.getTeam().getId().equals(team.getId()) || !member.isActive())) {
            throw new BadRequestException("Roster contains unavailable team members");
        }
        if (roster.size() < tournament.getMinimumRosterSize()
                || roster.size() > tournament.getMaximumRosterSize()) {
            throw new BadRequestException("Selected roster size is outside tournament limits");
        }
        if (!tournament.isAllowSubstitutes()
                && roster.stream().anyMatch(member -> member.getRole() == RosterRole.SUBSTITUTE)) {
            throw new BadRequestException("This tournament does not allow substitutes");
        }
        return roster;
    }

    private Map<RegistrationFormField, List<String>> validateAnswers(
            List<RegistrationFormField> fields,
            Map<String, List<String>> submittedAnswers
    ) {
        Map<String, List<String>> normalized = new LinkedHashMap<>();
        submittedAnswers.forEach((key, values) ->
                normalized.put(key.toLowerCase(Locale.ROOT), values));
        Set<String> fieldKeys = fields.stream()
                .map(RegistrationFormField::getFieldKey)
                .collect(java.util.stream.Collectors.toSet());
        normalized.keySet().stream()
                .filter(key -> !fieldKeys.contains(key))
                .findFirst()
                .ifPresent(key -> {
                    throw new BadRequestException("Unknown registration field: " + key);
                });

        Map<RegistrationFormField, List<String>> result = new LinkedHashMap<>();
        for (RegistrationFormField field : fields) {
            List<String> values = normalized.getOrDefault(field.getFieldKey(), List.of())
                    .stream()
                    .map(value -> value == null ? "" : value.trim())
                    .filter(value -> !value.isEmpty())
                    .toList();
            if (field.isRequired() && values.isEmpty()) {
                throw new BadRequestException(field.getLabel() + " is required");
            }
            if (field.getType() != FormFieldType.MULTI_SELECT && values.size() > 1) {
                throw new BadRequestException(field.getLabel() + " accepts only one value");
            }
            values.forEach(value -> validateAnswer(field, value));
            if (!values.isEmpty()) {
                result.put(field, values);
            }
        }
        return result;
    }

    private void validateAnswer(RegistrationFormField field, String value) {
        if (field.getMinimumLength() != null && value.length() < field.getMinimumLength()) {
            throw new BadRequestException(field.getLabel() + " is too short");
        }
        if (field.getMaximumLength() != null && value.length() > field.getMaximumLength()) {
            throw new BadRequestException(field.getLabel() + " is too long");
        }
        if (field.getValidationPattern() != null
                && !field.getValidationPattern().isBlank()
                && !Pattern.matches(field.getValidationPattern(), value)) {
            throw new BadRequestException(field.getLabel() + " has an invalid value");
        }
        switch (field.getType()) {
            case EMAIL -> {
                if (!value.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
                    throw new BadRequestException(field.getLabel() + " must be a valid email");
                }
            }
            case NUMBER -> {
                try {
                    new java.math.BigDecimal(value);
                } catch (NumberFormatException exception) {
                    throw new BadRequestException(field.getLabel() + " must be a number");
                }
            }
            case DATE -> {
                try {
                    LocalDate.parse(value);
                } catch (java.time.DateTimeException exception) {
                    throw new BadRequestException(field.getLabel() + " must be a valid date");
                }
            }
            case SELECT, MULTI_SELECT -> {
                if (field.getOptions().stream().noneMatch(option -> option.equals(value))) {
                    throw new BadRequestException(field.getLabel() + " contains an invalid option");
                }
            }
            case CHECKBOX -> {
                if (!value.equalsIgnoreCase("true") && !value.equalsIgnoreCase("false")) {
                    throw new BadRequestException(field.getLabel() + " must be true or false");
                }
            }
            default -> {
                // Text and file values use the generic validation above.
            }
        }
    }

    private void snapshotRoster(
            TournamentRegistration registration,
            List<TeamMember> roster
    ) {
        List<RegistrationPlayer> snapshots = roster.stream().map(member -> {
            RegistrationPlayer player = new RegistrationPlayer();
            player.setRegistration(registration);
            player.setUserId(member.getUser().getId());
            player.setFullName(member.getUser().getFullName());
            player.setPlayerUid(member.getPlayerUid());
            player.setInGameName(member.getInGameName());
            player.setRosterRole(member.getRole());
            return player;
        }).toList();
        playerRepository.saveAll(snapshots);
    }

    private void snapshotAnswers(
            TournamentRegistration registration,
            Map<RegistrationFormField, List<String>> answers
    ) {
        List<RegistrationAnswer> snapshots = new ArrayList<>();
        answers.forEach((field, values) -> {
            for (int index = 0; index < values.size(); index++) {
                RegistrationAnswer answer = new RegistrationAnswer();
                answer.setRegistration(registration);
                answer.setFieldKey(field.getFieldKey());
                answer.setFieldLabel(field.getLabel());
                answer.setValue(values.get(index));
                answer.setValueOrder(index);
                snapshots.add(answer);
            }
        });
        answerRepository.saveAll(snapshots);
    }

    private RegistrationResponse toResponse(TournamentRegistration registration) {
        List<RegistrationPlayerResponse> roster = playerRepository
                .findAllByRegistrationIdOrderByRosterRoleAscCreatedAtAsc(registration.getId())
                .stream().map(RegistrationPlayerResponse::from).toList();
        Map<String, List<String>> answers = new LinkedHashMap<>();
        answerRepository.findAllByRegistrationIdOrderByFieldKeyAscValueOrderAsc(
                registration.getId()
        ).forEach(answer -> answers.computeIfAbsent(
                answer.getFieldKey(),
                ignored -> new ArrayList<>()
        ).add(answer.getValue()));
        return RegistrationResponse.from(registration, roster, answers);
    }

    private TournamentRegistration requireRegistration(UUID registrationId) {
        return registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tournament registration not found"
                ));
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
