package in.neupanepralad.esports.leaderboard.dto;

import in.neupanepralad.esports.leaderboard.model.StageQualification;

import java.util.UUID;

public record QualificationResponse(
        UUID id,
        UUID fromStageId,
        UUID toStageId,
        UUID sourceGroupId,
        UUID registrationId,
        UUID teamId,
        String teamName,
        int sourceRank,
        boolean manual
) {
    public static QualificationResponse from(StageQualification qualification) {
        return new QualificationResponse(
                qualification.getId(),
                qualification.getFromStage().getId(),
                qualification.getToStage().getId(),
                qualification.getSourceGroup() == null
                        ? null
                        : qualification.getSourceGroup().getId(),
                qualification.getRegistration().getId(),
                qualification.getRegistration().getTeam().getId(),
                qualification.getRegistration().getTeam().getName(),
                qualification.getSourceRank(),
                qualification.isManual()
        );
    }
}
