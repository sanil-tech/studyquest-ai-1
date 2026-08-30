const fs = require('fs');
let code = fs.readFileSync('src/components/lesson/LessonShellRenderer.jsx', 'utf8');
const oldCode = `  const hookImageUrl = useMemo(() => {
    const hook = blocks.find((b) => b?.block_type === "STORY_HOOK");
    const p = hook?.payload || hook?.content || {};
    return p.image_url || p.image || null;
  }, [blocks]);`;

const newCode = `  const hookImageUrl = useMemo(() => {
    const hook = blocks.find((b) => b?.block_type === "STORY_HOOK");
    const p = hook?.payload || hook?.content || {};
    const rawUrl = p.image_url || p.visual_url || p.visual?.image_url || p.image;
    if (rawUrl && !rawUrl.includes("suku_penyu_mascot")) {
      return rawUrl;
    }
    const storyText = personalize(p.story_text || p.story_hook || p.description || "", studentName);
    const storyPromptText = p.image_prompt || p.visual_prompt || storyText || p.topic || "";
    
    // Ensure we don't try to generate prompt if nothing exists
    if (!storyPromptText) return null;

    const prompt = generateDynamicImagePrompt({
      subject: p.subject || "Matematik",
      grade: p.grade || "Tahun 1",
      topic: p.topic || "Nombor hingga 100",
      sceneType: "STORY",
      visualDescription: p.image_prompt || p.visual_prompt || p.visual_description || "",
      storyText: storyPromptText
    });
    const seed = getPromptSeed(prompt);
    const computedUrl = \`https://image.pollinations.ai/prompt/\${encodeURIComponent(prompt)}?width=800&height=450&nologo=true&seed=\${seed}\`;
    
    return computedUrl || getStaticFallbackImage(p.topic, storyText);
  }, [blocks, studentName]);`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/lesson/LessonShellRenderer.jsx', code);
