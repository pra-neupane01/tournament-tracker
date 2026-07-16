package in.neupanepralad.esports.file.repository;

import in.neupanepralad.esports.file.model.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StoredFileRepository extends JpaRepository<StoredFile, UUID> {
}
