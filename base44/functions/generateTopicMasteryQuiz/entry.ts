import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { z } from "npm:zod";

const GenerateQuizRequestSchema = z.object({
  topicId: z.string().min(1),
  subtopicIds: z.array(z.string()).min(1),
  gradeLevel: z.string().min(1),
  subject: z.string().min(1)
});

const GeneratedQuestionSchema = z.object({
  question_text: z.string(),
  options: z.array(z.string()).length(4),
  correct_index: z.number().min(0).max(3),
  explanation: z.string(),
  tp_level: z.number().min(1).max(6),
  subtopic_id: z.string()
});

const GeneratedQuizResponseSchema = z.object({
  questions: z.array(GeneratedQuestionSchema)
});

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // 1. Zod Validation for Request Payload
    const parseResult = GenerateQuizRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json({ success: false, error: "Invalid request payload", details: parseResult.error.format() }, { status: 400 });
    }
    const data = parseResult.data;

    // 2. Context Fetching (Subtopics & Curriculum context)
    let contextStr = "";
    for (const subId of data.subtopicIds) {
      const subtopic = await base44.asServiceRole.entities.Subtopic.get(subId).catch(() => null);
      if (subtopic) {
        contextStr += `\nSubtopic ID: ${subId}\nTitle: ${subtopic.title || ""}\nContent: ${subtopic.content || subtopic.learning_objective || ""}\n`;
      }
    }

    // 3. Prompt Construction with strict N x 5 rules
    const systemPrompt = `You are an expert KPM (Kementerian Pendidikan Malaysia) EdTech content generator.
Your objective is to generate multiple-choice questions for a diagnostic topic quiz based STRICTLY on the provided subtopics.

STRICT GENERATION RULES (N x 5 Ratio):
For EACH subtopic ID provided, you MUST generate exactly 5 questions with the following Tahap Penguasaan (TP) distribution:
- 2 questions at TP1-2 (Basic knowledge/understanding)
- 2 questions at TP3-4 (Application/Analysis)
- 1 question at TP5-6 (Evaluation/Creation/KBAT)

You MUST generate 4 options per question.
You MUST output valid JSON only.

Context:
Grade: ${data.gradeLevel}
Subject: ${data.subject}
${contextStr}`;

    const prompt = `Generate the quiz questions for the following subtopic IDs: ${data.subtopicIds.join(", ")}. Return only JSON matching the required schema.`;

    // Helper function with 1-tier retry logic
    const invokeLLMWithRetry = async (retryCount = 1) => {
      let attempts = 0;
      while (attempts <= retryCount) {
        try {
          const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            systemPrompt,
            responseFormat: "json"
          });
          
          let parsedResponse;
          if (typeof aiResponse === "string") {
            const jsonStr = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
            parsedResponse = JSON.parse(jsonStr);
          } else {
            parsedResponse = aiResponse;
          }

          // Validate AI output using Zod
          const validated = GeneratedQuizResponseSchema.parse(parsedResponse);
          
          // Ensure exact ratio
          for (const subId of data.subtopicIds) {
            const subQuestions = validated.questions.filter(q => q.subtopic_id === subId);
            if (subQuestions.length !== 5) {
              throw new Error(`Subtopic ${subId} must have exactly 5 questions, found ${subQuestions.length}`);
            }
          }

          return validated;
        } catch (e: any) {
          attempts++;
          console.warn(`LLM attempt ${attempts} failed:`, e.message);
          if (attempts > retryCount) {
            throw new Error(`Failed to generate valid quiz after ${attempts} attempts: ${e.message}`);
          }
        }
      }
    };

    // 4. Generate & Parse AI Content
    const generatedContent = await invokeLLMWithRetry(1);

    // 5. Save Questions to Database
    const savedQuestions = [];
    for (const q of generatedContent!.questions) {
      const dbQuestion = await base44.asServiceRole.entities.QuestionBank.create({
        topic_id: data.topicId,
        subtopic_id: q.subtopic_id,
        question_text: q.question_text,
        options: JSON.stringify(q.options),
        correct_index: q.correct_index,
        explanation: q.explanation,
        tp_level: q.tp_level,
        status: "published"
      });
      savedQuestions.push(dbQuestion);
    }

    return Response.json({
      success: true,
      questions_generated: savedQuestions.length,
      questions: savedQuestions
    });

  } catch (error: any) {
    console.error("Quiz Generator Error:", error);
    return Response.json({ success: false, error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
