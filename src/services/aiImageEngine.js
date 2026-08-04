import { base44 } from '@/api/base44Client';
import { generateDynamicImagePrompt } from '@/utils/generateDynamicImagePrompt';

/**
 * Static fallback asset mapper by topic domain
 */
export function getStaticFallbackImage(topic = "") {
  const tLower = (topic || "").toLowerCase();
  if (tLower.includes("wang") || tLower.includes("duit") || tLower.includes("money")) {
    return "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80"; // Money / Coins
  }
  if (tLower.includes("masa") || tLower.includes("waktu") || tLower.includes("jam") || tLower.includes("clock")) {
    return "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=600&auto=format&fit=crop&q=80"; // Clock / Time
  }
  if (tLower.includes("bentuk") || tLower.includes("geometri") || tLower.includes("shape")) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"; // Shapes / Geometry
  }
  if (tLower.includes("pecahan") || tLower.includes("fraction")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"; // Pizza / Fraction
  }
  if (tLower.includes("sains") || tLower.includes("pernafasan") || tLower.includes("organ")) {
    return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80"; // Science Lab
  }
  if (tLower.includes("bahasa") || tLower.includes("words") || tLower.includes("tatabahasa")) {
    return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80"; // Books / Reading
  }
  // Generic primary math / learning fallback
  return "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80";
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
