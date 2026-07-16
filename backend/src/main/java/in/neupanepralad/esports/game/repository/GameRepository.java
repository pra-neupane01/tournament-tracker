package in.neupanepralad.esports.game.repository;

import in.neupanepralad.esports.game.model.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GameRepository extends JpaRepository<Game, UUID> {
    boolean existsBySlugIgnoreCase(String slug);

    Optional<Game> findBySlugIgnoreCase(String slug);

    Page<Game> findByActiveTrue(Pageable pageable);
}
