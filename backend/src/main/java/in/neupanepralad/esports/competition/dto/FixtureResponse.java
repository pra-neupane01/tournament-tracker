package in.neupanepralad.esports.competition.dto;

import in.neupanepralad.esports.competition.model.Fixture;
import in.neupanepralad.esports.competition.model.FixtureStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record FixtureResponse(
        UUID id,
        UUID stageId,
        UUID groupId,
        String groupName,
        int roundNumber,
        int matchNumber,
        FixtureStatus status,
        UUID winnerRegistrationId,
        LocalDateTime scheduledAt,
        int durationMinutes,
        LocalDateTime checkInOpensAt,
        LocalDateTime checkInClosesAt,
        String venue,
        String streamUrl,
        List<FixtureParticipantResponse> participants
) {
    public static FixtureResponse from(
            Fixture fixture,
            List<FixtureParticipantResponse> participants
    ) {
        return new FixtureResponse(
                fixture.getId(),
                fixture.getStage().getId(),
                fixture.getGroup() == null ? null : fixture.getGroup().getId(),
                fixture.getGroup() == null ? null : fixture.getGroup().getName(),
                fixture.getRoundNumber(),
                fixture.getMatchNumber(),
                fixture.getStatus(),
                fixture.getWinner() == null ? null : fixture.getWinner().getId(),
                fixture.getScheduledAt(),
                fixture.getDurationMinutes(),
                fixture.getCheckInOpensAt(),
                fixture.getCheckInClosesAt(),
                fixture.getVenue(),
                fixture.getStreamUrl(),
                participants
        );
    }
}
