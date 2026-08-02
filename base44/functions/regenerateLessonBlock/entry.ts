// base44/functions/regenerateLessonBlock/entry.ts
// Phase 5: Token Optimization - Single Block Regeneration Edge Function
// Allows admins/teachers to regenerate only a single rejected content block (e.g. Quiz or Flashcard deck) without re-generating the entire 7-part lesson package.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface BlockRegenInput {
  block_id: string;
  custom_instruction?: string;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: BlockRegenInput = await req.json().catch(() => ({}));

    if (!body.block_id) {
      return Response.json(
        { success: false, error: "block_id diperlukan." },
        { status: 400 }
      );
    }

    const block = await base44.asServiceRole.entities.LessonBlock.get(body.block_id).catch(() => null);
    if (!block) {
      return Response.json(
        { success: false, error: "Blok kandungan tidak ditemui." },
        { status: 404 }
      );
    }

    const version = await base44.asServiceRole.entities.LessonVersion.get(block.lesson_version_id).catch(() => null);
    const skCode = version?.sk_code || "SK 1.1 Pecahan";
    const spCode = block.sp_code || version?.sp_code || "SP 1.1.1 Penambahan Pecahan";
    const customInstr = body.custom_instruction ? `\nArahan Tambahan Admin: ${body.custom_instruction}` : "";

    const systemPrompt = `Anda ialah Pakar Penggubal Kandungan DSKP KPM. Regenerasi HANYA komponen ${block.block_type} bagi ${skCode} - ${spCode}.${customInstr}`;

    let jsonSchema: any = {};

    if (block.block_type === "FLASHCARD_DECK") {
      jsonSchema = {
        type: "object",
        properties: {
          cards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front: { type: "string" },
                back: { type: "string" },
                explanation: { type: "string" },
              },
              required: ["front", "back"],
            },
          },
        },
        required: ["cards"],
      };
    } else if (block.block_type === "MIND_MAP") {
      jsonSchema = {
        type: "object",
        properties: {
          branches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                subtopics: { type: "array", items: { type: "string" } },
              },
              required: ["title", "subtopics"],
            },
          },
        },
        required: ["branches"],
      };
    } else if (block.block_type === "INTERACTIVE_GAME") {
      jsonSchema = {
        type: "object",
        properties: {
          title: { type: "string" },
          instructions: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                left: { type: "string" },
                right: { type: "string" },
              },
              required: ["left", "right"],
            },
          },
        },
        required: ["title", "instructions", "items"],
      };
    } else {
      jsonSchema = {
        type: "object",
        properties: {
          title: { type: "string" },
          markdown: { type: "string" },
        },
        required: ["markdown"],
      };
    }

    const llmRes = await base44.asServiceRole.integrations.CoreLLM.invokeLLM({
      systemPrompt,
      prompt: `Penjanaan semula blok ${block.title || block.block_type} untuk ${spCode}.`,
      responseFormat: "json",
      jsonSchema,
    });

    const newPayload = typeof llmRes === "string" ? JSON.parse(llmRes) : llmRes;

    const updatedBlock = await base44.asServiceRole.entities.LessonBlock.update(block.id, {
      payload: newPayload,
      status: "draft",
    });

    return Response.json({
      success: true,
      message: `Blok ${block.block_type} berjaya dijana semula!`,
      block: updatedBlock,
    });
  } catch (error: any) {
    console.error("regenerateLessonBlock error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat semasa menjana semula blok." },
      { status: 500 }
    );
  }
}
