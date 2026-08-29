import { base44 } from "./src/api/base44Client";

async function run() {
  const blocks = await base44.entities.LessonBlock.list();
  console.log("Total blocks:", blocks.length);
  const approved = blocks.filter(b => b.review_status === "approved" || b.status === "approved");
  console.log("Approved blocks:", approved.length);
}
run();
