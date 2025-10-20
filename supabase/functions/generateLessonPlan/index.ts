import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI } from "npm:@google/genai";

type Request_Payload = {
  main_theme: string;
  secondary_theme: string;
  objective: string;
  subject: string;
  age_group: string;
  resources: string;
  duration_minutes: number;
};

type Ai_Output = {
  intro_ludica: string | null;
  objetivo_bncc: string | null;
  steps: string | null;
  evaluation_rubric: string | null;
  mensagem_erro: string | null;
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

function badRequest(message: string) {
  return new Response(
    JSON.stringify({
      intro_ludica: null,
      objetivo_bncc: null,
      steps: null,
      evaluation_rubric: null,
      mensagem_erro: message,
    } as Ai_Output),
    { status: 400, headers: jsonHeaders },
  );
}

function serverError(message: string, status = 500) {
  return new Response(
    JSON.stringify({
      intro_ludica: null,
      objetivo_bncc: null,
      steps: null,
      evaluation_rubric: null,
      mensagem_erro: message,
    } as Ai_Output),
    { status, headers: jsonHeaders },
  );
}

function sanitize(input: string) {
  return input.replace(/[{}$]/g, "");
}

Deno.serve(async (req): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: Partial<Request_Payload>;
  try {
    payload = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const {
    main_theme,
    secondary_theme,
    objective,
    subject,
    age_group,
    resources,
    duration_minutes,
  } = payload;

  if (
    !main_theme ||
    !secondary_theme ||
    !objective ||
    !subject ||
    !age_group ||
    !resources ||
    !duration_minutes
  ) {
    return badRequest("Missing required fields in request payload");
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return serverError("Missing GEMINI_API_KEY environment variable");
  }

  const ai = new GoogleGenAI({ apiKey: Deno.env.get("GEMINI_API_KEY") });

  const systemInstruction =
    `Seu nome é Matheus e você e um assistente pedagógico especializado em criar planos de aula lúdicos, você sempre busca facilitar o aprendizado de seus alunos com explicacoes de facil entendimento e bem detalhadas. você sempre monta suas explicacoes seguindo a risca as regras do bncc.

    Visando sua responsabiliade e de gerar um plano de aula para um professor iniciante que busca auxilio para iniciar na carreira, gere planos de aula personalizados seguindo suas regras internas. Para construir esse plano siga obrigatoriamente a estrutura abaixo:

    1. criar uma introdução lúdica que apresente o tema de forma criativa e engajadora.
    2. elaborar um passo a passo detalhado da atividade, incluindo instruções claras e sequenciais.
    3. gerar uma rubrica de avaliação, com critérios objetivos que permitam à professora avaliar o aprendizado.
    4. garantir que o objetivo de aprendizagem esteja alinhado à bncc.

    Para construir esse plano de aula, você deve se basear obrigatoriamente nas variáveis abaixo:

    * tema principal da atividade:${sanitize(main_theme)}
    * tema secundário da atividade: ${sanitize(secondary_theme)}
    * matéria escolar: ${sanitize(subject)}
    *objetivo de aprendizagem (deve estar alinhado à bncc):  ${
      sanitize(objective)
    }
    * faixa etária ou série escolar:  ${sanitize(age_group)}
    * recursos disponíveis para a atividade:  ${sanitize(resources)}
    * duração da atividade em minutos (número inteiro positivo):  ${duration_minutes} minutos

    Apos a analise e criacao do plano de aula personalizado o seu Output deve seguir obrigatoriamente o seguinte formato:
    (Nao e permitido devolver qualquer Output que nao siga o formato abaixo)

    json válido, em um único bloco de texto, com a seguinte estrutura:

    {
      "intro_ludica": "texto da introdução criativa e engajadora",
      "objetivo_bncc": "descrição do objetivo de aprendizagem alinhado à bncc",
      "steps": "- Passo 1: descrição do primeiro passo\n- Passo 2: descrição do segundo passo\n- Passo 3: descrição do terceiro passo\n ...",
      "evaluation_rubric": "Critério 1: descrição\nCritério 2: descrição\nCritério 3: descrição\n ...",
      "mensagem_erro": null
    }

    * se houver algum erro ou variável inválida, preencha apenas o campo "mensagem_erro" com a descrição do problema e deixe os demais campos nulos ou vazios.
    * certifique-se de que o json seja sempre parseável.
    * o texto deve ser claro, didático e adequado à faixa etária indicada.

`;

  const prompt = `
  Gere um plano de aulas personalizados seguindo as suas regras internas.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 1,
        systemInstruction,
        maxOutputTokens: 3000,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    const raw = response && response.text ? String(response.text).trim() : "";

    if (!raw) {
      console.error("Empty AI response", response);
      return serverError("Empty response from AI model");
    }

    let parsed: Ai_Output;

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");

      parsed = JSON.parse(raw);
    } catch (e) {
      console.warn(
        "Unable to locate JSON block in AI response",
        raw,
      );
      return serverError("AI response not in expected JSON format");
    }

    if (!parsed) {
      return serverError("AI returned unexpected content");
    }

    if (parsed.mensagem_erro) {
      return badRequest(parsed.mensagem_erro);
    }

    const safeOutput: Ai_Output = {
      intro_ludica: parsed.intro_ludica ?? null,
      objetivo_bncc: parsed.objetivo_bncc ?? null,
      steps: parsed.steps ?? null,
      evaluation_rubric: parsed.evaluation_rubric ?? null,
      mensagem_erro: null,
    };

    return new Response(
      JSON.stringify(safeOutput),
      { headers: jsonHeaders, status: 200 },
    );
  } catch (e: any) {
    console.error("Unhandled error: ", e);
    return serverError("Internal server error");
  }
});
