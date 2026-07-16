package in.neupanepralad.esports.tournament.dto;

import in.neupanepralad.esports.tournament.model.TournamentStatus;
import jakarta.validation.constraints.NotNull;

public record TournamentStatusRequest(@NotNull TournamentStatus status) {
}
