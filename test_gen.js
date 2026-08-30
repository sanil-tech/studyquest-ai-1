import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "6a3f271e41dc4ee0d0d5abdf",
  headers: {
    "api_key": "b634df8dc2874d42a26e406c5e258f54"
  }
});

async function run() {
  try {
    const blocks = await base44.entities.LessonBlock.filter({ limit: 10, sort: '-created_at' });
    console.log("Recent blocks:");
    blocks.forEach(b => {
      console.log(`- ${b.id} | ${b.block_type} | ${b.topic_id} | ${b.sp_code} | ${b.subtopic_id}`);
      console.log(`  Payload:`, b.payload?.substring(0, 100));
    });
  } catch (err) {
    console.error(err);
  }
}
run();
