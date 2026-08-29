import { Base44FunctionArgs, db } from "base44";

export default async function(args: Base44FunctionArgs) {
  const blocks = await db.LessonBlock.list();
  let count = 0;
  for (const block of blocks) {
    if (block.review_status === "approved" || block.status === "approved") {
      await db.LessonBlock.update(block.id, { review_status: "draft", status: "draft" });
      count++;
    }
  }
  
  const contents = await db.LessonContent.list();
  for (const content of contents) {
    if (content.review_status === "approved" || content.status === "approved") {
      await db.LessonContent.update(content.id, { review_status: "draft", status: "draft" });
      count++;
    }
  }
  
  const versions = await db.LessonVersion.list();
  for (const version of versions) {
    if (version.review_status === "approved" || version.status === "approved") {
      await db.LessonVersion.update(version.id, { review_status: "draft", status: "draft" });
      count++;
    }
  }
  
  return { success: true, updatedCount: count };
}
