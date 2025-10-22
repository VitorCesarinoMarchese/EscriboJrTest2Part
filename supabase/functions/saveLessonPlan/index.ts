import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const LessonPlanPayloadSchema = z.object({
  main_theme: z.string().min(1, "Main theme cannot be empty"),
  secondary_theme: z.string().min(1, "Secondary theme cannot be empty"),
  objective: z.string().min(1, "Objective cannot be empty"),
  subject: z.string().min(1, "Subject cannot be empty"),
  age_group: z.string().min(1, "Age group cannot be empty"),
  resources: z.string().min(1, "Resources cannot be empty"),
  duration_minutes: z.number().int().positive(
    "Duration must be a positive integer",
  ),
  introduction: z.string().optional(),
  steps: z.string().optional(),
  evaluation_rubric: z.string().optional(),
  user_id: z.string().uuid("Invalid user ID format"),
});

type LessonPlanPayload = z.infer<typeof LessonPlanPayloadSchema>;

interface ErrorResponse {
  message: string;
  details?: string;
  statusCode: number;
}

interface SuccessResponse<T> {
  data: T;
}

const JSON_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, x-client-info",
  "Content-Type": "application/json",
};

function createErrorResponse(
  message: string,
  statusCode: number,
  details?: string,
): Response {
  const errorBody: ErrorResponse = { message, statusCode };
  if (details) errorBody.details = details;
  return new Response(JSON.stringify(errorBody), {
    status: statusCode,
    headers: JSON_HEADERS,
  });
}

function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: JSON_HEADERS });
  }

  if (req.method !== "POST") {
    return createErrorResponse("Method Not Allowed", 405);
  }

  let payload: LessonPlanPayload;

  try {
    const body = await req.json();
    const parseResult = LessonPlanPayloadSchema.safeParse(body);

    if (!parseResult.success) {
      return createErrorResponse(
        "Invalid request payload",
        400,
        parseResult.error.issues.map((issue) =>
          `${issue.path.join(".")}: ${issue.message}`
        ).join("; "),
      );
    }
    payload = parseResult.data;
  } catch (e) {
    return createErrorResponse(
      "Invalid JSON in request body",
      400,
      (e instanceof Error) ? e.message : "Unknown error parsing JSON",
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return createErrorResponse(
      "Authentication required",
      401,
      "Missing Authorization header",
    );
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return createErrorResponse(
      "Authentication required",
      401,
      "Invalid Authorization header format. Expected 'Bearer <token>'",
    );
  }
  const userJwt = parts[1];

  let supabase;
  try {
    const supabaseUrl = getEnv("SUPA_URL");
    const supabaseServiceRoleKey = getEnv("SUPA_SERVICE_ROLE_KEY");

    supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: userJwt,
      refresh_token: userJwt,
    });
    if (sessionError) {
      console.error(
        "Error setting session for RLS (impersonation):",
        sessionError,
      );
      return createErrorResponse(
        "Authentication failed",
        401,
        `Could not impersonate user: ${sessionError.message}`,
      );
    }
  } catch (e: unknown) {
    console.error(
      "Environment variable error or Supabase client init failed:",
      (e instanceof Error) ? e.message : e,
    );
    return createErrorResponse(
      "Server configuration error",
      500,
      "Missing environment variables or failed Supabase client initialization.",
    );
  }

  try {
    const { data, error } = await supabase.from("lesson_plans").insert({
      user_id: payload.user_id,
      main_theme: payload.main_theme,
      secondary_theme: payload.secondary_theme,
      objective: payload.objective,
      subject: payload.subject,
      age_group: payload.age_group,
      resources: payload.resources,
      duration_minutes: payload.duration_minutes,
      introduction: payload.introduction,
      steps: payload.steps,
      evaluation_rubric: payload.evaluation_rubric,
    })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error (impersonated user):", error);
      return createErrorResponse(
        "Failed to save lesson plan (RLS check failed)",
        403,
        error.message,
      );
    }

    const successBody: SuccessResponse<typeof data> = { data };
    return new Response(JSON.stringify(successBody), {
      headers: JSON_HEADERS,
      status: 201,
    });
  } catch (e) {
    console.error(
      "Unexpected server error during lesson plan insertion (impersonated):",
      (e instanceof Error) ? e.message : e,
    );
    return createErrorResponse(
      "An unexpected error occurred",
      500,
      (e instanceof Error) ? e.message : "Unknown error",
    );
  }
});
