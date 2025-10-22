import type { Route } from "./+types/plan";
import { supabase } from "../utils/supabaseClient";
import { LessonPlanPage } from "../pages/lessonPlan";

// Loader
export async function loader({ params }: Route.LoaderArgs) {
  if (!params.planId) {
    throw new Response("planId is missing", { status: 400 });
  }

  try {
    // Get session token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Response("Not authenticated", { status: 401 });

    const { data, error } = await supabase.functions.invoke("getLessonPlan", {
      method: "GET",
      url: `/get-lesson-plan?lesson_plan_id=${params.planId}`,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw new Response("Failed to fetch plan", { status: 500 });
    if (!data) throw new Response("Plan not found", { status: 404 });

    return { plan: data };
  } catch (e) {
    console.error("Loader error:", e);
    throw new Response("Unexpected server error", { status: 500 });
  }
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return <LessonPlanPage plan={loaderData.plan} />;
}

