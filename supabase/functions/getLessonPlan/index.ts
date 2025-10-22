import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const LessonPlanIdSchema = z.string().uuid("Invalid lesson plan ID format");

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

  if (req.method !== "GET") {
    return createErrorResponse("Method Not Allowed", 405);
  }

  const url = new URL(req.url);
  const lessonPlanIdParam = url.searchParams.get("lesson_plan_id");

  if (!lessonPlanIdParam) {
    return createErrorResponse(
      "Missing required query parameter: lesson_plan_id",
      400,
      "Example: /get-lesson-plan?lesson_plan_id=YOUR_UUID_HERE",
    );
  }

  let lessonPlanId: string;
  try {
    lessonPlanId = LessonPlanIdSchema.parse(lessonPlanIdParam);
  } catch (e: unknown) {
    return createErrorResponse(
      "Invalid lesson_plan_id format",
      400,
      (e instanceof z.ZodError)
        ? e.issues.map((issue) => issue.message).join("; ")
        : "ID must be a valid UUID",
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
    const { data, error } = await supabase.from("lesson_plans").select("*").eq(
      "id",
      lessonPlanId,
    ).single();

    if (error) {
      console.error("Supabase select error (impersonated user):", error);
      if (error.code === "PGRST116") {
        return createErrorResponse(
          "Lesson plan not found",
          404,
          `No lesson plan found with ID: ${lessonPlanId} or you do not have permission to view it.`,
        );
      }
      return createErrorResponse(
        "Failed to retrieve lesson plan (RLS check failed)",
        403,
        error.message,
      );
    }

    const successBody: SuccessResponse<typeof data> = { data };
    return new Response(JSON.stringify(successBody), {
      headers: JSON_HEADERS,
      status: 200,
    });
  } catch (e: unknown) {
    console.error(
      "Unexpected server error during lesson plan selection (impersonated):",
      (e instanceof Error) ? e.message : e,
    );
    return createErrorResponse(
      "An unexpected error occurred",
      500,
      (e instanceof Error) ? e.message : "Unknown error",
    );
  }
});
