package in.neupanepralad.esports.report.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.competition.repository.FixtureRepository;
import in.neupanepralad.esports.leaderboard.service.LeaderboardService;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.report.model.ReportType;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TournamentReportService {

    private final TournamentRegistrationRepository registrationRepository;
    private final FixtureRepository fixtureRepository;
    private final LeaderboardService leaderboardService;
    private final TournamentAccessService tournamentAccessService;

    @Transactional(readOnly = true)
    public ReportFile generate(
            UUID tournamentId,
            UUID actorId,
            ReportType type,
            UUID stageId
    ) {
        tournamentAccessService.requireManager(tournamentId, actorId);
        String csv = switch (type) {
            case REGISTRATIONS -> registrationsCsv(tournamentId);
            case FIXTURES -> fixturesCsv(tournamentId);
            case LEADERBOARD -> {
                if (stageId == null) {
                    throw new BadRequestException("stageId is required for leaderboard reports");
                }
                yield leaderboardCsv(stageId);
            }
        };
        return new ReportFile(
                type.name().toLowerCase(java.util.Locale.ROOT) + ".csv",
                csv.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String registrationsCsv(UUID tournamentId) {
        StringBuilder csv = new StringBuilder(
                "registration_id,team,status,submitted_by,submitted_at\n"
        );
        registrationRepository.findAllByTournamentIdOrderBySubmittedAtAsc(tournamentId)
                .forEach(registration -> csv
                        .append(csv(registration.getId())).append(',')
                        .append(csv(registration.getTeam().getName())).append(',')
                        .append(csv(registration.getStatus())).append(',')
                        .append(csv(registration.getSubmittedBy().getFullName())).append(',')
                        .append(csv(registration.getSubmittedAt())).append('\n'));
        return csv.toString();
    }

    private String fixturesCsv(UUID tournamentId) {
        StringBuilder csv = new StringBuilder(
                "fixture_id,stage,round,match,status,scheduled_at,venue,winner\n"
        );
        fixtureRepository
                .findAllByStageTournamentIdOrderByStageSequenceNumberAscRoundNumberAscMatchNumberAsc(
                        tournamentId
                )
                .forEach(fixture -> csv
                        .append(csv(fixture.getId())).append(',')
                        .append(csv(fixture.getStage().getName())).append(',')
                        .append(fixture.getRoundNumber()).append(',')
                        .append(fixture.getMatchNumber()).append(',')
                        .append(csv(fixture.getStatus())).append(',')
                        .append(csv(fixture.getScheduledAt())).append(',')
                        .append(csv(fixture.getVenue())).append(',')
                        .append(csv(fixture.getWinner() == null
                                ? null
                                : fixture.getWinner().getTeam().getName()))
                        .append('\n'));
        return csv.toString();
    }

    private String leaderboardCsv(UUID stageId) {
        StringBuilder csv = new StringBuilder(
                "rank,team,matches,wins,placement_total,points,penalties,disqualified,qualified\n"
        );
        leaderboardService.leaderboard(stageId, null).forEach(entry -> csv
                .append(entry.rank()).append(',')
                .append(csv(entry.teamName())).append(',')
                .append(entry.matchesPlayed()).append(',')
                .append(entry.wins()).append(',')
                .append(entry.placementTotal()).append(',')
                .append(entry.points()).append(',')
                .append(entry.penaltyPoints()).append(',')
                .append(entry.disqualified()).append(',')
                .append(entry.qualified()).append('\n'));
        return csv.toString();
    }

    private String csv(Object value) {
        if (value == null) {
            return "";
        }
        String text = value.toString();
        return "\"" + text.replace("\"", "\"\"") + "\"";
    }

    public record ReportFile(String filename, byte[] content) {
    }
}
