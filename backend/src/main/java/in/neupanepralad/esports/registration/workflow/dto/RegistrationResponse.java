package in.neupanepralad.esports.registration.workflow.dto;

import in.neupanepralad.esports.registration.workflow.model.RegistrationStatus;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record RegistrationResponse(
        UUID id,
        UUID tournamentId,
        UUID teamId,
        String teamName,
        RegistrationStatus status,
        LocalDateTime submittedAt,
        String submittedBy,
        LocalDateTime reviewedAt,
        String reviewedBy,
        String reviewNotes,
        List<RegistrationPlayerResponse> roster,
        Map<String, List<String>> answers
) {
    public static RegistrationResponse from(
            TournamentRegistration registration,
            List<RegistrationPlayerResponse> roster,
            Map<String, List<String>> answers
    ) {
        return new RegistrationResponse(
                registration.getId(),
                registration.getTournament().getId(),
                registration.getTeam().getId(),
                registration.getTeam().getName(),
                registration.getStatus(),
                registration.getSubmittedAt(),
                registration.getSubmittedBy().getFullName(),
                registration.getReviewedAt(),
                registration.getReviewedBy() == null
                        ? null
                        : registration.getReviewedBy().getFullName(),
                registration.getReviewNotes(),
                roster,
                answers
        );
    }
}
