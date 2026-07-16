package in.neupanepralad.esports.registration.form.dto;

import in.neupanepralad.esports.registration.form.model.FormFieldType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record FormFieldRequest(
        @NotBlank @Size(max = 80)
        @Pattern(regexp = "^[a-z][a-z0-9_]*$") String fieldKey,
        @NotBlank @Size(max = 160) String label,
        @NotNull FormFieldType type,
        @Size(max = 500) String helpText,
        @Size(max = 255) String placeholder,
        boolean required,
        @Size(max = 500) String validationPattern,
        @Min(0) Integer minimumLength,
        @Min(1) Integer maximumLength,
        @Min(0) int sortOrder,
        @Size(max = 100) List<@NotBlank @Size(max = 255) String> options
) {
}
