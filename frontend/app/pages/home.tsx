
import { LessonPlanCard } from "../components/LessonPlanCard";
import { NavBar } from "../components/NavBar";
import { useAuth } from "~/components/AuthProvider";
import { Navigate, NavLink } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabaseClient";

type LessonPlan = {
  id: string;
  main_theme: string;
  secondary_theme: string;
  age_group: string;
  objective: string;
  subject: string;
  duration_minutes: number;
  resources?: string;
  evaluation_rubric?: string;
  intro_ludica?: string;
  objetivo_bncc?: string;
  steps?: string;
  mensagem_erro?: string | null;
  created_at: string;
};

export const HomePage = () => {
  const { session, loading } = useAuth();

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const fetchLessonPlans = async () => {
      setLoadingPlans(true);
      setError(null);

      try {
        const { data, error } = await supabase.functions.invoke("getAllLessonPlan", {
          method: "GET",
        });

        if (error) {
          setError(error.message || "Failed to fetch lesson plans");
        } else {
          setLessonPlans(data.data || []);
        }
      } catch (e) {
        console.error(e);
        setError("An unexpected error occurred");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchLessonPlans();
  }, [session]);

  if (loading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;

  return (
    <>
      <NavBar />
      <div className="w-full flex flex-col items-center justify-center gap-6 mt-6">
        {loadingPlans && <div>Loading lesson plans...</div>}
        {error && <div className="text-red-600 font-semibold">{error}</div>}
        {!loadingPlans && !error && lessonPlans.length === 0 && <div>No lesson plans found</div>}

        {!loadingPlans &&
          lessonPlans.map((plan) => (
            <NavLink key={plan.id} to={`/`} className="w-full flex items-center justify-center">
              <LessonPlanCard
                main_theme={plan.main_theme}
                secondary_theme={plan.secondary_theme}
                age_group={plan.age_group}
                objective={plan.objective}
                subject={plan.subject}
                duration={plan.duration_minutes}
                resources={plan.resources}
                evaluation_rubric={plan.evaluation_rubric}
                intro_ludica={plan.intro_ludica}
                objetivo_bncc={plan.objetivo_bncc}
                steps={plan.steps}
                mensagem_erro={plan.mensagem_erro}
              />
            </NavLink>
          ))}
      </div>
    </>
  );
};

