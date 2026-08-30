import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "6a3f271e41dc4ee0d0d5abdf",
  headers: {
    "api_key": "b634df8dc2874d42a26e406c5e258f54"
  }
});

async function run() {
  try {
        const res = await base44.functions.invoke("generateContentAsset", {
          topic_id: "top_nombor_hingga_100",
          subtopic_id: "sub_1_1",
          sp_code: "1.1.1",
          asset_type: "REFLECTION",
          block_type: "KEY_TAKEAWAY"
        });
        console.log(res);
  } catch (err) {
    console.error(err);
  }
}
run();
