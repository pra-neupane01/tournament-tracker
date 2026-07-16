package in.neupanepralad.esports.organization.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ConflictException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.organization.dto.MembershipRequest;
import in.neupanepralad.esports.organization.dto.MembershipResponse;
import in.neupanepralad.esports.organization.dto.OrganizationRequest;
import in.neupanepralad.esports.organization.dto.OrganizationResponse;
import in.neupanepralad.esports.organization.model.MembershipRole;
import in.neupanepralad.esports.organization.model.Organization;
import in.neupanepralad.esports.organization.model.OrganizationMembership;
import in.neupanepralad.esports.organization.repository.OrganizationMembershipRepository;
import in.neupanepralad.esports.organization.repository.OrganizationRepository;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final OrganizationAccessService accessService;
    private final UserRepository userRepository;

    @Transactional
    public OrganizationResponse create(UUID creatorId, OrganizationRequest request) {
        Organization organization = new Organization();
        apply(organization, request);
        organizationRepository.save(organization);

        OrganizationMembership owner = new OrganizationMembership();
        owner.setOrganization(organization);
        owner.setUser(requireUser(creatorId));
        owner.setRole(MembershipRole.OWNER);
        membershipRepository.save(owner);
        return OrganizationResponse.from(organization);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrganizationResponse> list(String query, int page, int size) {
        PageRequest pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
        Page<OrganizationResponse> result = (query == null || query.isBlank()
                ? organizationRepository.findAll(pageable)
                : organizationRepository.findByNameContainingIgnoreCase(query.trim(), pageable))
                .map(OrganizationResponse::from);
        return PagedResponse.of(result);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse get(UUID organizationId) {
        return OrganizationResponse.from(requireOrganization(organizationId));
    }

    @Transactional
    public OrganizationResponse update(
            UUID organizationId,
            UUID actorId,
            OrganizationRequest request
    ) {
        accessService.requireManager(organizationId, actorId);
        Organization organization = requireOrganization(organizationId);
        apply(organization, request);
        return OrganizationResponse.from(organization);
    }

    @Transactional
    public void delete(UUID organizationId, UUID actorId) {
        accessService.requireManager(organizationId, actorId);
        membershipRepository.deleteAllByOrganizationId(organizationId);
        organizationRepository.delete(requireOrganization(organizationId));
    }

    @Transactional(readOnly = true)
    public List<MembershipResponse> listMembers(UUID organizationId, UUID actorId) {
        if (!accessService.isMember(organizationId, actorId)) {
            throw new in.neupanepralad.esports.common.exception.ForbiddenException(
                    "Organization membership is required"
            );
        }
        return membershipRepository.findAllByOrganizationIdOrderByCreatedAtAsc(organizationId)
                .stream()
                .map(MembershipResponse::from)
                .toList();
    }

    @Transactional
    public MembershipResponse addMember(
            UUID organizationId,
            UUID actorId,
            MembershipRequest request
    ) {
        accessService.requireManager(organizationId, actorId);
        if (request.role() == MembershipRole.OWNER) {
            throw new BadRequestException("Ownership cannot be assigned through this endpoint");
        }
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (membershipRepository.findByOrganizationIdAndUserId(organizationId, user.getId())
                .isPresent()) {
            throw new ConflictException("User is already an organization member");
        }
        OrganizationMembership membership = new OrganizationMembership();
        membership.setOrganization(requireOrganization(organizationId));
        membership.setUser(user);
        membership.setRole(request.role());
        return MembershipResponse.from(membershipRepository.save(membership));
    }

    @Transactional
    public MembershipResponse updateMemberRole(
            UUID organizationId,
            UUID membershipId,
            UUID actorId,
            MembershipRole role
    ) {
        accessService.requireManager(organizationId, actorId);
        OrganizationMembership membership = requireMembership(organizationId, membershipId);
        if (membership.getRole() == MembershipRole.OWNER || role == MembershipRole.OWNER) {
            throw new BadRequestException("Organization ownership cannot be changed here");
        }
        membership.setRole(role);
        return MembershipResponse.from(membership);
    }

    @Transactional
    public void removeMember(UUID organizationId, UUID membershipId, UUID actorId) {
        accessService.requireManager(organizationId, actorId);
        OrganizationMembership membership = requireMembership(organizationId, membershipId);
        if (membership.getRole() == MembershipRole.OWNER) {
            throw new BadRequestException("The organization owner cannot be removed");
        }
        membershipRepository.delete(membership);
    }

    private void apply(Organization organization, OrganizationRequest request) {
        organization.setName(request.name().trim());
        organization.setType(request.type());
        organization.setDescription(request.description());
        organization.setWebsite(request.website());
        organization.setCountry(request.country());
        organization.setCity(request.city());
    }

    private Organization requireOrganization(UUID organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
    }

    private OrganizationMembership requireMembership(UUID organizationId, UUID membershipId) {
        OrganizationMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));
        if (!membership.getOrganization().getId().equals(organizationId)) {
            throw new ResourceNotFoundException("Membership not found");
        }
        return membership;
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
