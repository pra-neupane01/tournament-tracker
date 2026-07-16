import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare,
  Edit3,
  FileText,
  GripVertical,
  ListChecks,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { TournamentHeader } from '../components/tournament/TournamentHeader';
import { TournamentNav } from '../components/tournament/TournamentNav';
import { registrationFormService } from '../features/registrationForm/registrationFormService';
import type {
  FormFieldType,
  RegistrationFormField,
  RegistrationFormFieldInput,
} from '../features/registrationForm/types';
import { tournamentService } from '../features/tournaments/tournamentService';
import { getErrorMessage } from '../utils/apiError';

const emptyField: RegistrationFormFieldInput = {
  fieldKey: '',
  label: '',
  type: 'TEXT',
  helpText: '',
  placeholder: '',
  required: false,
  validationPattern: '',
  minimumLength: null,
  maximumLength: null,
  sortOrder: 0,
  options: [],
};

export function RegistrationFormBuilderPage() {
  const { tournamentId = '' } = useParams();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [field, setField] = useState(emptyField);
  const [optionsText, setOptionsText] = useState('');
  const [notice, setNotice] = useState('');

  const tournament = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => tournamentService.get(tournamentId),
  });
  const fields = useQuery({
    queryKey: ['registration-form', tournamentId],
    queryFn: () => registrationFormService.list(tournamentId),
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['registration-form', tournamentId] });

  const saveField = useMutation({
    mutationFn: (input: RegistrationFormFieldInput) =>
      editingId
        ? registrationFormService.update(tournamentId, editingId, input)
        : registrationFormService.create(tournamentId, input),
    onSuccess: async () => {
      closeEditor();
      await refresh();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeField = useMutation({
    mutationFn: (fieldId: string) => registrationFormService.remove(tournamentId, fieldId),
    onSuccess: refresh,
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const closeEditor = () => {
    setOpen(false);
    setEditingId(null);
    setField(emptyField);
    setOptionsText('');
    setNotice('');
  };

  const edit = (item: RegistrationFormField) => {
    setEditingId(item.id);
    setField({
      fieldKey: item.fieldKey,
      label: item.label,
      type: item.type,
      helpText: item.helpText ?? '',
      placeholder: item.placeholder ?? '',
      required: item.required,
      validationPattern: item.validationPattern ?? '',
      minimumLength: item.minimumLength,
      maximumLength: item.maximumLength,
      sortOrder: item.sortOrder,
      options: item.options,
    });
    setOptionsText(item.options.join('\n'));
    setOpen(true);
  };

  const add = () => {
    setField({ ...emptyField, sortOrder: fields.data?.length ?? 0 });
    setOpen(true);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const optionField = field.type === 'SELECT' || field.type === 'MULTI_SELECT';
    saveField.mutate({
      ...field,
      options: optionField
        ? optionsText
            .split('\n')
            .map((value) => value.trim())
            .filter(Boolean)
        : [],
    });
  };

  if (tournament.isLoading) {
    return <LoadingState message="Loading form builder..." />;
  }
  if (tournament.isError || !tournament.data) {
    return <ErrorState message={getErrorMessage(tournament.error)} />;
  }

  return (
    <div className="tournament-page">
      <TournamentHeader tournament={tournament.data} />
      <TournamentNav tournamentId={tournamentId} />
      <div className="tournament-page-body">
        <div className="builder-heading">
          <div>
            <h2>Registration form builder</h2>
            <p>Collect tournament-specific details after the team and roster snapshot.</p>
          </div>
          <button className="button button-primary" onClick={add}>
            <Plus /> Add field
          </button>
        </div>
        {notice && <div className="alert alert-error mb-5">{notice}</div>}
        {fields.isLoading && <LoadingState message="Loading registration fields..." />}
        {fields.isError && <ErrorState message={getErrorMessage(fields.error)} />}
        {fields.data?.length === 0 && (
          <EmptyState
            title="No custom fields"
            message="The default registration captures team and roster data. Add custom questions here."
          />
        )}

        <div className="builder-grid">
          <section className="panel">
            <div className="section-heading">
              <ListChecks />
              <div>
                <h2>Field structure</h2>
                <p>Fields are displayed in ascending sort order.</p>
              </div>
            </div>
            <div className="builder-field-list">
              {fields.data?.map((item) => (
                <article key={item.id}>
                  <GripVertical />
                  <FieldTypeIcon type={item.type} />
                  <div>
                    <div>
                      <strong>{item.label}</strong>
                      {item.required && <span className="badge badge-warning">Required</span>}
                    </div>
                    <p>{item.fieldKey} · {item.type.replaceAll('_', ' ')}</p>
                  </div>
                  <button className="icon-button" onClick={() => edit(item)} aria-label="Edit field">
                    <Edit3 />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => removeField.mutate(item.id)}
                    aria-label="Delete field"
                  >
                    <Trash2 />
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel form-preview">
            <div className="section-heading">
              <FileText />
              <div>
                <h2>Participant preview</h2>
                <p>A live approximation of the registration experience.</p>
              </div>
            </div>
            <div className="form-stack">
              {fields.data?.map((item) => <PreviewField key={item.id} field={item} />)}
              {fields.data?.length === 0 && (
                <p className="muted-copy">Add a field to see the form preview.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <Modal open={open} title={editingId ? 'Edit form field' : 'Add form field'} onClose={closeEditor}>
        <form className="form-stack" onSubmit={submit}>
          {notice && <div className="alert alert-error">{notice}</div>}
          <div className="form-grid">
            <label className="field">
              <span>Label</span>
              <input
                value={field.label}
                onChange={(event) => {
                  const label = event.target.value;
                  setField({
                    ...field,
                    label,
                    fieldKey: editingId
                      ? field.fieldKey
                      : label
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, '_')
                          .replace(/^_|_$/g, ''),
                  });
                }}
                required
              />
            </label>
            <label className="field">
              <span>Field key</span>
              <input
                value={field.fieldKey}
                onChange={(event) => setField({ ...field, fieldKey: event.target.value })}
                pattern="^[a-z][a-z0-9_]*$"
                required
              />
            </label>
          </div>
          <label className="field">
            <span>Field type</span>
            <select
              value={field.type}
              onChange={(event) =>
                setField({ ...field, type: event.target.value as FormFieldType })
              }
            >
              {fieldTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Help text</span>
            <input
              value={field.helpText}
              onChange={(event) => setField({ ...field, helpText: event.target.value })}
            />
          </label>
          <label className="field">
            <span>Placeholder</span>
            <input
              value={field.placeholder}
              onChange={(event) => setField({ ...field, placeholder: event.target.value })}
            />
          </label>
          {(field.type === 'SELECT' || field.type === 'MULTI_SELECT') && (
            <label className="field">
              <span>Options (one per line)</span>
              <textarea
                rows={5}
                value={optionsText}
                onChange={(event) => setOptionsText(event.target.value)}
                required
              />
            </label>
          )}
          <div className="form-grid">
            <label className="field">
              <span>Minimum length</span>
              <input
                type="number"
                min={0}
                value={field.minimumLength ?? ''}
                onChange={(event) =>
                  setField({
                    ...field,
                    minimumLength: event.target.value ? Number(event.target.value) : null,
                  })
                }
              />
            </label>
            <label className="field">
              <span>Maximum length</span>
              <input
                type="number"
                min={1}
                value={field.maximumLength ?? ''}
                onChange={(event) =>
                  setField({
                    ...field,
                    maximumLength: event.target.value ? Number(event.target.value) : null,
                  })
                }
              />
            </label>
          </div>
          <label className="field">
            <span>Validation pattern (regular expression)</span>
            <input
              value={field.validationPattern}
              onChange={(event) => setField({ ...field, validationPattern: event.target.value })}
              placeholder="Optional"
            />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>Sort order</span>
              <input
                type="number"
                min={0}
                value={field.sortOrder}
                onChange={(event) => setField({ ...field, sortOrder: Number(event.target.value) })}
              />
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(event) => setField({ ...field, required: event.target.checked })}
              />
              Required field
            </label>
          </div>
          <button className="button button-primary" disabled={saveField.isPending}>
            {saveField.isPending ? 'Saving...' : 'Save field'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

const fieldTypes: FormFieldType[] = [
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'EMAIL',
  'SELECT',
  'MULTI_SELECT',
  'CHECKBOX',
  'DATE',
  'FILE',
];

function FieldTypeIcon({ type }: { type: FormFieldType }) {
  return type === 'CHECKBOX' ? <CheckSquare /> : <FileText />;
}

function PreviewField({ field }: { field: RegistrationFormField }) {
  const label = (
    <span>
      {field.label} {field.required && <em>*</em>}
    </span>
  );

  if (field.type === 'TEXTAREA') {
    return <label className="field">{label}<textarea rows={3} placeholder={field.placeholder ?? ''} disabled /></label>;
  }
  if (field.type === 'SELECT' || field.type === 'MULTI_SELECT') {
    return (
      <label className="field">
        {label}
        <select multiple={field.type === 'MULTI_SELECT'} disabled>
          {field.options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === 'CHECKBOX') {
    return <label className="checkbox-field"><input type="checkbox" disabled /> {label}</label>;
  }
  return (
    <label className="field">
      {label}
      <input
        type={
          field.type === 'EMAIL'
            ? 'email'
            : field.type === 'NUMBER'
              ? 'number'
              : field.type === 'DATE'
                ? 'date'
                : field.type === 'FILE'
                  ? 'file'
                  : 'text'
        }
        placeholder={field.placeholder ?? ''}
        disabled
      />
      {field.helpText && <small className="field-help">{field.helpText}</small>}
    </label>
  );
}
