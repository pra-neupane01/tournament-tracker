package in.neupanepralad.esports.competition.dto;

import in.neupanepralad.esports.competition.model.StageStatus;
import in.neupanepralad.esports.competition.model.StageType;
import in.neupanepralad.esports.competition.model.TournamentStage;

import java.util.UUID;

public record StageResponse(
        UUID id,
        UUID tournamentId,
        String name,
        StageType type,
        StageStatus status,
        int sequenceNumber,
        int bestOf,
        int qualifiersPerGroup
) {
    public static StageResponse from(TournamentStage stage) {
        return new StageResponse(
                stage.getId(),
                stage.getTournament().getId(),
                stage.getName(),
                stage.getType(),
                stage.getStatus(),
                stage.getSequenceNumber(),
                stage.getBestOf(),
                stage.getQualifiersPerGroup()
        );
    }
}
