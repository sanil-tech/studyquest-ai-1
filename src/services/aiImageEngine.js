import { base44 } from '@/api/base44Client';
import { generateDynamicImagePrompt } from '@/utils/generateDynamicImagePrompt';

/**
 * Static fallback asset mapper by topic domain and story scene context
 */
export function getStaticFallbackImage(topic = "", storyText = "") {
  const combinedText = `${topic} ${storyText}`.toLowerCase();

  if (combinedText.includes("roti") || combinedText.includes("donut") || combinedText.includes("talam") || combinedText.includes("kak siti") || combinedText.includes("bakery")) {
    return "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80"; // Bakery / Donuts
  }
  if (combinedText.includes("epal") || combinedText.includes("buah") || combinedText.includes("bakul") || combinedText.includes("pak cik abu") || combinedText.includes("kedai buah")) {
    return "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80"; // Apples / Fruit Shop
  }
  if (combinedText.includes("belon") || combinedText.includes("pesta") || combinedText.includes("karnival")) {
    return "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80"; // Balloons
  }
  if (combinedText.includes("pensel") || combinedText.includes("alat tulis") || combinedText.includes("pembaris") || combinedText.includes("sekolah")) {
    return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80"; // Pencils / Stationery
  }
  if (combinedText.includes("wang") || combinedText.includes("duit") || combinedText.includes("ringgit") || combinedText.includes("sen") || combinedText.includes("syiling")) {
    return "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80"; // Money / Coins
  }
  if (combinedText.includes("jam") || combinedText.includes("waktu") || combinedText.includes("masa") || combinedText.includes("clock")) {
    return "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800&auto=format&fit=crop&q=80"; // Clock / Time
  }
  if (combinedText.includes("bentuk") || combinedText.includes("geometri") || combinedText.includes("shape") || combinedText.includes("kubus") || combinedText.includes("sfera")) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"; // Shapes / Geometry
  }
  if (combinedText.includes("pecahan") || combinedText.includes("fraction") || combinedText.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; // Pizza / Fraction
  }
  if (combinedText.includes("pokok") || combinedText.includes("bunga") || combinedText.includes("siram") || combinedText.includes("taman")) {
    return "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80"; // Garden / Plants
  }
  if (combinedText.includes("sains") || combinedText.includes("pernafasan") || combinedText.includes("organ") || combinedText.includes("lab")) {
    return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80"; // Science Lab
  }
  if (combinedText.includes("bahasa") || combinedText.includes("words") || combinedText.includes("tatabahasa") || combinedText.includes("buku")) {
    return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80"; // Books / Reading
  }
  // Generic primary math / learning fallback
  return "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80";
}

/**
 * Dynamic AI Image Generation Service for StudyQuest Scenes
 * Dual fallback chain: base44 Core integration -> base44 backend function -> Static fallback asset
 */
export async function generateSceneImage({
  subject = "Matematik",
  grade = "Tahun 1",
  topic = "Nombor hingga 100",
  sceneType = "STORY",
  visualDescription = ""
}) {
  const prompt = generateDynamicImagePrompt({ subject, grade, topic, sceneType, visualDescription });

  // 1. Try base44 Core generateImage integration
  try {
    if (base44?.integrations?.Core?.generateImage) {
      const res = await base44.integrations.Core.generateImage({ prompt });
      if (res?.url || res?.image_url) {
        return res.url || res.image_url;
      }
    }
  } catch (err) {
    console.warn("base44.integrations.Core.generateImage failed:", err);
  }

  // 2. Try base44 function generateAIImage
  try {
    if (base44?.functions?.invoke) {
      const res = await base44.functions.invoke("generateAIImage", { prompt, subject, topic });
      if (res?.data?.url || res?.data?.image_url) {
        return res.data.url || res.data.image_url;
      }
    }
  } catch (err) {
    console.warn("base44.functions.invoke('generateAIImage') failed:", err);
  }

  // 3. Fallback to topic-aligned static asset
  return getStaticFallbackImage(topic);
}

export default generateSceneImage;
