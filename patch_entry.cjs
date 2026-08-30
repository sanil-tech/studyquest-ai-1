const fs = require('fs');
let code = fs.readFileSync('base44/functions/generateContentAsset/entry.ts', 'utf8');

const oldCheck = `    let hookContext = "";
    if (asset_type === "REFLECTION" || asset_type === "KEY_TAKEAWAY") {
      try {`;

const newCheck = `    let hookContext = "";
    if (["REFLECTION", "KEY_TAKEAWAY", "CONCEPT", "CONCEPT_CPA", "WORKED_EXAMPLE", "INTERACTIVE_PRACTICE", "GUIDED_PRACTICE"].includes(asset_type)) {
      try {`;

const oldContext = `             hookContext = "\\n\\n[CRITICAL CONTEXT: EXISTING STORY HOOK]\\nThe opening hook for this lesson was:\\n\\"" + hookPayload.story_text + "\\"\\n\\nYou MUST ensure the reflection_prompt closing question explicitly references the EXACT SAME objects/mission mentioned in this hook (e.g. shells, apples, turtles, whatever was mentioned above). Do NOT invent new objects.\\n";`;

const newContext = `             hookContext = "\\n\\n[CRITICAL CONTEXT: EXISTING STORY HOOK]\\nThe opening hook for this lesson was:\\n\\"" + hookPayload.story_text + "\\"\\n\\nAMARAN KERAS (STRICT RULE): You MUST ensure your generated content explicitly references the EXACT SAME objects/mission mentioned in this hook (e.g., if the hook uses shells, turtles, etc., use the SAME objects here). DO NOT invent new objects like apples or marbles unless they were in the story hook. DO NOT use placeholder names like 'Murid Contoh', address the child directly as 'Kawan' or 'Adik'.\\n";`;

code = code.replace(oldCheck, newCheck);
code = code.replace(oldContext, newContext);
fs.writeFileSync('base44/functions/generateContentAsset/entry.ts', code);
