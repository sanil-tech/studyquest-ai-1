// dotenv removed
/* global process, console */
import { createClient } from '@base44/sdk';
import { buildKSSRBatchLesson } from '../services/generateKSSRContent.js';

// Setup Base44 Admin Client
const base44 = createClient({
  appId: process.env.VITE_BASE44_APP_ID || process.env.BASE44_APP_ID || 'local',
  token: process.env.BASE44_ADMIN_TOKEN || process.env.VITE_BASE44_ADMIN_TOKEN || 'admin_token',
  functionsVersion: "v1",
  serverUrl: process.env.VITE_BASE44_SERVER_URL || 'http://localhost:3000'
});

async function runSeed() {
  console.log("🌱 Starting Golden Lesson Database Seeding...");

  const lessonsToSeed = [
    { subject: "Matematik", grade: "Tahun 1", standardCode: "1.4.1", topicTitle: "Nilai Tempat" },
    { subject: "Matematik", grade: "Tahun 1", standardCode: "1.5.1", topicTitle: "Membandingkan Nombor" },
    { subject: "Matematik", grade: "Tahun 2", standardCode: "1.1.1", topicTitle: "Pecahan Asas" },
    { subject: "Bahasa Melayu", grade: "Tahun 1", standardCode: "2.1.1", topicTitle: "Membina Ayat Tunggal" },
  ];

  for (const params of lessonsToSeed) {
    try {
      console.log(`\nProcessing: ${params.subject} - ${params.topicTitle} (${params.standardCode})`);
      
      // 1. Idempotency Check (Check if LessonVersion with this sk_code exists)
      const existingVersions = await base44.entities.LessonVersion.filter({
        sk_code: params.standardCode,
        subject_name: params.subject
      });

      if (existingVersions && existingVersions.length > 0) {
        console.log(`⏭️  Lesson for ${params.standardCode} already exists. Skipping.`);
        continue;
      }

      // 2. Generate Content Blocks
      const content_blocks = buildKSSRBatchLesson(params);

      // 3. Create Parent Lesson
      const mockTopicId = `topic-seed-${params.standardCode.replace(/\./g, '-')}`;
      const lessonRes = await base44.entities.Lesson.create({
        topic_id: mockTopicId,
        subject_name: params.subject,
        topic_name: params.topicTitle,
        content_status: "published",
        version: 1
      });

      // Handle Base44 return format (could be object or array)
      const lessonId = lessonRes.id || (lessonRes[0] && lessonRes[0].id);

      // 4. Create LessonVersion
      const versionRes = await base44.entities.LessonVersion.create({
        lesson_id: lessonId,
        version_number: 1,
        curriculum_type: "KSSR_SEMAKAN",
        year_level: params.grade,
        subject_name: params.subject,
        sk_code: params.standardCode,
        sp_code: params.standardCode,
        status: "published",
        review_status: "published",
        quality_score: 95
      });

      const versionId = versionRes.id || (versionRes[0] && versionRes[0].id);

      // 5. Create LessonBlocks
      for (const block of content_blocks) {
        await base44.entities.LessonBlock.create({
          lesson_version_id: versionId,
          order_number: block.order_number,
          block_type: block.block_type,
          pedagogical_phase: block.pedagogical_phase,
          title: block.title,
          payload: block.payload,
          status: "published"
        });
      }

      // 6. Update Parent Lesson with published version pointer
      await base44.entities.Lesson.update(lessonId, {
        published_version_id: versionId,
        published_version: 1
      });

      console.log(`✅ Success: Seeded Lesson [${lessonId}] | Version [${versionId}]`);

    } catch (error) {
      console.error(`❌ Error seeding ${params.standardCode}:`, error);
    }
  }
  
  console.log("\n✅ Database Seeding completed!");
}

runSeed();