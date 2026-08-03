import { test, expect, describe } from "vitest";
import { calculateSubtopicBreakdown, EvaluateQuizRequestSchema } from "./masteryEngine.ts";

describe("Diagnostic Assessment & Gateway Engine", () => {

  describe("Zod Schema Validation", () => {
    test("Should reject payload with missing answers array", () => {
      const payload = {
        student_id: "STU123",
        assessment_id: "TOPIC456"
      };
      
      const result = EvaluateQuizRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes("answers"))).toBe(true);
      }
    });

    test("Should accept valid payload", () => {
      const payload = {
        student_id: "STU123",
        assessment_id: "TOPIC456",
        answers: [
          { question_id: "Q1", is_correct: true, subtopic_id: "SUB1", tp_level: 3 }
        ]
      };
      
      const result = EvaluateQuizRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe("Pure Gateway Logic (calculateSubtopicBreakdown)", () => {
    
    test("Full Pass Scenario: All subtopics >= 60%", () => {
      const answers = [
        // SUB1: 2/3 (67%)
        { question_id: "Q1", is_correct: true, subtopic_id: "SUB1", tp_level: 3 },
        { question_id: "Q2", is_correct: true, subtopic_id: "SUB1", tp_level: 4 },
        { question_id: "Q3", is_correct: false, subtopic_id: "SUB1", tp_level: 5 },
        // SUB2: 1/1 (100%)
        { question_id: "Q4", is_correct: true, subtopic_id: "SUB2", tp_level: 2 },
      ];

      const result = calculateSubtopicBreakdown(answers as any);
      
      expect(result.isTopicUnlocked).toBe(true);
      expect(result.failedSubtopicIds).toHaveLength(0);
      expect(result.subtopics).toHaveLength(2);
      
      const sub1 = result.subtopics.find(s => s.subtopic_id === "SUB1");
      expect(sub1?.score_percentage).toBe(67);
      expect(sub1?.max_tp_achieved).toBe(4);
      expect(sub1?.is_passed).toBe(true);
    });

    test("Remediation Scenario: One subtopic < 60%", () => {
      const answers = [
        // SUB1: 2/2 (100%)
        { question_id: "Q1", is_correct: true, subtopic_id: "SUB1", tp_level: 3 },
        { question_id: "Q2", is_correct: true, subtopic_id: "SUB1", tp_level: 4 },
        // SUB2: 1/3 (33%) -> FAILS
        { question_id: "Q4", is_correct: false, subtopic_id: "SUB2", tp_level: 2 },
        { question_id: "Q5", is_correct: false, subtopic_id: "SUB2", tp_level: 3 },
        { question_id: "Q6", is_correct: true, subtopic_id: "SUB2", tp_level: 2 },
      ];

      const result = calculateSubtopicBreakdown(answers as any);
      
      expect(result.isTopicUnlocked).toBe(false);
      expect(result.failedSubtopicIds).toContain("SUB2");
      expect(result.subtopics).toHaveLength(2);
      
      const sub2 = result.subtopics.find(s => s.subtopic_id === "SUB2");
      expect(sub2?.score_percentage).toBe(33);
      expect(sub2?.is_passed).toBe(false);
    });

    test("Edge Case: Zero division safeguard", () => {
      const result = calculateSubtopicBreakdown([]);
      
      expect(result.isTopicUnlocked).toBe(false);
      expect(result.subtopics).toHaveLength(0);
    });

  });
});
