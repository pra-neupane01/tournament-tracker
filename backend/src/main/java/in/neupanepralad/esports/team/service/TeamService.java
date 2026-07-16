package in.neupanepralad.esports.team.service;

import in.neupanepralad.esports.common.exception.ConflictException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.game.service.GameService;
import in.neupanepralad.esports.organization.model.Organization;
import in.neupanepralad.esports.organization.repository.OrganizationRepository;
import in.neupanepralad.esports.organization.service.OrganizationAccessService;
import in.neupanepralad.esports.team.dto.RosterMemberRequest;
import in.neupanepralad.esports.team.dto.RosterMemberResponse;
import in.neupanepralad.esports.team.dto.TeamRequest;
import in.neupanepralad.esports.team.dto.TeamResponse;
import in.neupanepralad.esports.team.model.Team;
import in.neupanepralad.esports.team.model.TeamMember;
import in.neupanepralad.esports.team.repository.TeamMemberRepository;
import in.neupanepralad.esports.team.repository.TeamRepository;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamAccessService teamAccessService;
    private final GameService gameService;
    private final OrganizationRepository organizationRepository;
    private final OrganizationAccessService organizationAccessService;
    private final UserRepository userRepository;

    @Transactional
    public TeamResponse create(UUID creatorId, TeamRequest request) {
        if (teamRepository.existsByGameIdAndNameIgnoreCase(request.gameId(), request.name())) {
            throw new ConflictException("A team with this name already exists for the game");
        }
        Game game = gameService.requireGame(request.gameId());
        Organization organization = null;
        if (request.organizationId() != null) {
            organizationAccessService.requireManager(request.organizationId(), creatorId);
            organization = organizationRepository.findById(request.organizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        }
        Team team = new Team();
        team.setManager(requireUser(creatorId));
        team.setGame(game);
        team.setOrganization(organization);
        apply(team, request);
        return TeamResponse.from(teamRepository.save(team));
    }

    @Transactional(readOnly = true)
    public PagedResponse<TeamResponse> list(UUID gameId, int page, int size) {
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.ASC, "name")
        );
        Page<Team> teams = gameId == null
                ? teamRepository.findAll(pageable)
                : teamRepository.findAllByGameId(gameId, pageable);
        return PagedResponse.of(teams.map(TeamResponse::from));
    }

    @Transactional(readOnly = true)
    public TeamResponse get(UUID teamId) {
        return TeamResponse.from(requireTeam(teamId));
    }

    @Transactional
    public TeamResponse update(UUID teamId, UUID actorId, TeamRequest request) {
        Team team = teamAccessService.requireManager(teamId, actorId);
        teamRepository.findByGameIdAndNameIgnoreCase(request.gameId(), request.name())
                .filter(existing -> !existing.getId().equals(teamId))
                .ifPresent(existing -> {
                    throw new ConflictException("A team with this name already exists for the game");
                });
        team.setGame(gameService.requireGame(request.gameId()));
        if (request.organizationId() == null) {
            team.setOrganization(null);
        } else {
            organizationAccessService.requireManager(request.organizationId(), actorId);
            team.setOrganization(organizationRepository.findById(request.organizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found")));
        }
        apply(team, request);
        return TeamResponse.from(team);
    }

    @Transactional
    public void delete(UUID teamId, UUID actorId) {
        Team team = teamAccessService.requireManager(teamId, actorId);
        teamMemberRepository.deleteAllByTeamId(teamId);
        teamRepository.delete(team);
    }

    @Transactional(readOnly = true)
    public List<RosterMemberResponse> roster(UUID teamId) {
        requireTeam(teamId);
        return teamMemberRepository.findAllByTeamIdOrderByRoleAscCreatedAtAsc(teamId)
                .stream().map(RosterMemberResponse::from).toList();
    }

    @Transactional
    public RosterMemberResponse addRosterMember(
            UUID teamId,
            UUID actorId,
            RosterMemberRequest request
    ) {
        Team team = teamAccessService.requireManager(teamId, actorId);
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId()).isPresent()) {
            throw new ConflictException("User is already on the roster");
        }
        if (teamMemberRepository.existsByTeamIdAndPlayerUidIgnoreCase(
                teamId,
                request.playerUid()
        )) {
            throw new ConflictException("Player UID is already on the roster");
        }
        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(user);
        apply(member, request);
        return RosterMemberResponse.from(teamMemberRepository.save(member));
    }

    @Transactional
    public RosterMemberResponse updateRosterMember(
            UUID teamId,
            UUID memberId,
            UUID actorId,
            RosterMemberRequest request
    ) {
        teamAccessService.requireManager(teamId, actorId);
        TeamMember member = requireMember(teamId, memberId);
        teamMemberRepository.findAllByTeamIdOrderByRoleAscCreatedAtAsc(teamId).stream()
                .filter(existing -> !existing.getId().equals(memberId))
                .filter(existing -> existing.getPlayerUid().equalsIgnoreCase(request.playerUid()))
                .findFirst()
                .ifPresent(existing -> {
                    throw new ConflictException("Player UID is already on the roster");
                });
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .filter(existing -> !existing.getId().equals(memberId))
                .ifPresent(existing -> {
                    throw new ConflictException("User is already on the roster");
                });
        member.setUser(user);
        apply(member, request);
        return RosterMemberResponse.from(member);
    }

    @Transactional
    public void removeRosterMember(UUID teamId, UUID memberId, UUID actorId) {
        teamAccessService.requireManager(teamId, actorId);
        teamMemberRepository.delete(requireMember(teamId, memberId));
    }

    public Team requireTeam(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }

    private TeamMember requireMember(UUID teamId, UUID memberId) {
        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Roster member not found"));
        if (!member.getTeam().getId().equals(teamId)) {
            throw new ResourceNotFoundException("Roster member not found");
        }
        return member;
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void apply(Team team, TeamRequest request) {
        team.setName(request.name().trim());
        team.setShortName(request.shortName());
        team.setLogoUrl(request.logoUrl());
    }

    private void apply(TeamMember member, RosterMemberRequest request) {
        member.setPlayerUid(request.playerUid().trim());
        member.setInGameName(request.inGameName().trim());
        member.setRole(request.role());
        member.setActive(request.active());
    }
}
