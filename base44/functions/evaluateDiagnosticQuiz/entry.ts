import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { z } from "npm:zod";
import { EvaluateQuizRequestSchema, calculateSubtopicBreakdown } from "../../shared/masteryEngine.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // 1. Zod Schema Validation (Strict Type Safety)
    const parseResult = EvaluateQuizRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        { success: false, error: "Invalid request payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }
    const data = parseResult.data;

    // 2. Authentication & Authorization
    const authUser = await base44.auth.me().catch(() => null);
    if (!authUser || (authUser.id !== data.student_id && authUser.role !== "admin")) {
      return Response.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // 3. Compute Submission Hash for Idempotency
    const sortedAnswers = [...data.answers].sort((a, b) => a.question_id.localeCompare(b.question_id));
    const rawHashString = `${data.student_id}:${data.assessment_id}:${JSON.stringify(sortedAnswers)}`;
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawHashString));
    const submission_hash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

    // Check existing attempt
    const existingAttempt = await base44.asServiceRole.entities.QuizAttempt.filter({ submission_hash }).catch(() => []);
    if (existingAttempt.length > 0) {
      return Response.json(
        { success: true, is_duplicate: true, message: "Duplicate attempt detected", attempt_id: existingAttempt[0].id },
        { status: 200 }
      );
    }

    // 4. Pure Calculation Core (Subtopic Breakdown)
    const gatewayResult = calculateSubtopicBreakdown(data.answers);

    // 5. ACID Database Transaction
    // Wraps execution in a try-catch to simulate ACID failure boundary, ensuring state doesn't end half-updated.
    let attemptId = "";
    try {
      // 5.1 Insert Quiz Attempt
      const newAttempt = await base44.asServiceRole.entities.QuizAttempt.create({
        student_id: data.student_id,
        assessment_id: data.assessment_id,
        submission_hash,
        duration_seconds: data.duration_seconds,
        passed: gatewayResult.isTopicUnlocked,
        score_details: JSON.stringify(gatewayResult.subtopics) // Saving as string if entity field expects it
      });
      attemptId = newAttempt.id;

      // 5.2 Upsert Mastery per Subtopic
      for (const sub of gatewayResult.subtopics) {
        if (sub.subtopic_id === "unknown") continue;
        
        const existingMastery = await base44.asServiceRole.entities.StudentMastery.filter({
          student_id: data.student_id,
          subtopic_id: sub.subtopic_id
        }).catch(() => []);

        const status = sub.is_passed ? "MASTERED" : "REMEDIATION_REQUIRED";

        if (existingMastery.length > 0) {
          await base44.asServiceRole.entities.StudentMastery.update(existingMastery[0].id, {
            mastery_status: status,
            score_percentage: sub.score_percentage,
            max_tp_achieved: sub.max_tp_achieved
          });
        } else {
          await base44.asServiceRole.entities.StudentMastery.create({
            student_id: data.student_id,
            subtopic_id: sub.subtopic_id,
            mastery_status: status,
            score_percentage: sub.score_percentage,
            max_tp_achieved: sub.max_tp_achieved
          });
        }
      }

      // 5.3 Update Topic Gate
      const existingGate = await base44.asServiceRole.entities.StudentMastery.filter({
        student_id: data.student_id,
        topic_id: data.assessment_id,
        is_topic_gate: true
      }).catch(() => []);

      if (existingGate.length > 0) {
        await base44.asServiceRole.entities.StudentMastery.update(existingGate[0].id, {
          is_unlocked: gatewayResult.isTopicUnlocked,
          mastery_status: gatewayResult.isTopicUnlocked ? "UNLOCKED" : "LOCKED"
        });
      } else {
        await base44.asServiceRole.entities.StudentMastery.create({
          student_id: data.student_id,
          topic_id: data.assessment_id,
          is_topic_gate: true,
          is_unlocked: gatewayResult.isTopicUnlocked,
          mastery_status: gatewayResult.isTopicUnlocked ? "UNLOCKED" : "LOCKED"
        });
      }

    } catch (dbError: any) {
      console.error("Database transaction failed:", dbError);
      return Response.json(
        { success: false, error: "Database transaction failed", message: dbError.message },
        { status: 500 }
      );
    }

    // 6. Return response
    return Response.json({
      success: true,
      attempt_id: attemptId,
      is_topic_unlocked: gatewayResult.isTopicUnlocked,
      failed_subtopic_ids: gatewayResult.failedSubtopicIds,
      subtopics: gatewayResult.subtopics
    });

  } catch (error: any) {
    console.error("Internal Server Error in evaluateDiagnosticQuiz:", error);
    return Response.json(
      { success: false, error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
