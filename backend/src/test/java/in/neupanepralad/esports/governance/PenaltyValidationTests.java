package in.neupanepralad.esports.governance;

import in.neupanepralad.esports.governance.dto.PenaltyRequest;
import in.neupanepralad.esports.governance.model.PenaltyType;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PenaltyValidationTests {

    @Test
    void negativePointDeductionsAreRejectedByRequestValidation() {
        try (var validatorFactory = Validation.buildDefaultValidatorFactory()) {
            var violations = validatorFactory.getValidator().validate(
                    new PenaltyRequest(
                            UUID.randomUUID(),
                            null,
                            PenaltyType.POINT_DEDUCTION,
                            new BigDecimal("-1"),
                            "Invalid negative deduction"
                    )
            );
            assertThat(violations).isNotEmpty();
        }
    }
}
