package in.neupanepralad.esports.competition.dto;

import in.neupanepralad.esports.competition.model.StageGroupParticipant;

import java.util.UUID;

public record GroupParticipantResponse(
        UUID registrationId,
        UUID teamId,
        String teamName,
        int seed
) {
    public static GroupParticipantResponse from(StageGroupParticipant participant) {
        return new GroupParticipantResponse(
                participant.getRegistration().getId(),
                participant.getRegistration().getTeam().getId(),
                participant.getRegistration().getTeam().getName(),
                participant.getSeed()
        );
    }
}
