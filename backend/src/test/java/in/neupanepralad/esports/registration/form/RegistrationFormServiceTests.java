package in.neupanepralad.esports.registration.form;

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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RegistrationFormServiceTests {

    @Autowired RegistrationFormService formService;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired OrganizationRepository organizationRepository;
    @Autowired OrganizationMembershipRepository membershipRepository;
    @Autowired GameRepository gameRepository;
    @Autowired TournamentRepository tournamentRepository;

    @Test
    void managerCanBuildOrderedRegistrationSchema() {
        User owner = new User();
        owner.setFullName("Form Owner");
        owner.setEmail("form-owner@example.com");
        owner.setPasswordHash(passwordEncoder.encode("secure-pass-123"));
        userRepository.save(owner);

        Organization organization = new Organization();
        organization.setName("Form Org");
        organization.setType(OrganizationType.ESPORTS_ORGANIZATION);
        organizationRepository.save(organization);

        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(organization);
        membership.setUser(owner);
        membership.setRole(MembershipRole.OWNER);
        membershipRepository.save(membership);

        Game game = new Game();
        game.setName("Mobile Legends");
        game.setSlug("mobile-legends");
        game.setPlatform(GamePlatform.MOBILE);
        game.setTeamSize(5);
        game.setSubstituteLimit(2);
        gameRepository.save(game);

        Tournament tournament = new Tournament();
        tournament.setOrganization(organization);
        tournament.setGame(game);
        tournament.setCreatedBy(owner);
        tournament.setName("MLBB Cup");
        tournament.setSlug("mlbb-cup");
        tournament.setFormat(TournamentFormat.SINGLE_ELIMINATION);
        tournament.setTimeZone("Asia/Katmandu");
        tournament.setStartsAt(LocalDateTime.now().plusDays(30));
        tournament.setMinimumTeams(4);
        tournament.setMaximumTeams(16);
        tournament.setMinimumRosterSize(5);
        tournament.setMaximumRosterSize(7);
        tournamentRepository.save(tournament);

        formService.create(
                tournament.getId(),
                owner.getId(),
                new FormFieldRequest(
                        "campus",
                        "Campus",
                        FormFieldType.SELECT,
                        "Select your campus",
                        null,
                        true,
                        null,
                        null,
                        null,
                        1,
                        List.of("Kathmandu", "Pokhara")
                )
        );

        assertThat(formService.list(tournament.getId()))
                .singleElement()
                .satisfies(field -> {
                    assertThat(field.fieldKey()).isEqualTo("campus");
                    assertThat(field.options()).containsExactly("Kathmandu", "Pokhara");
                });
    }
}
