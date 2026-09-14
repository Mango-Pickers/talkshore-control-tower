import { z } from "@hono/zod-openapi";

export const ErrorSchema = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
      request_id: z.string(),
    }),
  })
  .openapi("ErrorResponse");

export const ProfileSchema = z
  .object({
    id: z.string(),
    email: z.string().email().nullable(),
    full_name: z.string().nullable(),
    role: z.enum(["learner", "guide", "moderator", "admin"]),
    avatar_url: z.string().url().nullable().optional(),
    native_language: z.string().nullable().optional(),
    learning_language: z.string().nullable().optional(),
    level: z.string().nullable().optional(),
    goal: z.string().nullable().optional(),
    days_per_week: z.number().int().min(1).max(7).nullable().optional(),
    banned: z.boolean(),
    verified_guide: z.boolean(),
    created_at: z.string().datetime().nullable(),
    updated_at: z.string().datetime().nullable(),
  })
  .openapi("Profile");

export const ProfileInputSchema = z
  .object({
    full_name: z.string().trim().min(2).max(100),
  })
  .strict()
  .openapi("ProfileInput");

export const ProfileUpdateSchema = z
  .object({
    full_name: z.string().trim().min(2).max(100).optional(),
    avatar_url: z.string().url().nullable().optional(),
    native_language: z.string().trim().min(2).max(60).nullable().optional(),
    learning_language: z.string().trim().min(2).max(60).nullable().optional(),
    level: z.string().trim().min(2).max(40).nullable().optional(),
    goal: z.string().trim().max(500).nullable().optional(),
    days_per_week: z.number().int().min(1).max(7).nullable().optional(),
  })
  .strict()
  .refine(
    (body) => Object.keys(body).length > 0,
    "At least one field is required"
  )
  .openapi("ProfileUpdate");

export const ProfileResponseSchema = z
  .object({ data: ProfileSchema })
  .openapi("ProfileResponse");

export const RegistrationInputSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .openapi({ example: "Ada Mensah" }),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .openapi({ example: "ada@example.com" }),
    password: z
      .string()
      .min(8)
      .max(128)
      .openapi({ example: "strong-password" }),
    role: z.enum(["learner", "guide"]).openapi({ example: "learner" }),
  })
  .strict()
  .openapi("RegistrationInput");

export const RegistrationResponseSchema = z
  .object({
    data: z.object({
      profile: ProfileSchema,
      custom_token: z.string(),
      token_type: z.literal("firebase_custom_token"),
    }),
  })
  .openapi("RegistrationResponse");
