package in.neupanepralad.esports.tournament;

import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.game.model.GamePlatform;
import in.neupanepralad.esports.game.repository.GameRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TournamentIntegrationTests {

    @Autowired MockMvc mockMvc;
    @Autowired GameRepository gameRepository;

    @Test
    void organizationOwnerCanCreateTournamentAndRules() throws Exception {
        String token = register();
        String organizationId = createOrganization(token);

        Game game = new Game();
        game.setName("eFootball");
        game.setSlug("efootball");
        game.setPlatform(GamePlatform.CROSS_PLATFORM);
        game.setTeamSize(1);
        game.setSubstituteLimit(1);
        game.setActive(true);
        gameRepository.save(game);

        String tournamentResponse = mockMvc.perform(post("/tournaments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "organizationId": "%s",
                                  "gameId": "%s",
                                  "name": "National eFootball Cup",
                                  "slug": "national-efootball-cup",
                                  "format": "SINGLE_ELIMINATION",
                                  "timeZone": "Asia/Katmandu",
                                  "startsAt": "2026-09-10T10:00:00",
                                  "endsAt": "2026-09-12T18:00:00",
                                  "registrationOpensAt": "2026-08-01T00:00:00",
                                  "registrationClosesAt": "2026-09-01T23:59:00",
                                  "minimumTeams": 8,
                                  "maximumTeams": 64,
                                  "minimumRosterSize": 1,
                                  "maximumRosterSize": 2,
                                  "allowSubstitutes": true,
                                  "publicVisible": true
                                }
                                """.formatted(organizationId, game.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andReturn().getResponse().getContentAsString();
        String tournamentId = extract(tournamentResponse, "id");

        mockMvc.perform(post("/tournaments/" + tournamentId + "/rules")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Fair Play",
                                  "content": "Players must use registered accounts.",
                                  "sortOrder": 1
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Fair Play"));
    }

    private String register() throws Exception {
        String response = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Tournament Owner",
                                  "email": "tournament-owner@example.com",
                                  "password": "secure-pass-123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return extract(response, "accessToken");
    }

    private String createOrganization(String token) throws Exception {
        String response = mockMvc.perform(post("/organizations")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Tournament Org",
                                  "type": "ESPORTS_ORGANIZATION"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return extract(response, "id");
    }

    private String extract(String json, String field) {
        String marker = "\"" + field + "\":\"";
        int start = json.indexOf(marker) + marker.length();
        return json.substring(start, json.indexOf('"', start));
    }
}
