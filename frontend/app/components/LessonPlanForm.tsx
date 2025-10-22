import { useState } from 'react';
import { Navigate } from 'react-router';
import { supabase } from '~/utils/supabaseClient';

export type LessonContent = {
  evaluation_rubric: string | null;
  intro_ludica: string | null;
  mensagem_erro: string | null;
  objetivo_bncc: string | null;
  steps: string | null;
};

export const LessonPlanForm = ({ userId }: { userId: string }) => {
  const [form, setForm] = useState({
    main_theme: 'Aquecimento Global',
    secondary_theme: 'Aquecimento Global',
    objective: 'Ensinar as criancas sobre os perigos do aquecimento global',
    subject: 'Geografia',
    age_group: 'Oitavo ano',
    resources: 'Lousa, giz, projetor',
    duration: 45,
  });

  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [response, setResponse] = useState<LessonContent>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'duration' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finished) {
      setLoading(true);
      const body = {
        main_theme: form.main_theme,
        secondary_theme: form.secondary_theme,
        objective: form.objective,
        subject: form.subject,
        age_group: form.age_group,
        resources: form.resources,
        duration_minutes: form.duration,
      };
      const { data, error } = await supabase.functions.invoke('generatelessonplan',
        { body }
      )

      if (error) {
        window.alert(error)
        setLoading(false);
        setFinished(false);
      }
      else {
        setResponse(data)

        setLoading(false);
        setFinished(true);

      }
    } else {
      setLoading(true);
      const body = {
        main_theme: form.main_theme,
        secondary_theme: form.secondary_theme,
        objective: form.objective,
        subject: form.subject,
        age_group: form.age_group,
        resources: form.resources,
        duration_minutes: form.duration,
        introduction: response?.intro_ludica,
        steps: response?.steps,
        evaluation_rubric: response?.evaluation_rubric,
        user_id: userId
      };
      const { data, error } = await supabase.functions.invoke('saveLessonPlan',
        { body }
      )

      if (error) {
        window.alert(error)
        setLoading(false);
        setFinished(false);
      }
      else {
        setResponse(data)

        setLoading(false);
        setFinished(true);
        return <Navigate to="/" replace />
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 bg-white shadow rounded space-y-4">
      <div className="flex flex-wrap -mx-2">
        {/** Row 1 */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="block font-semibold">Tema Principal</label>
          <input
            type="text"
            name="main_theme"
            value={form.main_theme}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            disabled={finished}
          />
        </div>
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="block font-semibold">Tema Secundário</label>
          <input
            type="text"
            name="secondary_theme"
            value={form.secondary_theme}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            disabled={finished}
          />
        </div>

        {/** Row 2 */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="block font-semibold">Série / Faixa Etária</label>
          <input
            type="text"
            name="age_group"
            value={form.age_group}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            disabled={finished}
          />
        </div>
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="block font-semibold">Disciplina</label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            disabled={finished}
          />
        </div>

        {/** Row 3 */}
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="block font-semibold">Duração (minutos)</label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            disabled={finished}
          />
        </div>
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="block font-semibold">Recursos</label>
          <input
            type="text"
            name="resources"
            value={form.resources}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            disabled={finished}
          />
        </div>

        {/** Row 4 - textarea */}
        <div className="w-full px-2 mb-4">
          <label className="block font-semibold">Objetivo</label>
          <textarea
            name="objective"
            value={form.objective}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            disabled={finished}
          />
        </div>

        {/** Show error message if exists */}
        {response?.mensagem_erro && (
          <div className="w-full px-2 mb-4 text-red-600 font-semibold">
            {response.mensagem_erro}
          </div>
        )}



        {response && (
          <>
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label className="block font-semibold">Avaliação Rubrica</label>
              <textarea
                name="avaliacao_rubrica"
                value={response.evaluation_rubric ?? ""}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded h-32"
                disabled
              />
            </div>

            <div className="w-full md:w-1/2 px-2 mb-4">
              <label className="block font-semibold">Introdução Lúdica</label>
              <textarea
                name="introducao_ludica"
                value={response.intro_ludica ?? ""}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded h-32"
                disabled
              />
            </div>

            <div className="w-full md:w-1/2 px-2 mb-4">
              <label className="block font-semibold">Objetivo BNCC</label>
              <textarea
                name="objetivo_bncc"
                value={response.objetivo_bncc ?? ""}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded h-32"
                disabled
              />
            </div>

            <div className="w-full md:w-1/2 px-2 mb-4">
              <label className="block font-semibold">Passo a Passo</label>
              <textarea
                name="passo_a_passo"
                value={response.steps ?? ""}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded h-32"
                disabled
              />
            </div>
          </>
        )}

      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className={`w-full px-4 py-2 rounded text-white ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : finished
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
          disabled={loading}
        >
          {loading ? "Gerando..." : finished ? "Salvar" : "Gerar Plano"}
        </button>
      </div>
    </form>);
};
