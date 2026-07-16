package in.neupanepralad.esports.registration.workflow.repository;

import in.neupanepralad.esports.registration.workflow.model.RegistrationPlayer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RegistrationPlayerRepository extends JpaRepository<RegistrationPlayer, UUID> {
    List<RegistrationPlayer> findAllByRegistrationIdOrderByRosterRoleAscCreatedAtAsc(
            UUID registrationId
    );
}
