// scratch/test_batch2_verify.js
import fs from "node:fs";

const raw = fs.readFileSync("./src/data/officialCurriculumTaxonomy.json", "utf8");
const taxonomy = JSON.parse(raw);

const m1 = taxonomy.find(i => i.curriculum === "KSSR Semakan" && i.level === "Tahun 1" && i.subject === "Matematik");
const spList = [];
m1.domains.forEach(d => {
  d.topics.forEach(t => {
    t.subtopics.forEach(st => {
      st.standard_learning.forEach(sp => {
        spList.push({
          sp_code: sp.sp_code,
          sk_code: sp.sk_code,
          title: sp.title,
          subtopic: st.name,
          topic: t.topic_name
        });
      });
    });
  });
});

console.log("Total SPs found:", spList.length);
console.log("Next 6 SPs in canonical order:");
spList.slice(0, 6).forEach((s, idx) => {
  console.log(`[${idx+1}] SP ${s.sp_code} (${s.sk_code}) - ${s.subtopic} - ${s.title}`);
});
