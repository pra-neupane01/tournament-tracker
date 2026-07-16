package in.neupanepralad.esports;

import in.neupanepralad.esports.certificate.dto.CertificateIssueRequest;
import in.neupanepralad.esports.certificate.model.CertificateType;
import in.neupanepralad.esports.certificate.service.CertificateService;
import in.neupanepralad.esports.competition.dto.StageRequest;
import in.neupanepralad.esports.competition.model.StageStatus;
import in.neupanepralad.esports.competition.model.StageType;
import in.neupanepralad.esports.competition.repository.FixtureRepository;
import in.neupanepralad.esports.competition.service.CompetitionService;
import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.game.model.GamePlatform;
import in.neupanepralad.esports.game.repository.GameRepository;
import in.neupanepralad.esports.leaderboard.dto.QualificationRequest;
import in.neupanepralad.esports.leaderboard.service.LeaderboardService;
import in.neupanepralad.esports.match.dto.FixtureScheduleRequest;
import in.neupanepralad.esports.match.service.MatchOperationsService;
import in.neupanepralad.esports.organization.model.MembershipRole;
import in.neupanepralad.esports.organization.model.Organization;
import in.neupanepralad.esports.organization.model.OrganizationMembership;
import in.neupanepralad.esports.organization.model.OrganizationType;
import in.neupanepralad.esports.organization.repository.OrganizationMembershipRepository;
import in.neupanepralad.esports.organization.repository.OrganizationRepository;
import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.result.dto.ParticipantResultRequest;
import in.neupanepralad.esports.result.dto.ResultReviewRequest;
import in.neupanepralad.esports.result.dto.ResultSubmissionRequest;
import in.neupanepralad.esports.result.model.ResultSubmissionStatus;
import in.neupanepralad.esports.result.service.ResultService;
import in.neupanepralad.esports.scoring.dto.MetricScoringRuleRequest;
import in.neupanepralad.esports.scoring.dto.PlacementScoringRuleRequest;
import in.neupanepralad.esports.scoring.dto.ScoringConfigRequest;
import in.neupanepralad.esports.scoring.service.ScoringConfigService;
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
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TournamentLifecycleIntegrationTests {

    @Autowired CompetitionService competitionService;
    @Autowired MatchOperationsService matchOperationsService;
    @Autowired ScoringConfigService scoringConfigService;
    @Autowired ResultService resultService;
    @Autowired LeaderboardService leaderboardService;
    @Autowired CertificateService certificateService;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired OrganizationRepository organizationRepository;
    @Autowired OrganizationMembershipRepository membershipRepository;
    @Autowired GameRepository gameRepository;
    @Autowired TournamentRepository tournamentRepository;
    @Autowired TeamRepository teamRepository;
    @Autowired TournamentRegistrationRepository registrationRepository;
    @Autowired FixtureRepository fixtureRepository;

    @Test
    void completeTournamentLifecycleProducesStandingsQualificationAndCertificate() {
        User owner = owner();
        Organization organization = organization(owner);
        Game game = game();
        Tournament tournament = tournament(owner, organization, game);
        TournamentRegistration alpha = registration(
                tournament,
                team(owner, organization, game, "Alpha"),
                owner,
                1
        );
        TournamentRegistration bravo = registration(
                tournament,
                team(owner, organization, game, "Bravo"),
                owner,
                2
        );

        var leagueStage = competitionService.createStage(
                tournament.getId(),
                owner.getId(),
                new StageRequest(
                        "League",
                        StageType.ROUND_ROBIN,
                        StageStatus.DRAFT,
                        1,
                        1,
                        1
                )
        );
        var finalStage = competitionService.createStage(
                tournament.getId(),
                owner.getId(),
                new StageRequest(
                        "Final",
                        StageType.SINGLE_ELIMINATION,
                        StageStatus.DRAFT,
                        2,
                        3,
                        0
                )
        );
        competitionService.generate(leagueStage.id(), owner.getId(), 1);
        var fixture = fixtureRepository
                .findAllByStageIdOrderByRoundNumberAscMatchNumberAsc(leagueStage.id())
                .getFirst();

        LocalDateTime scheduledAt = LocalDateTime.now().plusDays(1);
        matchOperationsService.schedule(
                fixture.getId(),
                owner.getId(),
                new FixtureScheduleRequest(
                        scheduledAt,
                        60,
                        scheduledAt.minusMinutes(30),
                        scheduledAt,
                        "Main Arena",
                        null
                )
        );
        scoringConfigService.save(
                leagueStage.id(),
                owner.getId(),
                new ScoringConfigRequest(
                        List.of(new MetricScoringRuleRequest(
                                "kills",
                                "Kills",
                                BigDecimal.ONE,
                                1
                        )),
                        List.of(
                                new PlacementScoringRuleRequest(1, BigDecimal.TEN),
                                new PlacementScoringRuleRequest(2, new BigDecimal("5"))
                        )
                )
        );
        var submission = resultService.submit(
                fixture.getId(),
                owner.getId(),
                new ResultSubmissionRequest(
                        "Official result",
                        null,
                        List.of(
                                new ParticipantResultRequest(
                                        alpha.getId(),
                                        1,
                                        Map.of("kills", new BigDecimal("3"))
                                ),
                                new ParticipantResultRequest(
                                        bravo.getId(),
                                        2,
                                        Map.of("kills", new BigDecimal("1"))
                                )
                        )
                )
        );
        resultService.review(
                submission.id(),
                owner.getId(),
                new ResultReviewRequest(ResultSubmissionStatus.CONFIRMED, "Verified")
        );

        var standings = leaderboardService.leaderboard(leagueStage.id(), null);
        var qualified = leaderboardService.qualify(
                leagueStage.id(),
                owner.getId(),
                new QualificationRequest(finalStage.id(), 1, false)
        );
        var certificate = certificateService.issue(
                tournament.getId(),
                owner.getId(),
                new CertificateIssueRequest(
                        owner.getId(),
                        alpha.getId(),
                        CertificateType.WINNER,
                        "League Champion"
                )
        );
        var certificatePdf = certificateService.download(certificate.id(), owner.getId());

        assertThat(standings).extracting(entry -> entry.teamName())
                .containsExactly("Alpha", "Bravo");
        assertThat(standings.getFirst().points()).isEqualByComparingTo("13");
        assertThat(qualified).singleElement()
                .extracting(item -> item.teamName())
                .isEqualTo("Alpha");
        assertThat(certificateService.verify(certificate.verificationCode()).revoked())
                .isFalse();
        assertThat(certificatePdf.content()).startsWith(
                "%PDF-1.4".getBytes(java.nio.charset.StandardCharsets.US_ASCII)
        );
    }

    private User owner() {
        User owner = new User();
        owner.setFullName("Lifecycle Owner");
        owner.setEmail("lifecycle-owner@example.com");
        owner.setPasswordHash(passwordEncoder.encode("secure-pass-123"));
        return userRepository.save(owner);
    }

    private Organization organization(User owner) {
        Organization organization = new Organization();
        organization.setName("Lifecycle Org");
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
        game.setName("Lifecycle Game");
        game.setSlug("lifecycle-game");
        game.setPlatform(GamePlatform.PC);
        game.setTeamSize(1);
        game.setSubstituteLimit(0);
        game.setActive(true);
        return gameRepository.save(game);
    }

    private Tournament tournament(User owner, Organization organization, Game game) {
        Tournament tournament = new Tournament();
        tournament.setOrganization(organization);
        tournament.setGame(game);
        tournament.setCreatedBy(owner);
        tournament.setName("Lifecycle Cup");
        tournament.setSlug("lifecycle-cup");
        tournament.setFormat(TournamentFormat.ROUND_ROBIN);
        tournament.setTimeZone("UTC");
        tournament.setStartsAt(LocalDateTime.now().plusDays(2));
        tournament.setMinimumTeams(2);
        tournament.setMaximumTeams(8);
        tournament.setMinimumRosterSize(1);
        tournament.setMaximumRosterSize(1);
        return tournamentRepository.save(tournament);
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
}
