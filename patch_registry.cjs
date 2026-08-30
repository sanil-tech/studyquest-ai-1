const fs = require('fs');
let code = fs.readFileSync('base44/shared/blockPromptRegistry.ts', 'utf8');
const oldStr = `"reflection_prompt: ONE short closing question to resolve the STORY_HOOK. IMPORTANT: The question MUST specifically mention the concrete objects the student just learned to count (e.g., shells, apples). If the hook involved Suku Penyu finding shells, ask them to count the shells!",`;
const newStr = `"reflection_prompt: ONE short closing question to resolve the STORY_HOOK. IMPORTANT: The question MUST specifically mention the concrete objects the student just learned to count (e.g., shells, apples). Jika Blok 1 (STORY HOOK) sebelum ini menggunakan objek 'cengkerang' (shells), soalan ini WAJIB bertanya tentang 'cengkerang'. JANGAN reka objek baru (seperti epal) jika cerita asalnya adalah cengkerang/penyu/dsb!",`;
code = code.replace(oldStr, newStr);
fs.writeFileSync('base44/shared/blockPromptRegistry.ts', code);
