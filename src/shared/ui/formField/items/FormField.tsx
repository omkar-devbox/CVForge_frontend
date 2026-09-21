import React, { forwardRef, useId } from "react";
import { cn } from "../utils";
import { CustomSelect } from "./CustomSelect/CustomSelect";
import { CustomDatePicker } from "./DatePicker/CustomDatePicker";
import { FormFieldWrapper } from "./BaseFields/FormFieldWrapper";
import { TextAreaField } from "./BaseFields/TextAreaField";
import { CheckboxField } from "./BaseFields/CheckboxField";
import { RadioField } from "./BaseFields/RadioField";
import { InputField } from "./BaseFields/InputField";
import { FileUploadField } from "./BaseFields/FileUploadField";
import { checkFieldAccess } from "../utils/permissionUtils";
import type {
  FormFieldProps,
  TextAreaProps,
  SelectFieldProps,
  DateFieldProps,
  CheckboxFieldProps,
  RadioFieldProps,
  TextFieldProps,
} from "../types/types";

/* ── Component ─────────────────────────────────────────────── */

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLDivElement,
  FormFieldProps
>((props, ref) => {
  // Cast to any to allow destructuring of props that might not exist on all union members
  const allProps = props as any;
  const {
    type,
    label,
    hint,
    error,
    helperText,
    fullWidth = true,
    wrapperClassName,
    id: externalId,
    required,
    disabled: initialDisabled,
    styleConfig,
    fieldSize,
    isPII,
    // RBAC Security options
    roles,
    permissions,
    permissionResource,
    permissionAction,
    roleAction,
    userRoles,
    userPermissions,
    hasPermission: customHasPermission,
    // Select/Radio specific props to be filtered from rest
    options,
    labelKey,
    valueKey,
    isMulti,
    isSearchable,
    isClearable,
    loadingMessage,
    noOptionsMessage,
    loadOptions,
    defaultOptions,
    cacheOptions,
    allowCreate,
    name,
    className,
    ...rest
  } = allProps;

  // Evaluate RBAC permissions for this field
  const access = checkFieldAccess(
    {
      roles,
      permissions,
      permissionResource,
      permissionAction,
      roleAction,
      userRoles,
      userPermissions,
      hasPermission: customHasPermission,
    },
    {
      roles: undefined,
      permissions: undefined,
      hasPermission: undefined,
    }
  );

  // If unauthorized and roleAction is "hide" (or default), return null immediately
  if (!access.isAllowed && access.action === "hide") {
    return null;
  }

  // Force disabled or readOnly if unauthorized with "disable" or "readonly" action
  const disabled = initialDisabled || (!access.isAllowed && (access.action === "disable" || access.action === "readonly"));

  const generatedId = useId();
  const id = externalId || `${type}-${generatedId}`;

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <TextAreaField
            {...(rest as TextAreaProps)}
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            id={id}
            name={name}
            disabled={disabled}
            required={required}
            error={error}
            isPII={isPII}
            fieldSize={fieldSize}
          />
        );

      case "select": {
        const isHeaderSelector = name === "tenantSelector" || name === "centerSelector";
        const mergedSelectClassName = isHeaderSelector
          ? cn(
              "rounded-xl border-border bg-surface-secondary/50 h-10 min-h-0 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:bg-surface-secondary/50",
              className
            )
          : className;

        return (
          <CustomSelect
            {...(rest as SelectFieldProps)}
            name={name}
            className={mergedSelectClassName}
            label={label}
            ref={ref as React.ForwardedRef<HTMLDivElement>}
            id={id}
            disabled={disabled}
            aria-invalid={!!error}
            options={options}
            labelKey={labelKey}
            valueKey={valueKey}
            isMulti={isMulti}
            isSearchable={isSearchable}
            isClearable={isClearable}
            loadingMessage={loadingMessage}
            noOptionsMessage={noOptionsMessage}
            loadOptions={loadOptions}
            defaultOptions={defaultOptions}
            cacheOptions={cacheOptions}
            allowCreate={allowCreate}
            fieldSize={fieldSize}
          />
        );
      }

      case "date":
        return (
          <CustomDatePicker
            {...(rest as DateFieldProps)}
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            id={id}
            name={name}
            disabled={disabled}
            aria-invalid={!!error}
          />
        );

      case "checkbox":
        return (
          <CheckboxField
            {...(rest as CheckboxFieldProps)}
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            id={id}
            name={name}
            disabled={disabled}
            required={required}
            error={error}
            label={label}
            styleConfig={styleConfig}
          />
        );

      case "radio":
        return (
          <RadioField
            {...(rest as RadioFieldProps)}
            id={id}
            name={name}
            disabled={disabled}
            required={required}
            error={error}
            options={options || []}
            labelKey={labelKey}
            valueKey={valueKey}
            styleConfig={styleConfig}
          />
        );

      case "file":
        return (
          <FileUploadField
            {...(rest as any)}
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            id={id}
            name={name}
            disabled={disabled}
            required={required}
            error={error}
          />
        );

      case "text":
      case "email":
      case "password":
      case "number":
      default:
        return (
          <InputField
            {...(rest as TextFieldProps)}
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            id={id}
            name={name}
            type={type}
            disabled={disabled}
            required={required}
            error={error}
            isPII={isPII}
            fieldSize={fieldSize}
            className={className}
          />
        );
    }
  };

  return (
    <FormFieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      wrapperClassName={wrapperClassName}
      hideLabel={type === "checkbox"}
      styleConfig={styleConfig}
    >
      {renderInput()}
    </FormFieldWrapper>
  );
});

FormField.displayName = "FormField";
