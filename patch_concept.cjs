const fs = require('fs');
let code = fs.readFileSync('src/components/lesson/blocks/ConceptCPABlock.jsx', 'utf8');

code = code.replace(/if \(!na \|\| !nb\) return null;/g, "if (!na || !nb) return <SkillVisual phaseContent={c || p} fallbackEmoji={emoji} />;\n              // Fix for pictorial\n              if (phase.key === 'pictorial') { p = p || phaseContent; if (!nt || !nb) return <SkillVisual phaseContent={p} fallbackEmoji={emoji} />; }");

// A better way is regex:
code = code.replace(/const nb = toPositiveInteger\(c\.count_b\);\n              if \(!na \|\| !nb\) return null;/, 
`const nb = toPositiveInteger(c.count_b);
              if (!na || !nb) return <SkillVisual phaseContent={c} fallbackEmoji={emoji} />;`);

code = code.replace(/const nb = toPositiveInteger\(p\.count_bottom\);\n              if \(!nt \|\| !nb\) return null;/,
`const nb = toPositiveInteger(p.count_bottom);
              if (!nt || !nb) return <SkillVisual phaseContent={p} fallbackEmoji={emoji} />;`);

// Also change studentName fallback in Previewer so it says "Adik" instead of "Murid Contoh"
try {
  let previewCode = fs.readFileSync('src/components/admin/UniversalLessonPreview.jsx', 'utf8');
  previewCode = previewCode.replace(/studentName="Murid Contoh"/g, 'studentName="Adik"');
  previewCode = previewCode.replace(/studentName = "Murid Contoh"/g, 'studentName = "Adik"');
  fs.writeFileSync('src/components/admin/UniversalLessonPreview.jsx', previewCode);
} catch (e) {}

try {
  let storyCode = fs.readFileSync('src/components/lesson/blocks/StoryHookBlock.jsx', 'utf8');
  storyCode = storyCode.replace(/studentName = "Murid Contoh"/g, 'studentName = "Adik"');
  fs.writeFileSync('src/components/lesson/blocks/StoryHookBlock.jsx', storyCode);
} catch (e) {}

fs.writeFileSync('src/components/lesson/blocks/ConceptCPABlock.jsx', code);
