package in.neupanepralad.esports.team;

import in.neupanepralad.esports.game.model.Game;
import in.neupanepralad.esports.game.model.GamePlatform;
import in.neupanepralad.esports.game.repository.GameRepository;
import in.neupanepralad.esports.team.repository.TeamMemberRepository;
import in.neupanepralad.esports.team.repository.TeamRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TeamIntegrationTests {

    @Autowired MockMvc mockMvc;
    @Autowired GameRepository gameRepository;
    @Autowired TeamRepository teamRepository;
    @Autowired TeamMemberRepository teamMemberRepository;

    @Test
    void managerCanCreateTeamAndBuildRoster() throws Exception {
        String managerToken = register("Manager", "manager@example.com");
        register("Player", "roster@example.com");

        Game game = new Game();
        game.setName("PUBG Mobile");
        game.setSlug("pubg-mobile");
        game.setPlatform(GamePlatform.MOBILE);
        game.setTeamSize(4);
        game.setSubstituteLimit(2);
        game.setActive(true);
        gameRepository.save(game);

        String teamResponse = mockMvc.perform(post("/teams")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Himalayan Squad",
                                  "shortName": "HMS",
                                  "gameId": "%s"
                                }
                                """.formatted(game.getId())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String teamId = extract(teamResponse, "id");

        mockMvc.perform(post("/teams/" + teamId + "/roster")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "roster@example.com",
                                  "playerUid": "PUBG-1001",
                                  "inGameName": "HimalayanAce",
                                  "role": "STARTER",
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.inGameName").value("HimalayanAce"));

        mockMvc.perform(get("/teams/" + teamId + "/roster")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    private String register(String name, String email) throws Exception {
        String response = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "%s",
                                  "email": "%s",
                                  "password": "secure-pass-123"
                                }
                                """.formatted(name, email)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return extract(response, "accessToken");
    }

    private String extract(String json, String field) {
        String marker = "\"" + field + "\":\"";
        int start = json.indexOf(marker) + marker.length();
        return json.substring(start, json.indexOf('"', start));
    }
}
