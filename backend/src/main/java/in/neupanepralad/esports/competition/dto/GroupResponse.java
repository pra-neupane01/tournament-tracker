package in.neupanepralad.esports.competition.dto;

import in.neupanepralad.esports.competition.model.StageGroup;

import java.util.List;
import java.util.UUID;

public record GroupResponse(
        UUID id,
        String name,
        int groupNumber,
        List<GroupParticipantResponse> participants
) {
    public static GroupResponse from(
            StageGroup group,
            List<GroupParticipantResponse> participants
    ) {
        return new GroupResponse(group.getId(), group.getName(), group.getGroupNumber(), participants);
    }
}
