package in.neupanepralad.esports.registration.form.repository;

import in.neupanepralad.esports.registration.form.model.RegistrationFormField;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RegistrationFormFieldRepository
        extends JpaRepository<RegistrationFormField, UUID> {

    List<RegistrationFormField> findAllByTournamentIdOrderBySortOrderAsc(UUID tournamentId);

    Optional<RegistrationFormField> findByTournamentIdAndFieldKeyIgnoreCase(
            UUID tournamentId,
            String fieldKey
    );

    void deleteAllByTournamentId(UUID tournamentId);
}
