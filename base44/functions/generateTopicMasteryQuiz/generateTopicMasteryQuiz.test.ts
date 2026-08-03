import { test, expect, describe, vi } from "vitest";

// We mock the Request and the base44 SDK since this is a unit test.
const mockInvokeLLM = vi.fn();
const mockSubtopicGet = vi.fn();
const mockQuestionBankCreate = vi.fn();

vi.mock("npm:@base44/sdk@0.8.40", () => {
  return {
    createClientFromRequest: () => ({
      asServiceRole: {
        entities: {
          Subtopic: { get: mockSubtopicGet },
          QuestionBank: { create: mockQuestionBankCreate }
        },
        integrations: {
          Core: { InvokeLLM: mockInvokeLLM }
        }
      }
    })
  };
});

// Import after mocking
import handler from "./entry.ts";

describe("generateTopicMasteryQuiz Engine", () => {
  
  test("Should fail on invalid payload (Zod validation)", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ topicId: "T1" }) // Missing subtopicIds
    });

    const res = await handler(req);
    const data = await res.json();
    
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid request payload");
  });

  test("Should successfully generate N x 5 questions and save to database", async () => {
    // Setup Mock Database
    mockSubtopicGet.mockResolvedValue({ title: "Subtopic 1", content: "Test content" });
    mockQuestionBankCreate.mockImplementation(async (data: any) => ({ id: "Q_NEW", ...data }));

    // Setup Mock LLM Response
    mockInvokeLLM.mockResolvedValue({
      questions: [
        { question_text: "Q1", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 1, subtopic_id: "S1" },
        { question_text: "Q2", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 2, subtopic_id: "S1" },
        { question_text: "Q3", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 3, subtopic_id: "S1" },
        { question_text: "Q4", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 4, subtopic_id: "S1" },
        { question_text: "Q5", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 5, subtopic_id: "S1" },
      ]
    });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        topicId: "T1",
        subtopicIds: ["S1"],
        gradeLevel: "Tahun 4",
        subject: "Matematik"
      })
    });

    const res = await handler(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.questions_generated).toBe(5);
    expect(mockQuestionBankCreate).toHaveBeenCalledTimes(5);
  });

  test("Should trigger 1-tier retry on invalid JSON / schema failure", async () => {
    mockSubtopicGet.mockResolvedValue({});
    
    // First call returns bad ratio (only 4 questions) -> fails Zod/Ratio validation
    // Second call returns correct 5 questions
    mockInvokeLLM
      .mockResolvedValueOnce({
        questions: [
          { question_text: "Q1", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 1, subtopic_id: "S1" },
        ]
      })
      .mockResolvedValueOnce({
        questions: [
          { question_text: "Q1", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 1, subtopic_id: "S1" },
          { question_text: "Q2", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 2, subtopic_id: "S1" },
          { question_text: "Q3", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 3, subtopic_id: "S1" },
          { question_text: "Q4", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 4, subtopic_id: "S1" },
          { question_text: "Q5", options: ["A","B","C","D"], correct_index: 0, explanation: "Exp", tp_level: 5, subtopic_id: "S1" },
        ]
      });

    mockQuestionBankCreate.mockClear();

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        topicId: "T1",
        subtopicIds: ["S1"],
        gradeLevel: "Tahun 4",
        subject: "Matematik"
      })
    });

    const res = await handler(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(mockInvokeLLM).toHaveBeenCalledTimes(2); // Retried once
    expect(mockQuestionBankCreate).toHaveBeenCalledTimes(5);
  });
});
