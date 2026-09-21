import React from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Search,
  Key,
  Shield,
  Calendar,
  Building,
  Globe,
  AtSign,
  Check,
  X,
  AlertCircle,
  Info,
  ChevronDown,
  FileText,
  Briefcase,
  GraduationCap,
  MapPin,
  Link as LinkIcon,
  Hash,
} from "lucide-react";
import type {
  FormFieldProps,
  JsonFormFieldSchema,
  JsonFormSchema,
  JsonFieldType,
  FormOption,
} from "../types/types";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  mail: Mail,
  email: Mail,
  lock: Lock,
  password: Lock,
  eye: Eye,
  eyeoff: EyeOff,
  user: User,
  username: User,
  phone: Phone,
  tel: Phone,
  search: Search,
  key: Key,
  shield: Shield,
  calendar: Calendar,
  date: Calendar,
  building: Building,
  company: Building,
  globe: Globe,
  atsign: AtSign,
  at: AtSign,
  check: Check,
  x: X,
  info: Info,
  alert: AlertCircle,
  chevron: ChevronDown,
  file: FileText,
  text: FileText,
  job: Briefcase,
  briefcase: Briefcase,
  graduation: GraduationCap,
  school: GraduationCap,
  location: MapPin,
  mappin: MapPin,
  link: LinkIcon,
  url: LinkIcon,
  hash: Hash,
  number: Hash,
};

/**
 * Resolves string icon name (e.g. "Mail", "Lock") or ReactNode into React.ReactNode.
 */
export const resolveIcon = (
  iconProp?: string | React.ReactNode
): React.ReactNode => {
  if (!iconProp) return undefined;
  if (typeof iconProp !== "string") return iconProp;

  const key = iconProp.trim().toLowerCase();
  const IconComponent = ICON_MAP[key];
  if (IconComponent) {
    return React.createElement(IconComponent, { size: 16 });
  }
  return iconProp;
};

/**
 * Parses raw JSON string or object array into typed JsonFormFieldSchema array.
 */
export const parseJsonFormSchema = (
  schemaInput: JsonFormSchema
): JsonFormFieldSchema[] => {
  if (!schemaInput) return [];

  if (typeof schemaInput === "string") {
    try {
      const parsed = JSON.parse(schemaInput);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error("Failed to parse JsonFormSchema string:", error);
      return [];
    }
  }

  return Array.isArray(schemaInput) ? schemaInput : [schemaInput];
};

/**
 * Normalizes field type / format strings into standard FormField type union.
 */
export const normalizeFieldType = (
  typeOrFormat?: JsonFieldType | string
): FormFieldProps["type"] => {
  if (!typeOrFormat) return "text";

  const raw = String(typeOrFormat).trim().toLowerCase();

  switch (raw) {
    case "string (text)":
    case "text":
    case "string":
      return "text";
    case "textarea":
      return "textarea";
    case "select":
    case "checkbox select":
      return "select";
    case "checkbox":
      return "checkbox";
    case "radio":
      return "radio";
    case "date":
      return "date";
    case "number":
      return "number";
    case "email":
      return "email";
    case "password":
      return "password";
    case "url":
      return "url";
    case "phone":
    case "tel":
      return "tel";
    case "file":
      return "file";
    default:
      return "text";
  }
};

/**
 * Converts options array into standard FormOption format.
 */
const normalizeOptions = (
  rawOptions?: unknown[]
): FormOption<unknown>[] | undefined => {
  if (!Array.isArray(rawOptions)) return undefined;

  return rawOptions.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      const item = opt as Record<string, unknown>;
      return {
        label: String(item.label ?? item.name ?? item.title ?? item.value ?? ""),
        value: item.value ?? item.id ?? item.key,
        disabled: Boolean(item.disabled),
        ...item,
      };
    }
    return {
      label: String(opt),
      value: opt,
    };
  });
};

/**
 * Map a single JsonFormFieldSchema to FormFieldProps.
 */
export const mapFieldSchemaToFormFieldProps = (
  schema: JsonFormFieldSchema,
  overrideProps?: Partial<FormFieldProps>
): FormFieldProps => {
  const name = schema.name || schema.key || schema.id || "unnamed_field";
  const id = schema.id || `field-${name}`;
  const type = normalizeFieldType(schema.type || schema.format);

  const baseProps = {
    id,
    name,
    type,
    label: schema.label,
    placeholder: schema.placeholder,
    hint: schema.hint,
    error: schema.error || schema.errorMessage,
    helperText: schema.helperText,
    required: schema.required,
    disabled: schema.disabled,
    isPII: schema.isPII,
    idIndex: schema.idIndex,
    roles: schema.roles,
    permissions: schema.permissions,
    permissionResource: schema.permissionResource,
    permissionAction: schema.permissionAction,
    roleAction: schema.roleAction,
    userRoles: schema.userRoles,
    userPermissions: schema.userPermissions,
    hasPermission: schema.hasPermission,
    wrapperClassName: schema.wrapperClassName,
    className: schema.className,
    value: schema.value,
    defaultValue: schema.defaultValue,
    prefixIcon: resolveIcon(schema.prefixIcon),
    suffixIcon: resolveIcon(schema.suffixIcon),
    startIcon: resolveIcon(schema.startIcon),
    endIcon: resolveIcon(schema.endIcon),
    prefix: resolveIcon(schema.prefix),
    suffix: resolveIcon(schema.suffix),
    prefixClassName: schema.prefixClassName,
    suffixClassName: schema.suffixClassName,
    showPasswordToggle: schema.showPasswordToggle,
    ...overrideProps,
  };

  // Attach field-type specific props
  switch (type) {
    case "textarea":
      return {
        ...baseProps,
        type: "textarea",
        rows: schema.rows || 3,
      } as FormFieldProps;

    case "select":
      return {
        ...baseProps,
        type: "select",
        options: normalizeOptions(schema.options),
        loadOptions: schema.loadOptions as any,
        defaultOptions: typeof schema.defaultOptions === "boolean" ? schema.defaultOptions : true,
        cacheOptions: schema.cacheOptions,
        allowCreate: schema.allowCreate,
        isMulti: schema.isMulti,
        isSearchable: schema.isSearchable ?? true,
        isClearable: schema.isClearable ?? true,
        labelKey: schema.labelKey,
        valueKey: schema.valueKey,
      } as FormFieldProps;

    case "radio":
      return {
        ...baseProps,
        type: "radio",
        options: normalizeOptions(schema.options) || [],
        labelKey: schema.labelKey,
        valueKey: schema.valueKey,
      } as FormFieldProps;

    case "checkbox":
      return {
        ...baseProps,
        type: "checkbox",
        value: Boolean(schema.value),
      } as FormFieldProps;

    case "date":
      return {
        ...baseProps,
        type: "date",
        dateFormat: schema.dateFormat as any,
        showTime: schema.showTime,
        initialView: schema.initialView,
        minView: schema.minView,
        minDate: schema.minDate,
        maxDate: schema.maxDate,
        showTodayButton: schema.showTodayButton,
      } as FormFieldProps;

    case "text":
    case "email":
    case "password":
    case "number":
    case "tel":
    case "url":
    default:
      return {
        ...baseProps,
        type,
      } as FormFieldProps;
  }
};

/**
 * Maps a JSON schema (string or array) into an array of FormFieldProps.
 */
export const mapJsonToFormFields = (
  schemaInput: JsonFormSchema,
  overrideMapper?: (schema: JsonFormFieldSchema) => Partial<FormFieldProps>
): FormFieldProps[] => {
  const schemas = parseJsonFormSchema(schemaInput);

  return schemas.map((schema) => {
    const overrides = overrideMapper ? overrideMapper(schema) : undefined;
    return mapFieldSchemaToFormFieldProps(schema, overrides);
  });
};
