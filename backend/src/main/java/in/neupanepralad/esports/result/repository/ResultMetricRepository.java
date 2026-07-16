package in.neupanepralad.esports.result.repository;

import in.neupanepralad.esports.result.model.ResultMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ResultMetricRepository extends JpaRepository<ResultMetric, UUID> {
    List<ResultMetric> findAllByParticipantResultIdOrderByMetricKeyAsc(UUID participantResultId);
}
