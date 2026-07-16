package in.neupanepralad.esports.competition;

import in.neupanepralad.esports.competition.dto.StageRequest;
import in.neupanepralad.esports.competition.model.StageStatus;
import in.neupanepralad.esports.competition.model.StageType;
import in.neupanepralad.esports.competition.repository.FixtureRepository;
import in.neupanepralad.esports.competition.service.CompetitionService;
import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.game.model.GamePlatform;
import in.neupanepralad.esports.game.repository.GameRepository;
import in.neupanepralad.esports.organization.model.MembershipRole;
import in.neupanepralad.esports.organization.model.Organization;
import in.neupanepralad.esports.organization.model.OrganizationMembership;
import in.neupanepralad.esports.organization.model.OrganizationType;
import in.neupanepralad.esports.organization.repository.OrganizationMembershipRepository;
import in.neupanepralad.esports.organization.repository.OrganizationRepository;
import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.team.model.Team;
import in.neupanepralad.esports.team.repository.TeamRepository;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.model.TournamentFormat;
import in.neupanepralad.esports.tournament.repository.TournamentRepository;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CompetitionServiceTests {

    @Autowired CompetitionService competitionService;
    @Autowired FixtureRepository fixtureRepository;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired OrganizationRepository organizationRepository;
    @Autowired OrganizationMembershipRepository membershipRepository;
    @Autowired GameRepository gameRepository;
    @Autowired TournamentRepository tournamentRepository;
    @Autowired TeamRepository teamRepository;
    @Autowired TournamentRegistrationRepository registrationRepository;

    @Test
    void groupStageGenerationDistributesApprovedTeamsAndCreatesRoundRobinFixtures() {
        User owner = user();
        Organization organization = organization(owner);
        Game game = game();
        Tournament tournament = tournament(owner, organization, game);
        for (int index = 1; index <= 4; index++) {
            approvedRegistration(tournament, team(owner, organization, game, index), owner, index);
        }

        var stage = competitionService.createStage(
                tournament.getId(),
                owner.getId(),
                new StageRequest(
                        "Group Stage",
                        StageType.GROUP_STAGE,
                        StageStatus.DRAFT,
                        1,
                        1,
                        2
                )
        );
        competitionService.generate(stage.id(), owner.getId(), 2);

        assertThat(competitionService.listGroups(stage.id())).hasSize(2);
        assertThat(fixtureRepository.findAllByStageIdOrderByRoundNumberAscMatchNumberAsc(
                stage.id()
        )).hasSize(2);
    }

    private User user() {
        User user = new User();
        user.setFullName("Competition Owner");
        user.setEmail("competition-owner@example.com");
        user.setPasswordHash(passwordEncoder.encode("secure-pass-123"));
        return userRepository.save(user);
    }

    private Organization organization(User owner) {
        Organization organization = new Organization();
        organization.setName("Competition Org");
        organization.setType(OrganizationType.ESPORTS_ORGANIZATION);
        organizationRepository.save(organization);
        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(organization);
        membership.setUser(owner);
        membership.setRole(MembershipRole.OWNER);
        membershipRepository.save(membership);
        return organization;
    }

    private Game game() {
        Game game = new Game();
        game.setName("Competition Game");
        game.setSlug("competition-game");
        game.setPlatform(GamePlatform.PC);
        game.setTeamSize(1);
        game.setSubstituteLimit(0);
        return gameRepository.save(game);
    }

    private Tournament tournament(User owner, Organization organization, Game game) {
        Tournament tournament = new Tournament();
        tournament.setOrganization(organization);
        tournament.setGame(game);
        tournament.setCreatedBy(owner);
        tournament.setName("Competition Cup");
        tournament.setSlug("competition-cup");
        tournament.setFormat(TournamentFormat.ROUND_ROBIN);
        tournament.setTimeZone("UTC");
        tournament.setStartsAt(LocalDateTime.now().plusDays(1));
        tournament.setMinimumTeams(2);
        tournament.setMaximumTeams(16);
        tournament.setMinimumRosterSize(1);
        tournament.setMaximumRosterSize(1);
        return tournamentRepository.save(tournament);
    }

    private Team team(
            User owner,
            Organization organization,
            Game game,
            int index
    ) {
        Team team = new Team();
        team.setName("Competition Team " + index);
        team.setManager(owner);
        team.setOrganization(organization);
        team.setGame(game);
        return teamRepository.save(team);
    }

    private void approvedRegistration(
            Tournament tournament,
            Team team,
            User owner,
            int index
    ) {
        TournamentRegistration registration = new TournamentRegistration();
        registration.setTournament(tournament);
        registration.setTeam(team);
        registration.setSubmittedBy(owner);
        registration.setSubmittedAt(LocalDateTime.now().plusMinutes(index));
        registration.setStatus(RegistrationStatus.APPROVED);
        registrationRepository.save(registration);
    }
}
