package in.neupanepralad.esports.tournament.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ConflictException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.game.service.GameService;
import in.neupanepralad.esports.organization.repository.OrganizationRepository;
import in.neupanepralad.esports.organization.service.OrganizationAccessService;
import in.neupanepralad.esports.tournament.dto.TournamentRequest;
import in.neupanepralad.esports.tournament.dto.TournamentResponse;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.model.TournamentStatus;
import in.neupanepralad.esports.tournament.repository.TournamentRepository;
import in.neupanepralad.esports.tournament.repository.TournamentRuleRepository;
import in.neupanepralad.esports.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentRuleRepository ruleRepository;
    private final TournamentAccessService accessService;
    private final OrganizationAccessService organizationAccessService;
    private final OrganizationRepository organizationRepository;
    private final GameService gameService;
    private final UserRepository userRepository;

    @Transactional
    public TournamentResponse create(UUID actorId, TournamentRequest request) {
        organizationAccessService.requireManager(request.organizationId(), actorId);
        if (tournamentRepository.existsBySlugIgnoreCase(request.slug())) {
            throw new ConflictException("A tournament with this slug already exists");
        }
        validate(request);
        Tournament tournament = new Tournament();
        tournament.setCreatedBy(userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        tournament.setOrganization(organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found")));
        tournament.setGame(gameService.requireGame(request.gameId()));
        tournament.setStatus(TournamentStatus.DRAFT);
        apply(tournament, request);
        return TournamentResponse.from(tournamentRepository.save(tournament));
    }

    @Transactional(readOnly = true)
    public PagedResponse<TournamentResponse> list(
            UUID organizationId,
            UUID gameId,
            TournamentStatus status,
            String query,
            int page,
            int size
    ) {
        PageRequest pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "startsAt")
        );
        return PagedResponse.of(tournamentRepository.search(
                organizationId,
                gameId,
                status,
                query == null || query.isBlank() ? null : query.trim(),
                pageable
        ).map(TournamentResponse::from));
    }

    @Transactional(readOnly = true)
    public TournamentResponse get(UUID tournamentId) {
        return TournamentResponse.from(accessService.requireTournament(tournamentId));
    }

    @Transactional
    public TournamentResponse update(
            UUID tournamentId,
            UUID actorId,
            TournamentRequest request
    ) {
        Tournament tournament = accessService.requireManager(tournamentId, actorId);
        organizationAccessService.requireManager(request.organizationId(), actorId);
        tournamentRepository.findBySlugIgnoreCase(request.slug())
                .filter(existing -> !existing.getId().equals(tournamentId))
                .ifPresent(existing -> {
                    throw new ConflictException("A tournament with this slug already exists");
                });
        validate(request);
        tournament.setOrganization(organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found")));
        tournament.setGame(gameService.requireGame(request.gameId()));
        apply(tournament, request);
        return TournamentResponse.from(tournament);
    }

    @Transactional
    public TournamentResponse updateStatus(
            UUID tournamentId,
            UUID actorId,
            TournamentStatus status
    ) {
        Tournament tournament = accessService.requireManager(tournamentId, actorId);
        tournament.setStatus(status);
        return TournamentResponse.from(tournament);
    }

    @Transactional
    public void delete(UUID tournamentId, UUID actorId) {
        Tournament tournament = accessService.requireManager(tournamentId, actorId);
        ruleRepository.deleteAllByTournamentId(tournamentId);
        tournamentRepository.delete(tournament);
    }

    private void validate(TournamentRequest request) {
        if (request.minimumTeams() > request.maximumTeams()) {
            throw new BadRequestException("Minimum teams cannot exceed maximum teams");
        }
        if (request.minimumRosterSize() > request.maximumRosterSize()) {
            throw new BadRequestException("Minimum roster size cannot exceed maximum roster size");
        }
        if (request.endsAt() != null && !request.endsAt().isAfter(request.startsAt())) {
            throw new BadRequestException("Tournament end must be after its start");
        }
        if (request.registrationOpensAt() != null
                && request.registrationClosesAt() != null
                && !request.registrationClosesAt().isAfter(request.registrationOpensAt())) {
            throw new BadRequestException("Registration close must be after registration open");
        }
        if (request.registrationClosesAt() != null
                && request.registrationClosesAt().isAfter(request.startsAt())) {
            throw new BadRequestException("Registration must close before the tournament starts");
        }
        try {
            java.time.ZoneId.of(request.timeZone());
        } catch (java.time.DateTimeException exception) {
            throw new BadRequestException("Invalid time zone");
        }
    }

    private void apply(Tournament tournament, TournamentRequest request) {
        tournament.setName(request.name().trim());
        tournament.setSlug(request.slug().trim().toLowerCase(Locale.ROOT));
        tournament.setDescription(request.description());
        tournament.setFormat(request.format());
        tournament.setTimeZone(request.timeZone());
        tournament.setRegistrationOpensAt(request.registrationOpensAt());
        tournament.setRegistrationClosesAt(request.registrationClosesAt());
        tournament.setStartsAt(request.startsAt());
        tournament.setEndsAt(request.endsAt());
        tournament.setMinimumTeams(request.minimumTeams());
        tournament.setMaximumTeams(request.maximumTeams());
        tournament.setMinimumRosterSize(request.minimumRosterSize());
        tournament.setMaximumRosterSize(request.maximumRosterSize());
        tournament.setAllowSubstitutes(request.allowSubstitutes());
        tournament.setPublicVisible(request.publicVisible());
    }
}
