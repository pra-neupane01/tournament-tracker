export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'EMAIL'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'CHECKBOX'
  | 'DATE'
  | 'FILE';

export interface RegistrationFormField {
  id: string;
  fieldKey: string;
  label: string;
  type: FormFieldType;
  helpText: string | null;
  placeholder: string | null;
  required: boolean;
  validationPattern: string | null;
  minimumLength: number | null;
  maximumLength: number | null;
  sortOrder: number;
  options: string[];
}

export interface RegistrationFormFieldInput {
  fieldKey: string;
  label: string;
  type: FormFieldType;
  helpText: string;
  placeholder: string;
  required: boolean;
  validationPattern: string;
  minimumLength: number | null;
  maximumLength: number | null;
  sortOrder: number;
  options: string[];
}
