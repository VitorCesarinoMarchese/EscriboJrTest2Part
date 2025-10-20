import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI } from "npm:@google/genai";

type request = {
  main_theme: string;
  secondary_theme: string;
  objective: string;
  subject: string;
  age_group: string;
  resources: string;
  duration_minutes: number;
  user_id: string;
};

Deno.serve(async (req) => {
  const {
    main_theme,
    secondary_theme,
    objective,
    subject,
    age_group,
    resources,
    duration_minutes,
    user_id,
  }: request = await req.json();

  const ai = new GoogleGenAI({ apiKey: Deno.env.get("GEMINI_API_KEY") });
  const prompt = `
    Leia atentamente as variáveis fornecidas e valide cada uma antes de gerar a saída. se alguma variável estiver ausente ou inválida, informe o erro claramente.

    variáveis:

    * ${main_theme}: tema principal da atividade
    * ${secondary_theme}: tema secundário da atividade
    * ${subject}: matéria escolar
    * ${objective}: objetivo de aprendizagem (deve estar alinhado à bncc)
    * ${age_group}: faixa etária ou série escolar
    * ${resources}: recursos disponíveis para a atividade
    * ${duration_minutes} : duração da atividade em minutos (número inteiro positivo)

    a tarefa do assistente:

    1. criar uma introdução lúdica que apresente o tema de forma criativa e engajadora.
    2. elaborar um passo a passo detalhado da atividade, incluindo instruções claras e sequenciais.
    3. gerar uma rubrica de avaliação, com critérios objetivos que permitam à professora avaliar o aprendizado.
    4. garantir que o objetivo de aprendizagem esteja alinhado à bncc.

    formato de saída: json válido, em um único bloco de texto, com a seguinte estrutura:

    {
      "intro_ludica": "texto da introdução criativa e engajadora",
      "objetivo_bncc": "descrição do objetivo de aprendizagem alinhado à bncc",
      "passo_a_passo": [
        "passo 1",
        "passo 2",
        "..."
      ],
      "rubrica_avaliacao": {
        "criterio_1": "descrição do critério de avaliação",
        "criterio_2": "descrição do critério de avaliação",
        "..."
      },
      "mensagem_erro": null
    }

    * se houver algum erro ou variável inválida, preencha apenas o campo "mensagem_erro" com a descrição do problema e deixe os demais campos nulos ou vazios.
    * certifique-se de que o json seja sempre parseável.
    * o texto deve ser claro, didático e adequado à faixa etária indicada.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction:
        `você é um assistente pedagógico especializado em criar planos de aula lúdicos e alinhados à bncc.`,
    },
  });

  const data = {
    message: `Hello!`,
  };

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
});
