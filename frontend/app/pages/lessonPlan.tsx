import { Navigate } from "react-router";
import { useAuth } from "~/components/AuthProvider";

type LessonPlan = {
  main_theme: string;
  secondary_theme: string;
  objective: string;
  subject: string;
  duration: number;
  resources: string;
  evaluation_rubric?: string;
  intro_ludica?: string;
  objetivo_bncc?: string;
  steps?: string;
  mensagem_erro?: string | null;
};

interface LessonPlanPageProps {
  plan: LessonPlan;
}

export const LessonPlanPage = ({ plan }: LessonPlanPageProps) => {
  const { session, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!session) return <Navigate to="/auth" replace />


  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{plan.main_theme}</h1>
      <p><strong>Secondary Theme:</strong> {plan.secondary_theme}</p>
      <p><strong>Objective:</strong> {plan.objective}</p>
      <p><strong>Subject:</strong> {plan.subject}</p>
      <p><strong>Duration:</strong> {plan.duration} min</p>
      <p><strong>Resources:</strong> {plan.resources}</p>

      {plan.evaluation_rubric && (
        <div>
          <h2 className="font-semibold">Avaliação Rubrica</h2>
          <p>{plan.evaluation_rubric}</p>
        </div>
      )}

      {plan.intro_ludica && (
        <div>
          <h2 className="font-semibold">Introdução Lúdica</h2>
          <p>{plan.intro_ludica}</p>
        </div>
      )}

      {plan.objetivo_bncc && (
        <div>
          <h2 className="font-semibold">Objetivo BNCC</h2>
          <p>{plan.objetivo_bncc}</p>
        </div>
      )}

      {plan.steps && (
        <div>
          <h2 className="font-semibold">Passo a Passo</h2>
          <p>{plan.steps}</p>
        </div>
      )}

      {plan.mensagem_erro && (
        <p className="text-red-600 font-semibold">{plan.mensagem_erro}</p>
      )}
    </div>
  );
};

