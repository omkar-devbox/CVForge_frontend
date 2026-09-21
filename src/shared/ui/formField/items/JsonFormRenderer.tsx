import React from "react";
import { FormField } from "./FormField";
import { mapJsonToFormFields } from "../utils/jsonFormMapper";
import { cn } from "../utils";
import type {
  JsonFormSchema,
  JsonFormFieldSchema,
  FormFieldProps,
} from "../types/types";

export interface JsonFormRendererProps {
  /**
   * JSON Form Schema (either a JSON string or array of JsonFormFieldSchema)
   */
  schema: JsonFormSchema;

  /**
   * Form values dictionary { [fieldName]: value }
   */
  values?: Record<string, any>;

  /**
   * Form errors dictionary { [fieldName]: errorMessage }
   */
  errors?: Record<string, string>;

  /**
   * Field value change callback
   */
  onChange?: (name: string, value: any) => void;

  /**
   * Field blur callback
   */
  onBlur?: (name: string) => void;

  /**
   * Number of grid columns for responsive form layout (1 to 4)
   * @default 2
   */
  gridCols?: 1 | 2 | 3 | 4;

  /**
   * Grid gap size
   * @default "md"
   */
  gap?: "sm" | "md" | "lg";

  /**
   * Custom wrapper class
   */
  className?: string;

  /**
   * Security / RBAC overrides
   */
  userRoles?: string[];
  userPermissions?: Record<string, any> | string[];
  hasPermission?: (resource: string, action?: string) => boolean;

  /**
   * Optional custom field schema mapper/overrider
   */
  fieldMapper?: (schema: JsonFormFieldSchema) => Partial<FormFieldProps>;
}

const getGridColsClass = (cols: 1 | 2 | 3 | 4) => {
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 md:grid-cols-2";
    case 3:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    case 4:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    default:
      return "grid-cols-1 md:grid-cols-2";
  }
};

const getColSpanClass = (span?: 1 | 2 | 3 | 4 | "full") => {
  if (!span) return "";
  if (span === "full") return "col-span-full";
  switch (span) {
    case 1:
      return "col-span-1";
    case 2:
      return "col-span-1 md:col-span-2";
    case 3:
      return "col-span-1 md:col-span-3";
    case 4:
      return "col-span-1 md:col-span-4";
    default:
      return "";
  }
};

const getGapClass = (gap: "sm" | "md" | "lg") => {
  switch (gap) {
    case "sm":
      return "gap-3";
    case "lg":
      return "gap-6";
    case "md":
    default:
      return "gap-4";
  }
};

export const JsonFormRenderer: React.FC<JsonFormRendererProps> = ({
  schema,
  values = {},
  errors = {},
  onChange,
  onBlur,
  gridCols = 2,
  gap = "md",
  className,
  userRoles,
  userPermissions,
  hasPermission,
  fieldMapper,
}) => {
  const parsedSchemas = mapJsonToFormFields(schema, fieldMapper);

  if (!parsedSchemas || parsedSchemas.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid w-full",
        getGridColsClass(gridCols),
        getGapClass(gap),
        className
      )}
    >
      {parsedSchemas.map((field, index) => {
        const fieldName = field.name || `field_${index}`;
        const fieldValue = values[fieldName] !== undefined ? values[fieldName] : field.value;
        const fieldError = errors[fieldName] !== undefined ? errors[fieldName] : field.error;
        const rawSchema = (mapJsonToFormFields(schema)[index] as any);
        const colSpan = rawSchema?.colSpan;

        const handleFieldChange = (valOrEvent: any) => {
          let newValue = valOrEvent;
          if (
            valOrEvent &&
            typeof valOrEvent === "object" &&
            "target" in valOrEvent
          ) {
            if (valOrEvent.target.type === "checkbox") {
              newValue = valOrEvent.target.checked;
            } else if (valOrEvent.target.type === "file") {
              newValue = valOrEvent.target.files?.[0] || null;
            } else {
              newValue = valOrEvent.target.value;
            }
          }

          onChange?.(fieldName, newValue);
          if (field.onChange) {
            field.onChange(valOrEvent);
          }
        };

        const handleFieldBlur = () => {
          onBlur?.(fieldName);
        };

        return (
          <div
            key={field.id || fieldName}
            className={cn("w-full", getColSpanClass(colSpan), field.wrapperClassName)}
          >
            <FormField
              {...field}
              name={fieldName}
              value={fieldValue}
              error={fieldError}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              userRoles={userRoles ?? field.userRoles}
              userPermissions={userPermissions ?? field.userPermissions}
              hasPermission={hasPermission ?? field.hasPermission}
            />
          </div>
        );
      })}
    </div>
  );
};
