package in.neupanepralad.esports.competition.dto;

import in.neupanepralad.esports.competition.model.FixtureParticipant;

import java.util.UUID;

public record FixtureParticipantResponse(
        UUID registrationId,
        UUID teamId,
        String teamName,
        int slotNumber,
        int seed
) {
    public static FixtureParticipantResponse from(FixtureParticipant participant) {
        return new FixtureParticipantResponse(
                participant.getRegistration().getId(),
                participant.getRegistration().getTeam().getId(),
                participant.getRegistration().getTeam().getName(),
                participant.getSlotNumber(),
                participant.getSeed()
        );
    }
}
