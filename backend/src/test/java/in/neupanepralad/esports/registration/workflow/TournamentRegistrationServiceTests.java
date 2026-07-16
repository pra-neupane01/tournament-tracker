package in.neupanepralad.esports.registration.workflow;

import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.game.model.GamePlatform;
import in.neupanepralad.esports.game.repository.GameRepository;
import in.neupanepralad.esports.organization.model.MembershipRole;
import in.neupanepralad.esports.organization.model.Organization;
import in.neupanepralad.esports.organization.model.OrganizationMembership;
import in.neupanepralad.esports.organization.model.OrganizationType;
import in.neupanepralad.esports.organization.repository.OrganizationMembershipRepository;
import in.neupanepralad.esports.organization.repository.OrganizationRepository;
import in.neupanepralad.esports.registration.form.dto.FormFieldRequest;
import in.neupanepralad.esports.registration.form.model.FormFieldType;
import in.neupanepralad.esports.registration.form.service.RegistrationFormService;
import in.neupanepralad.esports.registration.workflow.dto.RegistrationReviewRequest;
import in.neupanepralad.esports.registration.workflow.dto.RegistrationSubmitRequest;
import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import in.neupanepralad.esports.registration.workflow.service.TournamentRegistrationService;
import in.neupanepralad.esports.team.model.RosterRole;
import in.neupanepralad.esports.team.model.Team;
import in.neupanepralad.esports.team.model.TeamMember;
import in.neupanepralad.esports.team.repository.TeamMemberRepository;
import in.neupanepralad.esports.team.repository.TeamRepository;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.model.TournamentFormat;
import in.neupanepralad.esports.tournament.model.TournamentStatus;
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
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TournamentRegistrationServiceTests {

    @Autowired TournamentRegistrationService registrationService;
    @Autowired RegistrationFormService formService;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired OrganizationRepository organizationRepository;
    @Autowired OrganizationMembershipRepository membershipRepository;
    @Autowired GameRepository gameRepository;
    @Autowired TeamRepository teamRepository;
    @Autowired TeamMemberRepository teamMemberRepository;
    @Autowired TournamentRepository tournamentRepository;

    @Test
    void teamManagerCanSubmitValidatedRegistrationAndOrganizerCanApprove() {
        User owner = user("Workflow Owner", "workflow-owner@example.com");
        User player = user("Workflow Player", "workflow-player@example.com");
        Organization organization = organization(owner);
        Game game = game();
        Team team = team(owner, organization, game);
        TeamMember member = rosterMember(team, player);
        Tournament tournament = tournament(owner, organization, game);

        formService.create(
                tournament.getId(),
                owner.getId(),
                new FormFieldRequest(
                        "contact_email",
                        "Contact email",
                        FormFieldType.EMAIL,
                        null,
                        null,
                        true,
                        null,
                        null,
                        190,
                        1,
                        List.of()
                )
        );

        var registration = registrationService.submit(
                tournament.getId(),
                owner.getId(),
                new RegistrationSubmitRequest(
                        team.getId(),
                        List.of(member.getId()),
                        Map.of("contact_email", List.of("captain@example.com"))
                )
        );

        var approved = registrationService.review(
                registration.id(),
                owner.getId(),
                new RegistrationReviewRequest(RegistrationStatus.APPROVED, "Verified")
        );

        assertThat(approved.status()).isEqualTo(RegistrationStatus.APPROVED);
        assertThat(approved.roster()).hasSize(1);
        assertThat(approved.answers()).containsEntry(
                "contact_email",
                List.of("captain@example.com")
        );
    }

    private User user(String name, String email) {
        User user = new User();
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("secure-pass-123"));
        return userRepository.save(user);
    }

    private Organization organization(User owner) {
        Organization organization = new Organization();
        organization.setName("Workflow Org");
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
        game.setName("Free Fire");
        game.setSlug("free-fire");
        game.setPlatform(GamePlatform.MOBILE);
        game.setTeamSize(1);
        game.setSubstituteLimit(1);
        game.setActive(true);
        return gameRepository.save(game);
    }

    private Team team(User owner, Organization organization, Game game) {
        Team team = new Team();
        team.setName("Workflow Team");
        team.setManager(owner);
        team.setOrganization(organization);
        team.setGame(game);
        return teamRepository.save(team);
    }

    private TeamMember rosterMember(Team team, User player) {
        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(player);
        member.setPlayerUid("FF-1");
        member.setInGameName("WorkflowAce");
        member.setRole(RosterRole.STARTER);
        member.setActive(true);
        return teamMemberRepository.save(member);
    }

    private Tournament tournament(User owner, Organization organization, Game game) {
        Tournament tournament = new Tournament();
        tournament.setOrganization(organization);
        tournament.setGame(game);
        tournament.setCreatedBy(owner);
        tournament.setName("Workflow Cup");
        tournament.setSlug("workflow-cup");
        tournament.setFormat(TournamentFormat.SINGLE_ELIMINATION);
        tournament.setStatus(TournamentStatus.REGISTRATION_OPEN);
        tournament.setTimeZone("UTC");
        tournament.setRegistrationOpensAt(LocalDateTime.now().minusDays(1));
        tournament.setRegistrationClosesAt(LocalDateTime.now().plusDays(1));
        tournament.setStartsAt(LocalDateTime.now().plusDays(5));
        tournament.setMinimumTeams(2);
        tournament.setMaximumTeams(8);
        tournament.setMinimumRosterSize(1);
        tournament.setMaximumRosterSize(2);
        tournament.setAllowSubstitutes(true);
        return tournamentRepository.save(tournament);
    }
}
