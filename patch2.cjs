const fs = require('fs');
let code = fs.readFileSync('base44/functions/generateContentAsset/entry.ts', 'utf8');

const oldFilter = `        const hookBlocks = await db.entities.LessonBlock.filter({
          topic_id,
          sp_code, subtopic_id,
          block_type: "STORY_HOOK"
        });`;

const newFilter = `        const query = {
          topic_id,
          sp_code,
          block_type: "STORY_HOOK"
        };
        if (subtopic_id) query.subtopic_id = subtopic_id;
        const hookBlocks = await db.entities.LessonBlock.filter(query);`;

code = code.replace(oldFilter, newFilter);
fs.writeFileSync('base44/functions/generateContentAsset/entry.ts', code);
