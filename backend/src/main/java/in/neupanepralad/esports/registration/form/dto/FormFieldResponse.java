package in.neupanepralad.esports.registration.form.dto;

import in.neupanepralad.esports.registration.form.model.FormFieldType;
import in.neupanepralad.esports.registration.form.model.RegistrationFormField;

import java.util.List;
import java.util.UUID;

public record FormFieldResponse(
        UUID id,
        String fieldKey,
        String label,
        FormFieldType type,
        String helpText,
        String placeholder,
        boolean required,
        String validationPattern,
        Integer minimumLength,
        Integer maximumLength,
        int sortOrder,
        List<String> options
) {
    public static FormFieldResponse from(RegistrationFormField field) {
        return new FormFieldResponse(
                field.getId(),
                field.getFieldKey(),
                field.getLabel(),
                field.getType(),
                field.getHelpText(),
                field.getPlaceholder(),
                field.isRequired(),
                field.getValidationPattern(),
                field.getMinimumLength(),
                field.getMaximumLength(),
                field.getSortOrder(),
                List.copyOf(field.getOptions())
        );
    }
}
