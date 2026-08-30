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
    console.log(`Found ${blocks.length} blocks`);
    
    // show the most recent 10 blocks (assuming they have created_at)
    const sorted = blocks.sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 5);
    sorted.forEach(b => {
      console.log(`\n--- Block ${b.block_type} ---`);
      console.log(`topic_id: ${b.topic_id}, sp_code: ${b.sp_code}, subtopic_id: ${b.subtopic_id}`);
      let payload = typeof b.payload === 'string' ? JSON.parse(b.payload) : b.payload;
      console.log(JSON.stringify(payload, null, 2));
    });
  } catch (err) {
    console.error(err);
  }
}
run();
