# EscriboJrTest2Part – Gerador de Planos de Aula com IA

## Visão Geral

Este projeto foi desenvolvido como parte do **Teste Técnico 2 da Escribo**.  
O objetivo é construir um **gerador de planos de aula personalizados** utilizando **Supabase** no backend e a **API Gemini (Google AI Studio)** para geração de texto com IA.

A aplicação recebe informações sobre o tema da aula, o público e o objetivo pedagógico, e retorna um **plano de aula completo** com:

- Introdução lúdica
- Objetivo de aprendizagem alinhado à BNCC
- Passo a passo detalhado
- Rubrica de avaliação

---
## Link

- supabase link: https://supabase.com/dashboard/project/fdlebyjvvgtiuwmsgxxw

## Modelo de IA Escolhido

Após análise da [documentação oficial do Google AI Studio](https://ai.google.dev/gemini-api/docs/models), o modelo selecionado foi:

> **Gemini 2.5 Flash**

**Motivos da escolha:**

- Excelente equilíbrio entre **qualidade de geração de texto**, **velocidade** e **custo**.
- Ideal para aplicações **textuais e estruturadas**, como planos de aula.
- Possui **ótima performance** para tarefas de compreensão e síntese de informações.
- Pode ser facilmente substituído pelo **Gemini 2.5 Pro** caso se deseje maior profundidade de raciocínio no futuro.

---

## Inputs do Usuário

O usuário deve fornecer as seguintes informações para gerar um plano de aula completo e personalizado:

| Campo                        | Descrição                                | Exemplo                                         |
| ---------------------------- | ---------------------------------------- | ----------------------------------------------- |
| **Tema principal**           | Assunto central da aula                  | Frações, Meio Ambiente, Sistema Solar           |
| **Tema secundário**          | Subtema complementar                     | Reciclagem, Partes do corpo, Equilíbrio químico |
| **Objetivo de aprendizagem** | O que se espera que o aluno aprenda      | Compreender o conceito de fração                |
| **Matéria**                  | Área do conhecimento                     | Matemática, Ciências, Português                 |
| **Faixa etária / série**     | Nível de ensino do público-alvo          | 5º ano do fundamental                           |
| **Recursos disponíveis**     | Materiais e ferramentas para o professor | Papel, tesoura, régua, cartolina                |
| **Duração estimada**         | Tempo total da atividade                 | 45 minutos                                      |

---

## Estrutura do Banco de Dados

A modelagem foi criada no **Supabase** utilizando **PostgreSQL**.  
Abaixo, as tabelas principais e suas descrições.

---

### Tabela `users`

| Campo          | Tipo                        | Descrição                                                     |
| -------------- | --------------------------- | ------------------------------------------------------------- |
| **id**         | `uuid`                      | PK, referência ao `auth.users.id` do Supabase                 |
| **name**       | `text`                      | Nome completo do usuário (pode vir do perfil de autenticação) |
| **role**       | `text`                      | Tipo de usuário (`teacher`, `admin`, etc.)                    |
| **created_at** | `timestamptz DEFAULT now()` | Data de criação do registro                                   |
| **updated_at** | `timestamptz DEFAULT now()` | Última atualização do registro                                |

---

### Tabela `lesson_plans`

| Campo                 | Tipo                                         | Descrição                        |
| --------------------- | -------------------------------------------- | -------------------------------- |
| **id**                | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` | Identificador único do plano     |
| **user_id**           | `uuid REFERENCES users(id)`                  | Autor do plano de aula           |
| **main_theme**        | `varchar(150)`                               | Tema principal                   |
| **secondary_theme**   | `varchar(150)`                               | Subtema complementar             |
| **objective**         | `text`                                       | Objetivo de aprendizagem         |
| **subject**           | `varchar(100)`                               | Área do conhecimento             |
| **age_group**         | `varchar(50)`                                | Faixa etária / série             |
| **resources**         | `text`                                       | Materiais necessários            |
| **duration_minutes**  | `integer`                                    | Duração total em minutos         |
| **introduction**      | `text`                                       | Introdução lúdica gerada pela IA |
| **steps**             | `text`                                       | Passo a passo das atividades     |
| **evaluation_rubric** | `text`                                       | Rubrica de avaliação             |
| **created_at**        | `timestamptz DEFAULT now()`                  | Data de criação                  |
| **updated_at**        | `timestamptz DEFAULT now()`                  | Última atualização               |

---

## Políticas de Segurança (RLS)

As políticas de **Row Level Security (RLS)** garantem que cada usuário só acesse seus próprios planos e conta.

### `Lesson_plans` RLS

```sql
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_can_manage_own_plans"
ON lesson_plans
FOR ALL
USING (auth.uid() = user_id);
```

### `User` RLS

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Individuals can view their own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Individuals can update their own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Individuals can insert their own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "No delete by users"
ON users
FOR DELETE
USING (false);
```
