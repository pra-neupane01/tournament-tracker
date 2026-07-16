package in.neupanepralad.esports.registration.form.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ConflictException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.registration.form.dto.FormFieldRequest;
import in.neupanepralad.esports.registration.form.dto.FormFieldResponse;
import in.neupanepralad.esports.registration.form.model.FormFieldType;
import in.neupanepralad.esports.registration.form.model.RegistrationFormField;
import in.neupanepralad.esports.registration.form.repository.RegistrationFormFieldRepository;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.PatternSyntaxException;

@Service
@RequiredArgsConstructor
public class RegistrationFormService {

    private final RegistrationFormFieldRepository fieldRepository;
    private final TournamentAccessService tournamentAccessService;

    @Transactional(readOnly = true)
    public List<FormFieldResponse> list(UUID tournamentId) {
        tournamentAccessService.requireTournament(tournamentId);
        return fieldRepository.findAllByTournamentIdOrderBySortOrderAsc(tournamentId)
                .stream().map(FormFieldResponse::from).toList();
    }

    @Transactional
    public FormFieldResponse create(
            UUID tournamentId,
            UUID actorId,
            FormFieldRequest request
    ) {
        if (fieldRepository.findByTournamentIdAndFieldKeyIgnoreCase(
                tournamentId,
                request.fieldKey()
        ).isPresent()) {
            throw new ConflictException("A registration field with this key already exists");
        }
        validate(request);
        RegistrationFormField field = new RegistrationFormField();
        field.setTournament(tournamentAccessService.requireManager(tournamentId, actorId));
        apply(field, request);
        return FormFieldResponse.from(fieldRepository.save(field));
    }

    @Transactional
    public FormFieldResponse update(
            UUID tournamentId,
            UUID fieldId,
            UUID actorId,
            FormFieldRequest request
    ) {
        tournamentAccessService.requireManager(tournamentId, actorId);
        RegistrationFormField field = requireField(tournamentId, fieldId);
        fieldRepository.findByTournamentIdAndFieldKeyIgnoreCase(
                        tournamentId,
                        request.fieldKey()
                )
                .filter(existing -> !existing.getId().equals(fieldId))
                .ifPresent(existing -> {
                    throw new ConflictException("A registration field with this key already exists");
                });
        validate(request);
        apply(field, request);
        return FormFieldResponse.from(field);
    }

    @Transactional
    public void delete(UUID tournamentId, UUID fieldId, UUID actorId) {
        tournamentAccessService.requireManager(tournamentId, actorId);
        fieldRepository.delete(requireField(tournamentId, fieldId));
    }

    private void validate(FormFieldRequest request) {
        if (request.minimumLength() != null
                && request.maximumLength() != null
                && request.minimumLength() > request.maximumLength()) {
            throw new BadRequestException("Minimum length cannot exceed maximum length");
        }
        boolean optionField = request.type() == FormFieldType.SELECT
                || request.type() == FormFieldType.MULTI_SELECT;
        if (optionField && (request.options() == null || request.options().isEmpty())) {
            throw new BadRequestException("Select fields require at least one option");
        }
        if (!optionField && request.options() != null && !request.options().isEmpty()) {
            throw new BadRequestException("Only select fields can define options");
        }
        if (request.validationPattern() != null && !request.validationPattern().isBlank()) {
            try {
                java.util.regex.Pattern.compile(request.validationPattern());
            } catch (PatternSyntaxException exception) {
                throw new BadRequestException("Invalid validation pattern");
            }
        }
    }

    private RegistrationFormField requireField(UUID tournamentId, UUID fieldId) {
        RegistrationFormField field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Registration form field not found"
                ));
        if (!field.getTournament().getId().equals(tournamentId)) {
            throw new ResourceNotFoundException("Registration form field not found");
        }
        return field;
    }

    private void apply(RegistrationFormField field, FormFieldRequest request) {
        field.setFieldKey(request.fieldKey().trim().toLowerCase(Locale.ROOT));
        field.setLabel(request.label().trim());
        field.setType(request.type());
        field.setHelpText(request.helpText());
        field.setPlaceholder(request.placeholder());
        field.setRequired(request.required());
        field.setValidationPattern(request.validationPattern());
        field.setMinimumLength(request.minimumLength());
        field.setMaximumLength(request.maximumLength());
        field.setSortOrder(request.sortOrder());
        field.getOptions().clear();
        if (request.options() != null) {
            field.getOptions().addAll(request.options().stream().map(String::trim).toList());
        }
    }
}
