import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "6a3f271e41dc4ee0d0d5abdf",
  headers: {
    "api_key": "b634df8dc2874d42a26e406c5e258f54"
  }
});

async function run() {
  try {
    const blocks = await base44.entities.LessonBlock.list();
    const hooks = blocks.filter(b => b.block_type === 'STORY_HOOK');
    console.log(`Found ${hooks.length} hooks`);
    hooks.forEach(b => {
      console.log(`--- Hook --- ${b.topic_id} / ${b.subtopic_id}`);
      let payload = typeof b.payload === 'string' ? JSON.parse(b.payload) : b.payload;
      console.log(JSON.stringify(payload, null, 2));
    });
  } catch (err) {
    console.error(err);
  }
}
run();
