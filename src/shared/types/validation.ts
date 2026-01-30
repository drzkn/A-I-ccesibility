import { z, ZodError, ZodSchema } from 'zod';

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationFailure {
  success: false;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export function validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function formatZodErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

export function formatValidationErrorsForMcp(errors: ValidationError[]): string {
  const lines = ['Validation failed:'];

  for (const error of errors) {
    const pathStr = error.path ? `[${error.path}] ` : '';
    lines.push(`  - ${pathStr}${error.message}`);
  }

  return lines.join('\n');
}

export function createInputValidator<T>(schema: ZodSchema<T>) {
  return {
    validate: (data: unknown): ValidationResult<T> => validate(schema, data),

    validateOrThrow: (data: unknown): T => validateOrThrow(schema, data),

    isValid: (data: unknown): data is T => schema.safeParse(data).success,

    getDefaults: (): Partial<T> => {
      if (schema instanceof z.ZodObject) {
        const shape = schema.shape as Record<string, ZodSchema>;
        const defaults: Record<string, unknown> = {};

        for (const [key, fieldSchema] of Object.entries(shape)) {
          if (fieldSchema instanceof z.ZodDefault) {
            defaults[key] = fieldSchema._def.defaultValue();
          }
        }

        return defaults as Partial<T>;
      }
      return {};
    },
  };
}

export function createOutputValidator<T>(schema: ZodSchema<T>) {
  return {
    validate: (data: unknown): ValidationResult<T> => validate(schema, data),

    strip: (data: unknown): T | null => {
      const result = schema.safeParse(data);
      return result.success ? result.data : null;
    },

    ensureValid: (data: T): T => {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new Error(
          `Output validation failed: ${formatValidationErrorsForMcp(formatZodErrors(result.error))}`
        );
      }
      return result.data;
    },
  };
}
