package in.neupanepralad.esports.organization.dto;

import in.neupanepralad.esports.organization.model.Organization;
import in.neupanepralad.esports.organization.model.OrganizationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String name,
        OrganizationType type,
        String description,
        String website,
        String country,
        String city,
        boolean verified,
        LocalDateTime createdAt
) {
    public static OrganizationResponse from(Organization organization) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getName(),
                organization.getType(),
                organization.getDescription(),
                organization.getWebsite(),
                organization.getCountry(),
                organization.getCity(),
                organization.isVerified(),
                organization.getCreatedAt()
        );
    }
}
