package in.neupanepralad.esports.registration.workflow.repository;

import in.neupanepralad.esports.registration.workflow.model.RegistrationAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RegistrationAnswerRepository extends JpaRepository<RegistrationAnswer, UUID> {
    List<RegistrationAnswer> findAllByRegistrationIdOrderByFieldKeyAscValueOrderAsc(
            UUID registrationId
    );
}
