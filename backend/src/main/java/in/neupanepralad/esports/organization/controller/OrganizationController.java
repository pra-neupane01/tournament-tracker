package in.neupanepralad.esports.organization.controller;

import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.organization.dto.MembershipRequest;
import in.neupanepralad.esports.organization.dto.MembershipResponse;
import in.neupanepralad.esports.organization.dto.MembershipRoleRequest;
import in.neupanepralad.esports.organization.dto.OrganizationRequest;
import in.neupanepralad.esports.organization.dto.OrganizationResponse;
import in.neupanepralad.esports.organization.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<OrganizationResponse> create(
            Authentication authentication,
            @Valid @RequestBody OrganizationRequest request
    ) {
        return APIResponse.success(
                "Organization created",
                organizationService.create(userId(authentication), request)
        );
    }

    @GetMapping
    public APIResponse<PagedResponse<OrganizationResponse>> list(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return APIResponse.success(
                "Organizations retrieved",
                organizationService.list(query, page, size)
        );
    }

    @GetMapping("/{organizationId}")
    public APIResponse<OrganizationResponse> get(@PathVariable UUID organizationId) {
        return APIResponse.success(
                "Organization retrieved",
                organizationService.get(organizationId)
        );
    }

    @PutMapping("/{organizationId}")
    public APIResponse<OrganizationResponse> update(
            @PathVariable UUID organizationId,
            Authentication authentication,
            @Valid @RequestBody OrganizationRequest request
    ) {
        return APIResponse.success(
                "Organization updated",
                organizationService.update(organizationId, userId(authentication), request)
        );
    }

    @DeleteMapping("/{organizationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID organizationId,
            Authentication authentication
    ) {
        organizationService.delete(organizationId, userId(authentication));
    }

    @GetMapping("/{organizationId}/members")
    public APIResponse<List<MembershipResponse>> listMembers(
            @PathVariable UUID organizationId,
            Authentication authentication
    ) {
        return APIResponse.success(
                "Members retrieved",
                organizationService.listMembers(organizationId, userId(authentication))
        );
    }

    @PostMapping("/{organizationId}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public APIResponse<MembershipResponse> addMember(
            @PathVariable UUID organizationId,
            Authentication authentication,
            @Valid @RequestBody MembershipRequest request
    ) {
        return APIResponse.success(
                "Member added",
                organizationService.addMember(organizationId, userId(authentication), request)
        );
    }

    @PatchMapping("/{organizationId}/members/{membershipId}")
    public APIResponse<MembershipResponse> updateMember(
            @PathVariable UUID organizationId,
            @PathVariable UUID membershipId,
            Authentication authentication,
            @Valid @RequestBody MembershipRoleRequest request
    ) {
        return APIResponse.success(
                "Membership updated",
                organizationService.updateMemberRole(
                        organizationId,
                        membershipId,
                        userId(authentication),
                        request.role()
                )
        );
    }

    @DeleteMapping("/{organizationId}/members/{membershipId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(
            @PathVariable UUID organizationId,
            @PathVariable UUID membershipId,
            Authentication authentication
    ) {
        organizationService.removeMember(
                organizationId,
                membershipId,
                userId(authentication)
        );
    }

    private UUID userId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
