package in.neupanepralad.esports.organization.repository;

import in.neupanepralad.esports.organization.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    Page<Organization> findByNameContainingIgnoreCase(String query, Pageable pageable);
}
