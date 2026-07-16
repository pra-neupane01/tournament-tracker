package in.neupanepralad.esports.tournament.service;

import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.organization.service.OrganizationAccessService;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TournamentAccessService {

    private final TournamentRepository tournamentRepository;
    private final OrganizationAccessService organizationAccessService;

    public Tournament requireManager(UUID tournamentId, UUID userId) {
        Tournament tournament = requireTournament(tournamentId);
        organizationAccessService.requireManager(tournament.getOrganization().getId(), userId);
        return tournament;
    }

    public Tournament requireTournament(UUID tournamentId) {
        return tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }
}
