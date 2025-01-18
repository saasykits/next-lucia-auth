import type { z } from "zod";

export type ValidatedActionOutput<T extends z.ZodRawShape, U> = {
  input: z.input<z.ZodObject<T>> | null | undefined;
  errors?: z.typeToFlattenedError<T>;
} & ActionCallbackOutput<U>;

export type ActionCallbackOutput<T> = {
  message?: string;
} & ({ success: false; data?: undefined } | { success: true; data: T });

export type ValidatedActionFn<T extends z.ZodRawShape, U> = (
  prevState: ValidatedActionOutput<T, unknown> | null | undefined,
  formData: FormData,
) => Promise<ValidatedActionOutput<T, U>>;

export type ValidatedActionCallback<T extends z.ZodRawShape, U> = (
  prevState: ValidatedActionOutput<T, unknown> | null | undefined,
  data: z.infer<z.ZodObject<T>>,
) => Promise<ActionCallbackOutput<U>>;

export function validatedAction<T extends z.ZodRawShape, U>(
  schema: z.ZodObject<T>,
  callback: ValidatedActionCallback<T, U>,
): ValidatedActionFn<T, U> {
  return async (prevState, formData) => {
    const obj = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(obj);
    if (!parsed.success) {
      const errors = parsed.error.flatten();
      return {
        success: false,
        message: "Invalid form input",
        input: obj,
        errors,
      } as ValidatedActionOutput<T, U>;
    }
    const data = await callback(prevState, parsed.data);
    return {
      ...data,
      input: parsed.data,
    };
  };
}

export function action<
  T extends ActionCallbackOutput<unknown>,
  U extends ActionCallbackOutput<unknown>,
>(callback: (input: T | null | undefined) => U | Promise<U>) {
  return async (prevState: T | null | undefined, _?: FormData): Promise<U> => callback(prevState);
}
