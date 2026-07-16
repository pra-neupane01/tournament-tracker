package in.neupanepralad.esports.team.service;

import in.neupanepralad.esports.common.exception.ForbiddenException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.organization.service.OrganizationAccessService;
import in.neupanepralad.esports.team.model.Team;
import in.neupanepralad.esports.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeamAccessService {

    private final TeamRepository teamRepository;
    private final OrganizationAccessService organizationAccessService;

    public Team requireManager(UUID teamId, UUID userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        if (team.getManager().getId().equals(userId)) {
            return team;
        }
        if (team.getOrganization() != null) {
            try {
                organizationAccessService.requireManager(team.getOrganization().getId(), userId);
                return team;
            } catch (ForbiddenException ignored) {
                // Fall through to the team-specific error.
            }
        }
        throw new ForbiddenException("Team manager access is required");
    }
}
