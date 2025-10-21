import { GoogleGenAI } from "npm:@google/genai";
import { z } from "npm:zod";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RequestPayloadSchema = z.object({
  main_theme: z.string().min(1, "Main theme is required"),
  secondary_theme: z.string().min(1, "Secondary theme is required"),
  objective: z.string().min(1, "Objective is required"),
  subject: z.string().min(1, "Subject is required"),
  age_group: z.string().min(1, "Age group is required"),
  resources: z.string().min(1, "Resources are required"),
  duration_minutes: z.number().int().positive(
    "Duration must be a positive integer",
  ),
});

type RequestPayload = z.infer<typeof RequestPayloadSchema>;

const AiOutputSchema = z.object({
  intro_ludica: z.string().nullable(),
  objetivo_bncc: z.string().nullable(),
  steps: z.string().nullable(),
  evaluation_rubric: z.string().nullable(),
  mensagem_erro: z.string().nullable(),
});

type AiOutput = z.infer<typeof AiOutputSchema>;

interface ErrorResponse {
  message: string;
  details?: string;
  statusCode: number;
}

const JSON_HEADERS = {
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

function aiFormattedError(message: string, status: number = 500): Response {
  return new Response(
    JSON.stringify({
      intro_ludica: null,
      objetivo_bncc: null,
      steps: null,
      evaluation_rubric: null,
      mensagem_erro: message,
    } as AiOutput),
    { status, headers: JSON_HEADERS },
  );
}

function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return value;
}

function sanitize(input: string): string {
  return input.replace(/[{}$]/g, "");
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return createErrorResponse("Method Not Allowed", 405);
  }

  let payload: RequestPayload;
  try {
    const requestBody = await req.json();
    const parseResult = RequestPayloadSchema.safeParse(requestBody);

    if (!parseResult.success) {
      return aiFormattedError(
        `Invalid request payload: ${
          parseResult.error.issues.map((issue) =>
            `${issue.path.join(".")}: ${issue.message}`
          ).join("; ")
        }`,
        400,
      );
    }
    payload = parseResult.data;
  } catch (e: unknown) {
    return aiFormattedError("Invalid JSON in request body", 400);
  }

  let apiKey: string;
  try {
    apiKey = getEnv("GEMINI_API_KEY");
  } catch (e: unknown) {
    console.error(e);
    return aiFormattedError(
      "Server configuration error: Missing GEMINI_API_KEY environment variable",
      500,
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Seu nome é Matheus e você é um assistente pedagógico especializado em criar planos de aula lúdicos, você sempre busca facilitar o aprendizado de seus alunos com explicações de fácil entendimento e bem detalhadas. Você sempre monta suas explicações seguindo a risca as regras do BNCC.

    Visando sua responsabilidade e de gerar um plano de aula para um professor iniciante que busca auxílio para iniciar na carreira, gere planos de aula personalizados seguindo suas regras internas. Para construir esse plano siga obrigatoriamente a estrutura abaixo:

    1. Criar uma introdução lúdica que apresente o tema de forma criativa e engajadora.
    2. Elaborar um passo a passo detalhado da atividade, incluindo instruções claras e sequenciais.
    3. Gerar uma rubrica de avaliação, com critérios objetivos que permitam à professora avaliar o aprendizado.
    4. Garantir que o objetivo de aprendizagem esteja alinhado à BNCC.

    Para construir esse plano de aula, você deve se basear obrigatoriamente nas variáveis abaixo:

    * Tema principal da atividade: ${sanitize(payload.main_theme)}
    * Tema secundário da atividade: ${sanitize(payload.secondary_theme)}
    * Matéria escolar: ${sanitize(payload.subject)}
    * Objetivo de aprendizagem (deve estar alinhado à BNCC): ${
    sanitize(payload.objective)
  }
    * Faixa etária ou série escolar: ${sanitize(payload.age_group)}
    * Recursos disponíveis para a atividade: ${sanitize(payload.resources)}
    * Duração da atividade em minutos (número inteiro positivo): ${payload.duration_minutes} minutos

    Após a análise e criação do plano de aula personalizado o seu Output deve seguir obrigatoriamente o seguinte formato:
    (Não é permitido devolver qualquer Output que não siga o formato abaixo)

    JSON válido, em um único bloco de texto, com a seguinte estrutura:

    {
      "intro_ludica": "texto da introdução criativa e engajadora",
      "objetivo_bncc": "descrição do objetivo de aprendizagem alinhado à BNCC",
      "steps": "- Passo 1: descrição do primeiro passo\\n- Passo 2: descrição do segundo passo\\n- Passo 3: descrição do terceiro passo\\n ...",
      "evaluation_rubric": "Critério 1: descrição\\nCritério 2: descrição\\nCritério 3: descrição\\n ...",
      "mensagem_erro": null
    }

    * Se houver algum erro ou variável inválida, preencha apenas o campo "mensagem_erro" com a descrição do problema e deixe os demais campos nulos ou vazios.
    * Certifique-se de que o JSON seja sempre parseável.
    * O texto deve ser claro, didático e adequado à faixa etária indicada.
  `;

  const prompt =
    "Gere um plano de aulas personalizados seguindo as suas regras internas.";

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

    const rawText = response.data;

    if (!rawText) {
      console.error("Empty AI response", response);
      return aiFormattedError("Empty response from AI model");
    }

    let parsed: AiOutput;

    try {
      const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : rawText;

      parsed = JSON.parse(jsonString);

      const validationResult = AiOutputSchema.safeParse(parsed);
      if (!validationResult.success) {
        console.error(
          "AI response schema validation failed:",
          validationResult.error.issues,
        );
        return aiFormattedError(
          "AI response format invalid after parsing",
          500,
        );
      }
      parsed = validationResult.data;
    } catch (e: unknown) {
      console.warn(
        "Unable to parse or validate JSON from AI response:",
        (e instanceof Error) ? e.message : e,
        rawText,
      );
      return aiFormattedError("AI response not in expected JSON format", 500);
    }

    if (parsed.mensagem_erro) {
      return aiFormattedError(parsed.mensagem_erro, 400);
    }

    const safeOutput: AiOutput = AiOutputSchema.parse(parsed);

    return new Response(
      JSON.stringify(safeOutput),
      { headers: JSON_HEADERS, status: 200 },
    );
  } catch (e: unknown) {
    console.error("Unhandled error:", (e instanceof Error) ? e.message : e);
    return aiFormattedError("Internal server error", 500);
  }
});
