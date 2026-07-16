package in.neupanepralad.esports.governance.dto;

import in.neupanepralad.esports.governance.model.Penalty;
import in.neupanepralad.esports.governance.model.PenaltyStatus;
import in.neupanepralad.esports.governance.model.PenaltyType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PenaltyResponse(
        UUID id,
        UUID tournamentId,
        UUID registrationId,
        UUID teamId,
        String teamName,
        UUID fixtureId,
        PenaltyType type,
        PenaltyStatus status,
        BigDecimal pointsDeducted,
        String reason,
        String issuedBy,
        LocalDateTime issuedAt
) {
    public static PenaltyResponse from(Penalty penalty) {
        return new PenaltyResponse(
                penalty.getId(),
                penalty.getTournament().getId(),
                penalty.getRegistration().getId(),
                penalty.getRegistration().getTeam().getId(),
                penalty.getRegistration().getTeam().getName(),
                penalty.getFixture() == null ? null : penalty.getFixture().getId(),
                penalty.getType(),
                penalty.getStatus(),
                penalty.getPointsDeducted(),
                penalty.getReason(),
                penalty.getIssuedBy().getFullName(),
                penalty.getIssuedAt()
        );
    }
}
