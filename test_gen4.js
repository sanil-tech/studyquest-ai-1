import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "6a3f271e41dc4ee0d0d5abdf",
  headers: {
    "api_key": "b634df8dc2874d42a26e406c5e258f54"
  }
});

async function run() {
  try {
        const query = {
          topic_id: "top_nombor_hingga_100",
          sp_code: "1.1.1",
          block_type: "STORY_HOOK",
          subtopic_id: "sub_1_1"
        };
        const hookBlocks = await base44.entities.LessonBlock.filter(query);
        console.log(hookBlocks.map(b => b.payload));
  } catch (err) {
    console.error(err);
  }
}
run();
