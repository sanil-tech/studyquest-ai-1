const fs = require('fs');
let code = fs.readFileSync('base44/functions/generateContentAsset/entry.ts', 'utf8');

const oldPromptCode = `    const promptText = buildMacroPrompt({
      asset_type,
      curriculum_context: {`;

const newPromptCode = `    // Fetch STORY_HOOK to pass into REFLECTION for continuity
    let hookContext = "";
    if (asset_type === "REFLECTION" || asset_type === "KEY_TAKEAWAY") {
      try {
        const hookBlocks = await db.entities.LessonBlock.filter({
          topic_id,
          sp_code,
          block_type: "STORY_HOOK"
        });
        if (hookBlocks && hookBlocks.length > 0 && hookBlocks[0].payload) {
          const hookPayload = typeof hookBlocks[0].payload === "string" ? JSON.parse(hookBlocks[0].payload) : hookBlocks[0].payload;
          if (hookPayload.story_text) {
             hookContext = "\\n\\n[CRITICAL CONTEXT: EXISTING STORY HOOK]\\nThe opening hook for this lesson was:\\n\\"" + hookPayload.story_text + "\\"\\n\\nYou MUST ensure the reflection_prompt closing question explicitly references the EXACT SAME objects/mission mentioned in this hook (e.g. shells, apples, turtles, whatever was mentioned above). Do NOT invent new objects.\\n";
          }
        }
      } catch (e) {
        console.error("Failed to fetch STORY_HOOK context", e);
      }
    }

    let promptText = buildMacroPrompt({
      asset_type,
      curriculum_context: {`;

code = code.replace(oldPromptCode, newPromptCode);

const oldPromptAppend = `      learner_profile: {
        year_level: level,
      },
    });`;

const newPromptAppend = `      learner_profile: {
        year_level: level,
      },
    });
    
    if (hookContext) {
      promptText += hookContext;
    }`;

code = code.replace(oldPromptAppend, newPromptAppend);

fs.writeFileSync('base44/functions/generateContentAsset/entry.ts', code);
