package in.neupanepralad.esports.organization.dto;

import in.neupanepralad.esports.organization.model.OrganizationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrganizationRequest(
        @NotBlank @Size(max = 160) String name,
        @NotNull OrganizationType type,
        @Size(max = 2000) String description,
        @Size(max = 255) String website,
        @Size(max = 100) String country,
        @Size(max = 100) String city
) {
}
