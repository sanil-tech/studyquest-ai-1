const fs = require('fs');
let code = fs.readFileSync('base44/functions/generateContentAsset/entry.ts', 'utf8');

const oldCheck = `        if (hookBlocks && hookBlocks.length > 0 && hookBlocks[0].payload) {
          const hookPayload = typeof hookBlocks[0].payload === "string" ? JSON.parse(hookBlocks[0].payload) : hookBlocks[0].payload;`;

const newCheck = `        if (hookBlocks && hookBlocks.length > 0) {
          // Get the MOST RECENT hook (last item in the array if sorted ascending, or we can just sort it ourselves)
          hookBlocks.sort((a,b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
          const latestHook = hookBlocks[hookBlocks.length - 1];
          if (latestHook.payload) {
            const hookPayload = typeof latestHook.payload === "string" ? JSON.parse(latestHook.payload) : latestHook.payload;`;

code = code.replace(oldCheck, newCheck);
// close the bracket correctly
code = code.replace(/          if \(hookPayload\.story_text\) \{\n             hookContext = (.*?);\n          \}\n        \}/, `          if (hookPayload.story_text) {
             hookContext = $1;
          }
          }
        }`);

fs.writeFileSync('base44/functions/generateContentAsset/entry.ts', code);
