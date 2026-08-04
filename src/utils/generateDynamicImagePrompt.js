/**
 * Dynamic AI Image Prompt Generator
 * Formulates vivid 3D Pixar/Disney style visual prompts for Suku Penyu 🐢
 * matching subject, topic, and scene context.
 */
export function generateDynamicImagePrompt({
  subject = "Matematik",
  grade = "Tahun 1",
  topic = "Nombor hingga 100",
  sceneType = "STORY",
  visualDescription = ""
}) {
  const tLower = (topic || "").toLowerCase();
  
  let topicContext = `learning ${topic} in a colorful primary school classroom in Malaysia`;

  if (tLower.includes("wang") || tLower.includes("duit") || tLower.includes("money")) {
    topicContext = `holding colorful Malaysian Ringgit notes (RM1, RM5) and coins at a cheerful school stationery shop`;
  } else if (tLower.includes("masa") || tLower.includes("waktu") || tLower.includes("jam") || tLower.includes("clock")) {
    topicContext = `pointing to a giant friendly analog wall clock showing time in a brightly lit learning room`;
  } else if (tLower.includes("bentuk") || tLower.includes("geometri") || tLower.includes("shape")) {
    topicContext = `playing with 3D geometric wooden blocks like cubes, spheres, and cylinders on a table`;
  } else if (tLower.includes("pecahan") || tLower.includes("fraction")) {
    topicContext = `slicing a delicious round pizza into 1/2 and 1/4 equal portions in a fun kitchen classroom`;
  } else if (tLower.includes("sains") || tLower.includes("pernafasan") || tLower.includes("organ")) {
    topicContext = `wearing cute safety goggles in a science exploration lab with magnifying glasses and plant specimens`;
  } else if (tLower.includes("bahasa") || tLower.includes("words") || tLower.includes("tatabahasa")) {
    topicContext = `reading a giant magical storybook surrounded by floating alphabet letter blocks`;
  }

  const prompt = `3D Pixar style digital render of Suku Penyu, a friendly cute green sea turtle mascot character, ${visualDescription || topicContext}. Vibrant colors, warm lighting, educational children's book illustration style, 8k resolution, volumetric lighting, high detail, highly engaging for primary school students aged 7-10.`;

  return prompt;
}

export default generateDynamicImagePrompt;
