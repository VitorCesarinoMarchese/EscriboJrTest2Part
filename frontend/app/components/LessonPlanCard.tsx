type LessonPlanCardProps = {
  main_theme: string;
  secondary_theme: string;
  age_group: string;
  objective: string;
  subject: string;
  duration: number;
  resources?: string;
  evaluation_rubric?: string;
  intro_ludica?: string;
  objetivo_bncc?: string;
  steps?: string;
  mensagem_erro?: string | null;
};

export const LessonPlanCard = ({
  main_theme,
  secondary_theme,
  age_group,
  objective,
  subject,
  duration,
  resources,
  evaluation_rubric,
  intro_ludica,
  objetivo_bncc,
  steps,
  mensagem_erro,
}: LessonPlanCardProps) => {
  return (
    <div className="w-full max-w-4xl flex flex-col  gap-4 border border-black rounded-xl p-6 bg-white shadow">
      <ul className="list-none flex flex-col md:flex-row gap-8 text-lg">
        <li><b>Tema Principal:</b> {main_theme}</li>
        <li><b>Tema Secundário:</b> {secondary_theme}</li>
        <li><b>Faixa Etária:</b> {age_group}</li>
      </ul>

      <ul className="list-none flex flex-col md:flex-row gap-8 text-lg">
        <li><b>Objetivo:</b> {objective}</li>
        <li><b>Matéria:</b> {subject}</li>
        <li><b>Duração:</b> {duration} minutos</li>
        {resources && <li><b>Recursos:</b> {resources}</li>}
      </ul>

      {evaluation_rubric && (
        <div>
          <h3 className="font-semibold">Avaliação Rubrica</h3>
          <p>{evaluation_rubric}</p>
        </div>
      )}

      {intro_ludica && (
        <div>
          <h3 className="font-semibold">Introdução Lúdica</h3>
          <p>{intro_ludica}</p>
        </div>
      )}

      {objetivo_bncc && (
        <div>
          <h3 className="font-semibold">Objetivo BNCC</h3>
          <p>{objetivo_bncc}</p>
        </div>
      )}

      {steps && (
        <div>
          <h3 className="font-semibold">Passo a Passo</h3>
          <p>{steps}</p>
        </div>
      )}

      {mensagem_erro && (
        <p className="text-red-600 font-semibold">{mensagem_erro}</p>
      )}
    </div>
  );
};

