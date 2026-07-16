package in.neupanepralad.esports.registration.workflow.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record RegistrationSubmitRequest(
        @NotNull UUID teamId,
        @NotEmpty @Size(max = 100) List<UUID> rosterMemberIds,
        @NotNull Map<String, @Size(max = 100) List<@Size(max = 10000) String>> answers
) {
}
