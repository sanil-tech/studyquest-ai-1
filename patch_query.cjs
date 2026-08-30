const fs = require('fs');
let code = fs.readFileSync('base44/functions/generateContentAsset/entry.ts', 'utf8');

const oldQuery = `        const query = {
          topic_id,
          sp_code,
          block_type: "STORY_HOOK"
        };
        if (subtopic_id) query.subtopic_id = subtopic_id;`;

const newQuery = `        const query: any = {
          topic_id,
          block_type: "STORY_HOOK"
        };
        // We removed sp_code from strict filter to ensure we grab the hook even if SP varies slightly.`;

code = code.replace(oldQuery, newQuery);
fs.writeFileSync('base44/functions/generateContentAsset/entry.ts', code);
