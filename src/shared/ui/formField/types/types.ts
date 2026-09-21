import React from "react";
import type { DatePickerView } from "../items/DatePicker/types/CustomDatePicker.types";

/* ── Style Config ─────────────────────────────────────────── */

export interface FormFieldStyleConfig {
  // Default
  bg?: string;
  text?: string;
  border?: string;
  label?: string;
  placeholder?: string;

  // Hover
  hoverBg?: string;
  hoverText?: string;
  hoverBorder?: string;

  // Focus / Active
  activeBg?: string;
  activeText?: string;
  activeBorder?: string;

  // Disabled
  disabledBg?: string;
  disabledText?: string;
  disabledBorder?: string;

  // Error
  errorBg?: string;
  errorText?: string;
  errorBorder?: string;
  errorLabel?: string;

  // Success
  successBg?: string;
  successText?: string;
  successBorder?: string;

  // Extra
  radius?: string;
  shadow?: string;
  padding?: string;
}
type FieldOnChange<V = unknown> = (
  value:
    | V
    | React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  meta?: unknown,
) => void;

interface LoadOptionsPage<T = unknown> {
  options: FormOption<T>[];
  hasMore: boolean;
}

type LoadOptionsResult<T = unknown> = FormOption<T>[] | LoadOptionsPage<T>;

/* ── Option Type ─────────────────────────────────────────── */

export interface FormOption<T = unknown> {
  label: string | React.ReactNode;
  value: T;
  disabled?: boolean;
  [key: string]: unknown;
}

/* ── Role & Permission Control ───────────────────────────── */

export type RoleAction = "hide" | "disable" | "readonly";

export interface FieldSecurityConfig {
  roles?: string[];
  permissions?: string[] | { resource: string; action?: string }[];
  permissionResource?: string;
  permissionAction?: string;
  roleAction?: RoleAction;

  userRoles?: string[];
  userPermissions?: Record<string, any> | string[];
  hasPermission?: (resource: string, action?: string) => boolean;
}

/* ── Base Props ─────────────────────────────────────────── */

interface BaseFormFieldProps<T, V = unknown> extends FieldSecurityConfig {
  type: T | boolean;

  label?: string | React.ReactNode;
  hint?: string | React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  isPII?: boolean;

  fullWidth?: boolean;
  fieldSize?: "sm" | "md" | "lg";

  wrapperClassName?: string;

  name?: string;
  required?: boolean;
  disabled?: boolean;

  styleConfig?: FormFieldStyleConfig;

  value?: V;
  defaultValue?: V;

  onChange?: FieldOnChange<V>;

  // Prefix / Suffix & Icons
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  prefixClassName?: string;
  suffixClassName?: string;

  showPasswordToggle?: boolean;
}

/* ── Text Field ─────────────────────────────────────────── */

export interface TextFieldProps
  extends
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "value" | "defaultValue" | "onChange" | "autoComplete" | "prefix"
  >,
  BaseFormFieldProps<
    "text" | "email" | "password" | "number" | "tel" | "url",
    string | number
  > {
  autoComplete?: string;
}

/* ── Text Area ─────────────────────────────────────────── */

export interface TextAreaProps
  extends
  Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "defaultValue" | "onChange" | "autoComplete" | "prefix"
  >,
  BaseFormFieldProps<"textarea", string> {
  rows?: number;
}

/* ── Select ───────────────────────────────────────────── */

export interface SelectFieldProps<T = unknown>
  extends
  Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "prefix">,
  BaseFormFieldProps<"select", T | T[]> {
  options?: FormOption<T>[];

  labelKey?: string;
  valueKey?: string;

  placeholder?: string;

  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;

  loadingMessage?: string;
  noOptionsMessage?: string;

  loadOptions?: (
    inputValue: string,
    page?: number,
  ) => Promise<LoadOptionsResult<T>>;

  defaultOptions?: boolean;
  cacheOptions?: boolean;
  allowCreate?: boolean;
}

/* ── Checkbox ─────────────────────────────────────────── */

export interface CheckboxFieldProps
  extends
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "value" | "defaultValue" | "onChange" | "prefix"
  >,
  BaseFormFieldProps<"checkbox", boolean> { }

/* ── Radio ───────────────────────────────────────────── */

export interface RadioFieldProps<T = unknown>
  extends
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "value" | "defaultValue" | "onChange" | "prefix"
  >,
  BaseFormFieldProps<"radio", T> {
  options: FormOption<T>[];
  labelKey?: string;
  valueKey?: string;
}

/* ── Date ───────────────────────────────────────────── */

export interface DateFieldProps
  extends
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "value" | "defaultValue" | "onChange" | "prefix"
  >,
  BaseFormFieldProps<"date", string | Date | null> {
  minDate?: string | Date;
  maxDate?: string | Date;

  showTodayButton?: boolean;

  dateFormat?:
  | "dd-mm-yyyy"
  | "mm-dd-yyyy"
  | "yyyy-mm-dd"
  | "yyyy-dd-mm"
  | "dd-MMM-yyyy"
  | "mm-yyyy"
  | "yyyy";

  showTime?: boolean;
  initialView?: DatePickerView;
  minView?: DatePickerView;
}

/* ── File ───────────────────────────────────────────── */

export interface FileFieldProps
  extends
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "value" | "defaultValue" | "onChange" | "prefix"
  >,
  BaseFormFieldProps<"file", File | File[] | null> {
  accept?: string;
  onFileSelect?: (file: File | null) => void;
}

/* ── Final Union ───────────────────────────────────────── */

export type FormFieldProps =
  | TextFieldProps
  | TextAreaProps
  | SelectFieldProps
  | CheckboxFieldProps
  | RadioFieldProps
  | DateFieldProps
  | FileFieldProps;

/* ── Utility ─────────────────────────────────────────── */

export type CustomSelectProps<T = unknown> = Omit<SelectFieldProps<T>, "type">;

/* ── JSON Form Schema ─────────────────────────────────────── */

export type JsonFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "file"
  // Legacy / Backend format strings:
  | "String (Text)"
  | "Select"
  | "Date"
  | "Checkbox"
  | "Radio"
  | "Textarea"
  | "Number"
  | "Email"
  | "URL"
  | "Phone";

export interface JsonFormFieldSchema extends FieldSecurityConfig {
  id?: string;
  name?: string;
  key?: string;
  label?: string;
  type?: JsonFieldType;
  format?: JsonFieldType;
  placeholder?: string;
  hint?: string;
  helperText?: string;
  errorMessage?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  isPII?: boolean;
  idIndex?: number;
  colSpan?: 1 | 2 | 3 | 4 | "full";
  wrapperClassName?: string;
  className?: string;

  defaultValue?: unknown;
  value?: unknown;

  // Prefix / Suffix & Icons for JSON Schema mapping
  prefixIcon?: string | React.ReactNode;
  suffixIcon?: string | React.ReactNode;
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  startIcon?: string | React.ReactNode;
  endIcon?: string | React.ReactNode;
  prefixClassName?: string;
  suffixClassName?: string;

  showPasswordToggle?: boolean;

  // Options for select/radio
  options?: FormOption<unknown>[] | { label: string; value: unknown }[];
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  allowCreate?: boolean;
  cacheOptions?: boolean;
  defaultOptions?: boolean;
  loadOptions?: (
    inputValue: string,
    page?: number,
  ) => Promise<LoadOptionsResult<unknown>>;
  labelKey?: string;
  valueKey?: string;

  // Date specific
  dateFormat?: string;
  showTime?: boolean;
  initialView?: DatePickerView;
  minView?: DatePickerView;
  minDate?: string | Date;
  maxDate?: string | Date;
  showTodayButton?: boolean;

  // Textarea specific
  rows?: number;

  // Custom metadata / config
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export type JsonFormSchema = JsonFormFieldSchema[] | string;

/* ── External ─────────────────────────────────────────── */

export type * from "../items/DatePicker/types/CustomDatePicker.types";
