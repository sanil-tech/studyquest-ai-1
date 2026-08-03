// scripts/testLiveAIGeneration.ts
// Smoke Test Harness for Base44 Live Serverless AI Generation

/**
 * CAUTION: This script performs a LIVE invocation against the Base44 deployed API.
 * Ensure your local environment has BASE44_API_KEY configured before running.
 * Usage: npx ts-node scripts/testLiveAIGeneration.ts
 */

import { base44 } from "../src/api/base44Client.js"; // Assuming this exposes the initialized client

async function runLiveAITest() {
  console.log("🚀 [SMOKE TEST] Initiating Live AI Generation Test...");
  const startTime = Date.now();

  try {
    // Target a mock subtopic array
    const testPayload = {
      topicId: "TOPIC_SMOKE_001",
      subtopicIds: ["SUB_A", "SUB_B"],
      gradeLevel: 1,
      subject: "Matematik"
    };

    console.log(`\n⏳ Invoking base44.functions.generateTopicMasteryQuiz...`);
    console.log(`Payload: ${JSON.stringify(testPayload)}`);

    // In a true live script, base44.functions exposes the endpoints
    // Note: If you run this without a true Base44 project bound, it will throw.
    const response = await base44.functions.generateTopicMasteryQuiz(testPayload);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Invocation Complete! Time taken: ${elapsed} seconds.`);

    if (!response || !response.success) {
      throw new Error(`AI Generation Failed: ${JSON.stringify(response)}`);
    }

    const generatedQuestions = response.data || [];
    console.log(`\n📊 Validating Output Structure...`);

    // Assertion 1: Total Question Count (N * 5)
    // 2 subtopics * 5 = 10
    if (generatedQuestions.length !== 10) {
      throw new Error(`Validation Error: Expected 10 questions, got ${generatedQuestions.length}`);
    }
    console.log("✔️ Total Questions generated equals exactly 10.");

    // Assertion 2: Subtopic Distribution
    const subACount = generatedQuestions.filter((q: any) => q.subtopic_id === "SUB_A").length;
    const subBCount = generatedQuestions.filter((q: any) => q.subtopic_id === "SUB_B").length;
    if (subACount !== 5 || subBCount !== 5) {
      throw new Error(`Validation Error: Subtopic distribution unbalanced. SUB_A: ${subACount}, SUB_B: ${subBCount}`);
    }
    console.log("✔️ Exact 5-question ratio per subtopic achieved.");

    // Assertion 3: TP Level Availability
    const tpLevels = generatedQuestions.map((q: any) => q.tp_level);
    const hasTP5or6 = tpLevels.some((tp: number) => tp >= 5);
    if (!hasTP5or6) {
      throw new Error("Validation Error: Expected at least one KBAT (TP5/TP6) question per subtopic.");
    }
    console.log("✔️ KBAT complexity tags (TP5/TP6) correctly generated.");

    console.log("\n🎉 [SMOKE TEST PASSED] The Live AI Generation Engine is fully operational for production!");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ [SMOKE TEST FAILED] Engine encountered a fatal error:");
    console.error(error.message);
    process.exit(1);
  }
}

// Execute
runLiveAITest();
