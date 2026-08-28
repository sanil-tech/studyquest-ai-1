/**
 * Dynamic AI Image Prompt Generator
 * Formulates vivid 3D Pixar/Disney style visual prompts for Suku Penyu 🐢
 * matching subject, topic, and specific story mission context.
 */

export function getPromptSeed(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 900000) + 100000;
}

export function generateDynamicImagePrompt({
  subject = "Matematik",
  grade = "Tahun 1",
  topic = "Nombor hingga 100",
  sceneType = "STORY",
  visualDescription = "",
  storyText = ""
}) {
  const fullContextText = `${storyText} ${visualDescription} ${topic}`.toLowerCase();
  
  let specificSceneDesc = "";

  // 0. PRIORITY: AI-provided story-specific visual description (from LESSON_HOOK visual_prompt).
  //    It depicts the EXACT narrative scene — use it directly so the image matches the story,
  //    instead of the generic keyword-matched scene below.
  if (visualDescription && visualDescription.trim().length > 15) {
    specificSceneDesc = visualDescription.trim();
  } else
  // 1. Keyword-based scene matching (fallback when no AI visual description)
  if (fullContextText.includes("roti") || fullContextText.includes("donut") || fullContextText.includes("donat") || fullContextText.includes("talam") || fullContextText.includes("kak siti") || fullContextText.includes("bakery")) {
    specificSceneDesc = "in a warm cozy bakery shop helping Kak Siti. Showing two serving trays on a wooden counter, one tray full of delicious chocolate donuts and another tray with only a few strawberry donuts";
  } else if (fullContextText.includes("epal") || fullContextText.includes("buah") || fullContextText.includes("bakul") || fullContextText.includes("pak cik abu") || fullContextText.includes("kedai buah")) {
    specificSceneDesc = "helping Pak Cik Abu at a vibrant Malaysian fruit stall. 3 large woven baskets filled with 10 shiny red apples each, and 5 red apples on a wooden table with price tags";
  } else if (fullContextText.includes("sifar") || fullContextText.includes("tiada objek") || fullContextText.includes("kosong") || fullContextText.includes("zero")) {
    specificSceneDesc = "standing in a bright classroom looking curiously at a clean empty plate and empty bowl with zero objects inside";
  } else if (fullContextText.includes("banyak") || fullContextText.includes("sedikit") || fullContextText.includes("banding") || fullContextText.includes("kuantiti")) {
    specificSceneDesc = "comparing two sets of colorful wooden toys on a table, one side with many toys and the other side with very few toys";
  } else if (fullContextText.includes("belon") || fullContextText.includes("pesta") || fullContextText.includes("karnival")) {
    specificSceneDesc = "at a cheerful school carnival holding bunches of bright red, blue and yellow balloons";
  } else if (fullContextText.includes("wang") || fullContextText.includes("duit") || fullContextText.includes("ringgit") || fullContextText.includes("sen")) {
    specificSceneDesc = "at a shop counter holding colorful Malaysian Ringgit coins (50 sen, 20 sen) and paper notes";
  } else if (fullContextText.includes("jam") || fullContextText.includes("waktu") || fullContextText.includes("masa") || fullContextText.includes("clock")) {
    specificSceneDesc = "standing next to a large friendly analog wall clock showing time clearly with big hour and minute hands";
  } else if (fullContextText.includes("bentuk") || fullContextText.includes("kubus") || fullContextText.includes("blok") || fullContextText.includes("sfera")) {
    specificSceneDesc = "building a toy castle with colorful 3D geometric wooden blocks like cubes, cylinders, and pyramids";
  } else if (fullContextText.includes("pecahan") || fullContextText.includes("pizza") || fullContextText.includes("kek") || fullContextText.includes("wafel")) {
    specificSceneDesc = "in a cozy kitchen slicing a delicious round pizza into 4 equal quarter slices on a plate";
  } else if (fullContextText.includes("siram") || fullContextText.includes("pokok") || fullContextText.includes("bunga") || fullContextText.includes("taman")) {
    specificSceneDesc = "in a lush green school garden watering colorful potted flowers and counting flower pots";
  } else if (fullContextText.includes("pensel") || fullContextText.includes("alat tulis") || fullContextText.includes("buku") || fullContextText.includes("pembaris")) {
    specificSceneDesc = "at a bright school desk organizing colorful pencils, erasers, and storybooks into pencil cases";
  } else if (fullContextText.includes("tambah") || fullContextText.includes("jumlah") || fullContextText.includes("gabung")) {
    specificSceneDesc = "combining two baskets of bright red apples together on a wooden table to count the total sum";
  } else if (fullContextText.includes("tolak") || fullContextText.includes("baki") || fullContextText.includes("asing")) {
    specificSceneDesc = "taking away 3 cupcakes from a box of 10 on a kitchen table to see how many remain";
  } else if (fullContextText.includes("susun") || fullContextText.includes("tertib") || fullContextText.includes("pola")) {
    specificSceneDesc = "arranging bright numbered wooden blocks in order from 1 to 10 on a colorful classroom table";
  } else if (visualDescription && visualDescription.length > 10) {
    specificSceneDesc = visualDescription;
  } else {
    specificSceneDesc = `participating in a fun learning adventure about ${topic} in a colorful Malaysian primary school setting`;
  }

  const rawPrompt = `3D Pixar animation digital render of Suku Penyu, a cute friendly green sea turtle mascot character wearing a blue school jacket, ${specificSceneDesc}. Bright vivid colors, warm volumetric lighting, educational children book illustration style, 8k resolution, high detail, child friendly 3D render.`;

  // Clean prompt for URL safety
  const cleanPrompt = rawPrompt.replace(/[^\x00-\x7F]/g, "").replace(/[\{\}\[\]\<\>]/g, "").trim();

  return cleanPrompt;
}

export default generateDynamicImagePrompt;