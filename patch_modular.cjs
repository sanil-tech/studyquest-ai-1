const fs = require('fs');
let code = fs.readFileSync('base44/functions/generateModularLessonContent/entry.ts', 'utf8');
const oldPrompt = "    const userPrompt = `Jana pakej pelajaran 8-Blok DETERMINISTIK bagi ${skCode} - ${spCode}. Pastikan ia mematuhi skema JSON yang ditetapkan.`;";
const newPrompt = "    const userPrompt = `Jana pakej pelajaran 8-Blok DETERMINISTIK bagi ${skCode} - ${spCode}. Pastikan ia mematuhi skema JSON yang ditetapkan.\\n\\nAMARAN KERAS: Blok 7 (KEY_TAKEAWAY) reflection_prompt MESTI dan WAJIB bersambung semula dengan objek dan misi yang dicipta dalam Blok 1 (STORY_HOOK). Jika Blok 1 bercakap tentang mengira cengkerang, Blok 7 MESTI bertanya tentang cengkerang. Jangan reka objek baru seperti epal atau guli secara rawak!`;";
code = code.replace(oldPrompt, newPrompt);
fs.writeFileSync('base44/functions/generateModularLessonContent/entry.ts', code);
