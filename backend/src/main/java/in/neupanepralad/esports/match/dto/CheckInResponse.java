package in.neupanepralad.esports.match.dto;

import in.neupanepralad.esports.match.model.CheckInStatus;
import in.neupanepralad.esports.match.model.FixtureCheckIn;

import java.time.LocalDateTime;
import java.util.UUID;

public record CheckInResponse(
        UUID id,
        UUID registrationId,
        UUID teamId,
        String teamName,
        CheckInStatus status,
        LocalDateTime checkedInAt,
        String checkedInBy
) {
    public static CheckInResponse from(FixtureCheckIn checkIn) {
        return new CheckInResponse(
                checkIn.getId(),
                checkIn.getRegistration().getId(),
                checkIn.getRegistration().getTeam().getId(),
                checkIn.getRegistration().getTeam().getName(),
                checkIn.getStatus(),
                checkIn.getCheckedInAt(),
                checkIn.getCheckedInBy().getFullName()
        );
    }
}
