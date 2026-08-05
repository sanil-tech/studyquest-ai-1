/**
 * Dynamic AI Image Prompt Generator
 * Formulates vivid 3D Pixar/Disney style visual prompts for Suku Penyu 🐢
 * matching subject, topic, and specific story mission context.
 */
export function generateDynamicImagePrompt({
  subject = "Matematik",
  grade = "Tahun 1",
  topic = "Nombor hingga 100",
  sceneType = "STORY",
  visualDescription = "",
  storyText = ""
}) {
  const fullContextText = `${storyText} ${visualDescription}`.toLowerCase();
  
  let specificSceneDesc = "";

  // 1. Check for specific story elements in storyText or visualDescription
  if (fullContextText.includes("epal") || fullContextText.includes("buah") || fullContextText.includes("pak cik abu") || fullContextText.includes("kedai buah")) {
    specificSceneDesc = "helping Pak Cik Abu in a vibrant Malaysian fruit shop. 3 large woven baskets filled with 10 shiny red apples each, and 5 red apples placed on a wooden table, Suku Penyu holding a price tag board";
  } else if (fullContextText.includes("roti") || fullContextText.includes("biskut") || fullContextText.includes("donat") || fullContextText.includes("bakery")) {
    specificSceneDesc = "in a warm cozy bakery with trays of fresh golden donuts and bread rolls neatly arranged in boxes of 10";
  } else if (fullContextText.includes("belon") || fullContextText.includes("pesta") || fullContextText.includes("karnival")) {
    specificSceneDesc = "at a cheerful school carnival holding bunches of bright red, blue and yellow balloons";
  } else if (fullContextText.includes("wang") || fullContextText.includes("duit") || fullContextText.includes("ringgit") || fullContextText.includes("sen")) {
    specificSceneDesc = "at a shop counter holding Malaysian Ringgit coins (50 sen, 20 sen) and colorful RM1 notes";
  } else if (fullContextText.includes("jam") || fullContextText.includes("waktu") || fullContextText.includes("masa") || fullContextText.includes("pukul")) {
    specificSceneDesc = "standing next to a large friendly analog clock showing time clearly with big hour and minute hands";
  } else if (fullContextText.includes("bentuk") || fullContextText.includes("kubus") || fullContextText.includes("blok") || fullContextText.includes("sfera")) {
    specificSceneDesc = "building a toy castle with colorful 3D geometric wooden blocks like cubes, cylinders, and pyramids";
  } else if (fullContextText.includes("pecahan") || fullContextText.includes("pizza") || fullContextText.includes("kek") || fullContextText.includes("wafel")) {
    specificSceneDesc = "in a cozy kitchen slicing a delicious round pizza or waffle into 4 equal quarter slices on a plate";
  } else if (fullContextText.includes("siram") || fullContextText.includes("pokok") || fullContextText.includes("bunga")) {
    specificSceneDesc = "in a lush green school garden watering colorful potted flowers and counting flower pots";
  } else if (fullContextText.includes("pensel") || fullContextText.includes("alat tulis") || fullContextText.includes("buku")) {
    specificSceneDesc = "at a bright school desk organizing colorful pencils, erasers, and storybooks into pencil cases";
  } else if (visualDescription && visualDescription.length > 10) {
    specificSceneDesc = visualDescription;
  } else {
    // Fallback based on topic keyword
    const tLower = (topic || "").toLowerCase();
    if (tLower.includes("wang") || tLower.includes("duit")) {
      specificSceneDesc = "holding colorful Malaysian Ringgit notes and coins at a cheerful school stationery shop";
    } else if (tLower.includes("masa") || tLower.includes("waktu") || tLower.includes("jam")) {
      specificSceneDesc = "pointing to a giant friendly analog wall clock showing time in a brightly lit learning room";
    } else if (tLower.includes("bentuk") || tLower.includes("geometri")) {
      specificSceneDesc = "playing with 3D geometric wooden blocks like cubes, spheres, and cylinders on a table";
    } else if (tLower.includes("pecahan")) {
      specificSceneDesc = "slicing a delicious round pizza into 1/2 and 1/4 equal portions in a fun kitchen classroom";
    } else {
      specificSceneDesc = `participating in an active learning adventure about ${topic} in a colorful Malaysian school environment`;
    }
  }

  const prompt = `3D Pixar style digital render of Suku Penyu 🐢, a friendly cute green sea turtle mascot character wearing a cute school outfit, ${specificSceneDesc}. Vibrant colors, warm lighting, educational children's book illustration style, 8k resolution, volumetric lighting, high detail, highly engaging for primary school students aged 7-10.`;

  return prompt;
}

export default generateDynamicImagePrompt;

