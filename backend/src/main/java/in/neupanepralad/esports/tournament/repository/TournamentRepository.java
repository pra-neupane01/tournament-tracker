package in.neupanepralad.esports.tournament.repository;

import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.tournament.model.TournamentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface TournamentRepository extends JpaRepository<Tournament, UUID> {
        boolean existsBySlugIgnoreCase(String slug);

        Optional<Tournament> findBySlugIgnoreCase(String slug);

        @Query("""
                        SELECT tournament
                        FROM Tournament tournament
                        JOIN FETCH tournament.organization
                        JOIN FETCH tournament.game
                        WHERE tournament.publicVisible = true
                                AND tournament.status IN :statuses
                        ORDER BY tournament.startsAt ASC
                        """)
        List<Tournament> findDiscoverable(@Param("statuses") List<TournamentStatus> statuses);

        @Query("""
                        SELECT tournament
                        FROM Tournament tournament
                        WHERE (:organizationId IS NULL OR tournament.organization.id = :organizationId)
                          AND (:gameId IS NULL OR tournament.game.id = :gameId)
                          AND (:status IS NULL OR tournament.status = :status)
                          AND (:query IS NULL
                               OR LOWER(tournament.name) LIKE LOWER(CONCAT('%', :query, '%')))
                        """)
        Page<Tournament> search(
                        @Param("organizationId") UUID organizationId,
                        @Param("gameId") UUID gameId,
                        @Param("status") TournamentStatus status,
                        @Param("query") String query,
                        Pageable pageable);
}
