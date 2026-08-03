import { z } from 'zod';

export const MediaAssetSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO', 'LOTTIE']),
  url: z.string().url("Mesti URL yang sah"),
  fallback_url: z.string().url("Mesti URL yang sah").optional(),
  caption: z.string().optional()
});

export const EngagementBlockSchema = z.object({
  id: z.string().min(1, "ID diperlukan"),
  theme: z.string(),
  text_content: z.string().min(5, "Teks naratif mesti mempunyai sekurang-kurangnya 5 aksara"),
  media: MediaAssetSchema.nullable().optional(),
  cognitive_level: z.enum(['VISUAL_BASIC', 'GUIDED_VOCAB', 'APPLIED', 'REASONING'])
});

export type MediaAsset = z.infer<typeof MediaAssetSchema>;
export type EngagementBlock = z.infer<typeof EngagementBlockSchema>;
