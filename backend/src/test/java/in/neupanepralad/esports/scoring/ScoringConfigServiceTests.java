package in.neupanepralad.esports.scoring;

import in.neupanepralad.esports.competition.model.StageStatus;
import in.neupanepralad.esports.competition.model.StageType;
import in.neupanepralad.esports.competition.model.TournamentStage;
import in.neupanepralad.esports.competition.repository.TournamentStageRepository;
import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.game.model.GamePlatform;
import in.neupanepralad.esports.game.repository.GameRepository;
import in.neupanepralad.esports.organization.model.MembershipRole;
import in.neupanepralad.esports.organization.model.Organization;
import in.neupanepralad.esports.organization.model.OrganizationMembership;
import in.neupanepralad.esports.organization.model.OrganizationType;
import in.neupanepralad.esports.organization.repository.OrganizationMembershipRepository;
import in.neupanepralad.esports.organization.repository.OrganizationRepository;
import in.neupanepralad.esports.scoring.dto.MetricScoringRuleRequest;
import in.neupanepralad.esports.scoring.dto.PlacementScoringRuleRequest;
import in.neupanepralad.esports.scoring.dto.ScoringConfigRequest;
import in.neupanepralad.esports.scoring.service.ScoringConfigService;
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

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ScoringConfigServiceTests {

    @Autowired ScoringConfigService scoringConfigService;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired OrganizationRepository organizationRepository;
    @Autowired OrganizationMembershipRepository membershipRepository;
    @Autowired GameRepository gameRepository;
    @Autowired TournamentRepository tournamentRepository;
    @Autowired TournamentStageRepository stageRepository;

    @Test
    void organizerCanConfigurePlacementAndMetricScoring() {
        User owner = new User();
        owner.setFullName("Scoring Owner");
        owner.setEmail("scoring-owner@example.com");
        owner.setPasswordHash(passwordEncoder.encode("secure-pass-123"));
        userRepository.save(owner);

        Organization organization = new Organization();
        organization.setName("Scoring Org");
        organization.setType(OrganizationType.ESPORTS_ORGANIZATION);
        organizationRepository.save(organization);
        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(organization);
        membership.setUser(owner);
        membership.setRole(MembershipRole.OWNER);
        membershipRepository.save(membership);

        Game game = new Game();
        game.setName("Scoring Game");
        game.setSlug("scoring-game");
        game.setPlatform(GamePlatform.MOBILE);
        game.setTeamSize(4);
        game.setSubstituteLimit(1);
        gameRepository.save(game);

        Tournament tournament = new Tournament();
        tournament.setOrganization(organization);
        tournament.setGame(game);
        tournament.setCreatedBy(owner);
        tournament.setName("Scoring Cup");
        tournament.setSlug("scoring-cup");
        tournament.setFormat(TournamentFormat.BATTLE_ROYALE);
        tournament.setTimeZone("UTC");
        tournament.setStartsAt(LocalDateTime.now().plusDays(1));
        tournament.setMinimumTeams(2);
        tournament.setMaximumTeams(16);
        tournament.setMinimumRosterSize(4);
        tournament.setMaximumRosterSize(5);
        tournamentRepository.save(tournament);

        TournamentStage stage = new TournamentStage();
        stage.setTournament(tournament);
        stage.setName("Final");
        stage.setType(StageType.BATTLE_ROYALE);
        stage.setStatus(StageStatus.DRAFT);
        stage.setSequenceNumber(1);
        stageRepository.save(stage);

        var config = scoringConfigService.save(
                stage.getId(),
                owner.getId(),
                new ScoringConfigRequest(
                        List.of(new MetricScoringRuleRequest(
                                "kills",
                                "Kills",
                                new BigDecimal("1.5"),
                                1
                        )),
                        List.of(new PlacementScoringRuleRequest(
                                1,
                                new BigDecimal("10")
                        ))
                )
        );

        assertThat(config.metricRules()).singleElement()
                .extracting(MetricScoringRuleRequest::metricKey)
                .isEqualTo("kills");
        assertThat(config.placementRules()).hasSize(1);
    }
}
