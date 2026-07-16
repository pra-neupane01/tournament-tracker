package in.neupanepralad.esports.leaderboard;

import in.neupanepralad.esports.competition.model.Fixture;
import in.neupanepralad.esports.competition.model.StageStatus;
import in.neupanepralad.esports.competition.model.StageType;
import in.neupanepralad.esports.competition.model.TournamentStage;
import in.neupanepralad.esports.competition.repository.FixtureRepository;
import in.neupanepralad.esports.competition.repository.TournamentStageRepository;
import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.game.model.GamePlatform;
import in.neupanepralad.esports.game.repository.GameRepository;
import in.neupanepralad.esports.leaderboard.dto.QualificationRequest;
import in.neupanepralad.esports.leaderboard.service.LeaderboardService;
import in.neupanepralad.esports.organization.model.MembershipRole;
import in.neupanepralad.esports.organization.model.Organization;
import in.neupanepralad.esports.organization.model.OrganizationMembership;
import in.neupanepralad.esports.organization.model.OrganizationType;
import in.neupanepralad.esports.organization.repository.OrganizationMembershipRepository;
import in.neupanepralad.esports.organization.repository.OrganizationRepository;
import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.result.model.ParticipantResult;
import in.neupanepralad.esports.result.model.ResultSubmission;
import in.neupanepralad.esports.result.model.ResultSubmissionStatus;
import in.neupanepralad.esports.result.repository.ParticipantResultRepository;
import in.neupanepralad.esports.result.repository.ResultSubmissionRepository;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LeaderboardServiceTests {

    @Autowired LeaderboardService leaderboardService;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired OrganizationRepository organizationRepository;
    @Autowired OrganizationMembershipRepository membershipRepository;
    @Autowired GameRepository gameRepository;
    @Autowired TournamentRepository tournamentRepository;
    @Autowired TournamentStageRepository stageRepository;
    @Autowired TeamRepository teamRepository;
    @Autowired TournamentRegistrationRepository registrationRepository;
    @Autowired FixtureRepository fixtureRepository;
    @Autowired ResultSubmissionRepository submissionRepository;
    @Autowired ParticipantResultRepository participantResultRepository;

    @Test
    void confirmedResultsProduceRankedLeaderboardAndQualifications() {
        User owner = owner();
        Organization organization = organization(owner);
        Game game = game();
        Tournament tournament = tournament(owner, organization, game);
        TournamentStage groupStage = stage(tournament, "Groups", 1);
        TournamentStage finalStage = stage(tournament, "Final", 2);
        TournamentRegistration first = registration(
                tournament,
                team(owner, organization, game, "Alpha"),
                owner,
                1
        );
        TournamentRegistration second = registration(
                tournament,
                team(owner, organization, game, "Bravo"),
                owner,
                2
        );

        Fixture fixture = new Fixture();
        fixture.setStage(groupStage);
        fixture.setRoundNumber(1);
        fixture.setMatchNumber(1);
        fixtureRepository.save(fixture);
        ResultSubmission submission = new ResultSubmission();
        submission.setFixture(fixture);
        submission.setSubmittedBy(owner);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(ResultSubmissionStatus.CONFIRMED);
        submissionRepository.save(submission);
        result(submission, first, 1, "12.5");
        result(submission, second, 2, "7.0");

        var leaderboard = leaderboardService.leaderboard(groupStage.getId(), null);
        var qualifications = leaderboardService.qualify(
                groupStage.getId(),
                owner.getId(),
                new QualificationRequest(finalStage.getId(), 1, false)
        );

        assertThat(leaderboard).extracting(entry -> entry.teamName())
                .containsExactly("Alpha", "Bravo");
        assertThat(qualifications).singleElement()
                .extracting(qualification -> qualification.teamName())
                .isEqualTo("Alpha");
    }

    private User owner() {
        User user = new User();
        user.setFullName("Leaderboard Owner");
        user.setEmail("leaderboard-owner@example.com");
        user.setPasswordHash(passwordEncoder.encode("secure-pass-123"));
        return userRepository.save(user);
    }

    private Organization organization(User owner) {
        Organization organization = new Organization();
        organization.setName("Leaderboard Org");
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
        game.setName("Leaderboard Game");
        game.setSlug("leaderboard-game");
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
        tournament.setName("Leaderboard Cup");
        tournament.setSlug("leaderboard-cup");
        tournament.setFormat(TournamentFormat.ROUND_ROBIN);
        tournament.setTimeZone("UTC");
        tournament.setStartsAt(LocalDateTime.now().plusDays(1));
        tournament.setMinimumTeams(2);
        tournament.setMaximumTeams(8);
        tournament.setMinimumRosterSize(1);
        tournament.setMaximumRosterSize(1);
        return tournamentRepository.save(tournament);
    }

    private TournamentStage stage(Tournament tournament, String name, int sequence) {
        TournamentStage stage = new TournamentStage();
        stage.setTournament(tournament);
        stage.setName(name);
        stage.setType(StageType.ROUND_ROBIN);
        stage.setStatus(StageStatus.ACTIVE);
        stage.setSequenceNumber(sequence);
        return stageRepository.save(stage);
    }

    private Team team(
            User owner,
            Organization organization,
            Game game,
            String name
    ) {
        Team team = new Team();
        team.setName(name);
        team.setManager(owner);
        team.setOrganization(organization);
        team.setGame(game);
        return teamRepository.save(team);
    }

    private TournamentRegistration registration(
            Tournament tournament,
            Team team,
            User owner,
            int minute
    ) {
        TournamentRegistration registration = new TournamentRegistration();
        registration.setTournament(tournament);
        registration.setTeam(team);
        registration.setSubmittedBy(owner);
        registration.setSubmittedAt(LocalDateTime.now().plusMinutes(minute));
        registration.setStatus(RegistrationStatus.APPROVED);
        return registrationRepository.save(registration);
    }

    private void result(
            ResultSubmission submission,
            TournamentRegistration registration,
            int placement,
            String points
    ) {
        ParticipantResult result = new ParticipantResult();
        result.setSubmission(submission);
        result.setRegistration(registration);
        result.setPlacement(placement);
        result.setTotalPoints(new BigDecimal(points));
        participantResultRepository.save(result);
    }
}
