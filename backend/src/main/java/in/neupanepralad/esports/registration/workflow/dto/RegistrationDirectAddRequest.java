package in.neupanepralad.esports.registration.workflow.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RegistrationDirectAddRequest(
        @NotNull UUID teamId
) {
}
