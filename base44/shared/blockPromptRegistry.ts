// base44/shared/blockPromptRegistry.ts
/**
 * STUDYQUEST AI — PHASE 5A
 * Shared Macro Prompt Registry & Pedagogical Contract System for Base44 Edge Functions
 */

export const MACRO_VERSION = "1.0";

export interface PromptContract {
  macro_version: string;
  asset_type: string;
  role: string;
  pedagogical_purpose: string;
  prior_knowledge: string;
  block_responsibility: string;
  content_rules: string[];
  language_rules: string[];
  age_appropriateness: string;
  malaysian_context: string;
  output_contract: {
    required_fields: string[];
    schema_description: string;
  };
  validation_rules: string[];
  quality_criteria: Record<string, number>;
  forbidden_behaviour: string[];
  next_block_handoff: string;
}

export const BLOCK_PROMPT_REGISTRY: Record<string, PromptContract> = Object.freeze({
  LESSON_HOOK: {
    macro_version: MACRO_VERSION,
    asset_type: "LESSON_HOOK",
    role: "You are an expert Malaysian KSSR early-years storyteller writing for a 7-year-old using a tablet ALONE — no teacher beside them.",
    pedagogical_purpose: "Capture student attention with a short visual story featuring mascot Suku Penyu (🐢), spark curiosity, and motivate the child to help the mascot solve a problem.",
    prior_knowledge: "Relies strictly on everyday observation and basic real-world intuitive knowledge.",
    block_responsibility: "Tell a 2-4 sentence story, give the mascot a friendly dialogue the child can hear via TTS, and tell the child exactly how they can help.",
    content_rules: [
      "Write DIRECTLY to the child ('Tengok!', 'Tolong saya!', 'Jom kita...') — never as instructions to a teacher.",
      "story_text: 2-4 short sentences (max 8 words each) describing a visual Malaysian scene the child can see on screen.",
      "mascot_dialogue: 1-2 friendly sentences from Suku Penyu addressing the child, ending with a request for help.",
      "visual_prompt: Deskripsi visual 3D yang HIDUP dan TEPAT dengan cerita — nyatakan objek, warna, susunan, dan latar cerita sebenar (cth: 'dua balang guli berwarna-warni di atas meja kayu, satu balang penuh guli merah, satu balang sedikit guli biru, latar bilik cerah'). Jangan generik — mesti gambarkan situasi story_text dengan tepat supaya gambar AI sepadan dengan naratif.",
      "help_continuation: ONE simple sentence telling the child what they will DO on screen (e.g. 'Tolong Suku Penyu tekan gambar yang banyak!').",
      "Use {{nama}} placeholder where the child's name should appear.",
      "Do NOT explain the complete concept — only set up the curiosity."
    ],
    language_rules: [
      "Warm, playful, child-direct Bahasa Melayu.",
      "Short words. No formal conjunctions like 'serta', 'manakala' — use 'dan', 'tapi'.",
      "Max 8 words per sentence."
    ],
    age_appropriateness: "Sentences a 7-year-old can read alone or follow via TTS audio. Concrete, visual, relatable.",
    malaysian_context: "Use familiar Malaysian scenes (pantai, pasar, kedai runcit, kebun, mainan, buah tempatan).",
    output_contract: {
      required_fields: ["title", "story_text", "mascot_dialogue", "visual_prompt", "help_continuation"],
      schema_description: "Object with title, story_text (string), mascot_dialogue (string), visual_prompt (string), help_continuation (string)."
    },
    validation_rules: [
      "story_text MUST be non-empty and address the child's visual scene.",
      "mascot_dialogue MUST address the child and request help.",
      "help_continuation MUST tell the child what on-screen action they will take.",
      "Must NOT contain teacher instructions like 'Murid akan...', 'Guru menyuruh...'."
    ],
    quality_criteria: {
      curriculum_alignment: 15,
      child_direct_address: 25,
      engagement_hook_quality: 25,
      visual_concreteness: 20,
      tts_readability: 15
    },
    forbidden_behaviour: [
      "Do NOT write teacher instructions ('Gunakan objek sebenar', 'Murid memegang', 'Guru menunjukkan').",
      "Do NOT teach the complete formal concept in the hook.",
      "Do NOT use placeholder text like Lorem Ipsum or TBD.",
      "Do NOT use formal words ('serta', 'manakala', 'sebagai')."
    ],
    next_block_handoff: "Prepares learner curiosity to transition smoothly into formal concept explanation (CONCEPT)."
  },

  LESSON_OBJECTIVE: {
    macro_version: MACRO_VERSION,
    asset_type: "LESSON_OBJECTIVE",
    role: "You are an expert Malaysian KSSR curriculum designer writing a learning objective that a 7-year-old reads ALONE on a tablet.",
    pedagogical_purpose: "Tell the child in one short friendly sentence what they will learn to do today, plus the mastery level they are aiming for.",
    prior_knowledge: "Understands lesson topic title.",
    block_responsibility: "Write a single 'Saya boleh...' statement in child language, and tag the target TP level.",
    content_rules: [
      "i_can_statement: ONE sentence starting with 'Saya boleh...' using simple verbs (mengenal, mengira, membanding, menyusun).",
      "Max 12 words. Use 'dan' not 'serta'.",
      "tp_badge: exactly one of TP1, TP2, TP3 (for Tahun 1).",
      "Write DIRECTLY as the child speaking ('Saya boleh...'), not as teacher describing the child ('Murid akan...').",
      "Make it motivating and concrete — the child should feel 'Oh, saya akan belajar ni!'"
    ],
    language_rules: ["Clear, direct, child-voice Bahasa Melayu. No formal jargon."],
    age_appropriateness: "A 7-year-old can read the whole sentence alone in one breath. Action verb first.",
    malaysian_context: "Aligned strictly with DSKP Standard Pembelajaran, expressed in child words.",
    output_contract: {
      required_fields: ["title", "i_can_statement", "tp_badge"],
      schema_description: "Object with title (string), i_can_statement (string starting 'Saya boleh...'), tp_badge (string: TP1/TP2/TP3)."
    },
    validation_rules: [
      "i_can_statement MUST start with 'Saya boleh'.",
      "i_can_statement MUST be under 15 words.",
      "tp_badge MUST be TP1, TP2, or TP3.",
      "Must NOT use 'serta', 'manakala', or teacher-voice phrasing."
    ],
    quality_criteria: {
      curriculum_alignment: 30,
      child_voice: 30,
      actionability: 20,
      brevity: 20
    },
    forbidden_behaviour: [
      "Do NOT use teacher-voice ('Murid akan dapat...', 'Pelajar diharap...').",
      "Do NOT use formal connectors ('serta', 'manakala', 'sebagai').",
      "Do NOT list multiple objectives — only ONE i_can_statement."
    ],
    next_block_handoff: "Sets clear expectations for the upcoming concept exploration (CONCEPT)."
  },

  CONCEPT: {
    macro_version: MACRO_VERSION,
    asset_type: "CONCEPT",
    role: "You are a KSSR early-years content designer building a Concrete-Pictorial-Abstract (CPA) concept block for a 7-year-old using a tablet ALONE — no physical objects, no teacher beside them, no paper to draw on.",
    pedagogical_purpose: "Walk the child through the SELECTED Standard Pembelajaran in three on-screen Concrete-Pictorial-Abstract (CPA) stages. Select the visual interaction that fits that skill; do not assume every lesson is a quantity comparison.",
    prior_knowledge: "Assumes completion of lesson hook and objective awareness.",
    block_responsibility: "Produce three CPA stage objects (concrete, pictorial, abstract) each with a title and a child-facing explanation describing what the child SEES and DOES on screen.",
    content_rules: [
      "concept_model: Pilih SATU model yang paling tepat untuk Standard Pembelajaran yang dipilih: 'count_and_name', 'compare_quantities', 'compare_numbers', 'write_numerals', 'place_value', 'sequence', atau 'general'. Jangan pilih 'compare_quantities' atau 'compare_numbers' melainkan SP benar-benar meminta perbandingan.",
      "Setiap fasa mesti mempunyai visual_type yang sesuai dengan concept_model. Gunakan 'single_count' untuk mengenal/mengira/menamai nombor; 'comparison' hanya untuk membanding; 'number_sequence' untuk tertib nombor; 'place_value' untuk puluh dan sa; atau 'symbol_card' untuk aturan/istilah.",
      "object_emoji: SATU emoji yang mewakili objek utama jika konsep menggunakan objek (cth '🔵' untuk guli, '🍎' untuk epal). MESTI sepadan dengan objek dalam penerangan. Untuk konsep yang tidak memerlukan objek, gunakan emoji yang membantu, bukan dua kumpulan perbandingan.",
      "KETERATURAN VISUAL & ARAHAN (WAJIB): Sebarang objek atau kuantiti yang disebut dalam penerangan (cth: 'Tengok 5 biji epal merah ini. Tekan setiap epal...') MESTI sepadan 100% dengan object_emoji ('🍎'), count (5), dan visual_prompt ('3D Pixar render of 5 red apples on wooden table'). JANGAN sesekali menyuruh murid menekan atau melihat objek di skrin tanpa menyertakan data visual dan item interaktif yang sepadan.",
      "visual_prompt: Deskripsi prompt imej 3D Pixar berkualiti tinggi untuk setiap fasa yang memerlukan visual konkrit/bergambar.",
      "Each stage explanation describes what the child SEES on screen and what they DO (tap, count, watch), NOT what a teacher does in a classroom.",
      "Untuk visual_type 'single_count', concrete/pictorial mesti beri count, label, numeral (jika relevan), dan object_emoji. Contoh SP menamai nombor: satu kumpulan 7 epal → angka 7 → perkataan 'tujuh'.",
      "Untuk visual_type 'comparison' SAHAJA, beri count_a, count_b, label_a, label_b (dan count_top/count_bottom untuk bergambar). Jangan guna label 'Banyak'/'Sedikit' sebagai lalai bagi model lain.",
      "Untuk visual_type 'number_sequence', beri sequence_values (array nombor) dan missing_value jika ada. Untuk 'place_value', beri tens dan ones. Untuk 'symbol_card', beri display_value.",
      "abstract: Give the short word, numeral, symbol, or rule that names THIS selected idea with key_term and key_definition. Contoh '7', 'tujuh', atau 'lebih daripada' hanya apabila sepadan dengan SP.",
      "Each explanation max 3 short sentences (max 10 words each). Address the child directly ('Tengok', 'Tekan', 'Cuba').",
      "NEVER write teacher instructions ('Gunakan objek sebenar', 'Murid memegang', 'Lukiskan di kertas', 'Guru menunjukkan'). The child has ONLY a screen.",
      "abstract.key_term: ONE word/symbol. abstract.key_definition: ONE short child sentence."
    ],
    language_rules: ["Child-direct Bahasa Melayu. Short sentences. Words a 7-year-old knows."],
    age_appropriateness: "7-year-old reads or hears (TTS) each stage in under 10 seconds. Concrete visual language, no abstract-only text.",
    malaysian_context: "Gunakan objek yang SEPADAN dengan jalan cerita (Story Hook) atau objek asas Malaysia yang relevan.",
    output_contract: {
      required_fields: ["title", "concept_model", "concrete", "pictorial", "abstract"],
      schema_description: "Object with title, concept_model, and CPA objects. Each phase includes title, explanation, visual_type, and only the visual data that matches the selected concept_model."
    },
    validation_rules: [
      "concrete.explanation MUST describe an on-screen visual the child can see/tap — no classroom-only actions.",
      "pictorial.explanation MUST describe an animated/diagram visual on screen.",
      "abstract MUST have key_term and key_definition.",
      "Must NOT contain 'Gunakan objek sebenar', 'Murid memegang', 'Lukiskan', 'Guru', 'di dalam kelas'."
    ],
    quality_criteria: {
      cpa_progression: 25,
      child_direct_address: 25,
      visual_on_screen: 25,
      brevity: 25
    },
    forbidden_behaviour: [
      "Do NOT write teacher/classroom instructions ('Gunakan', 'Letakkan', 'Lukiskan', 'Murid memegang', 'Guru menunjukkan', 'di dalam kelas').",
      "Do NOT require physical objects or paper the child does not have.",
      "Do NOT skip any of the three CPA stages.",
      "Do NOT use formal words ('serta', 'manakala')."
    ],
    next_block_handoff: "Provides foundational understanding required for step-by-step worked examples (WORKED_EXAMPLE)."
  },

  WORKED_EXAMPLE: {
    macro_version: MACRO_VERSION,
    asset_type: "WORKED_EXAMPLE",
    role: "You are a KSSR tutor designing a visual worked-example shown ON a tablet screen to a 7-year-old alone — the child watches animation and reads short captions, not long text steps.",
    pedagogical_purpose: "Show the child a problem from the SELECTED Standard Pembelajaran solved visually step-by-step using the on-screen representation that fits that skill.",
    prior_knowledge: "Understands the core concept definitions established in CONCEPT.",
    block_responsibility: "Present a Malaysian problem, 2-5 short visual steps (each describing what the child SEES on screen), one common mistake, and the correct reasoning.",
    content_rules: [
      "problem_statement: ONE short Malaysian-context sentence the child can read (max 15 words). STRICT REQUIREMENT: Its skill and answer MUST match the selected SP EXACTLY (e.g., if SP is about naming 1-10, just ask them to count 6 objects, DO NOT ask comparison like \"Siapa ada lebih?\").",
      "solution_steps: 2-5 short strings, each describing a VISUAL action on screen. Select the action for the actual skill: count and name objects, arrange a number sequence, build tens and ones, write a numeral, or compare only when the SP requests comparison. Max 12 words per step.",
      "Each step must describe what the child SEES, not what a teacher does.",
      "visual_aid: Return {type, object_emoji, count, label, numeral, left_count, right_count, left_label, right_label}. STRICT RULE: Use type 'single_count' for counting/naming (e.g. Kenali 1-10), 'comparison' ONLY for comparison SP (lebih/kurang), 'number_line' for sequences, or 'none' when a visual aid would misrepresent the skill. Populate only relevant fields.",
      "common_mistake: ONE short child sentence about a mistake relevant to THIS SP — never reuse a banyak/sedikit misconception unless this is a comparison SP.",
      "correct_reasoning: ONE short child sentence explaining WHY the answer is right for THIS SP.",
      "Use emoji only when it helps the selected skill; do not force two groups of objects."
    ],
    language_rules: ["Child-direct, short Bahasa Melayu. Use emoji as visual aids."],
    age_appropriateness: "7-year-old follows visually. Each step short enough to read/hear in one breath.",
    malaysian_context: "Problem uses Malaysian names (Siti, Ali, Abu) and objects (manggis, epal, guli, gula-gula).",
    output_contract: {
      required_fields: ["title", "problem_statement", "solution_steps", "common_mistake", "correct_reasoning"],
      schema_description: "Object with title, problem_statement (string), solution_steps (array of short strings), common_mistake (string), correct_reasoning (string)."
    },
    validation_rules: [
      "solution_steps MUST have at least 2 entries.",
      "Each solution_step MUST be under 15 words and describe a visual.",
      "common_mistake and correct_reasoning MUST be non-empty child sentences.",
      "Must NOT contain teacher-only phrasing ('Guru menunjukkan', 'Murid akan...')."
    ],
    quality_criteria: {
      visual_clarity: 30,
      step_brevity: 25,
      reasoning_explicitness: 25,
      error_prevention: 20
    },
    forbidden_behaviour: [
      "Do NOT write long text-only steps without visual/emoji cues.",
      "Do NOT use formal terms ('teknik pemadanan satu-ke-satu') without child-language explanation.",
      "Do NOT write teacher instructions.",
      "Do NOT skip the common_mistake or correct_reasoning."
    ],
    next_block_handoff: "Prepares student to attempt partially-supported practice problems (GUIDED_PRACTICE)."
  },

  GUIDED_PRACTICE: {
    macro_version: MACRO_VERSION,
    asset_type: "GUIDED_PRACTICE",
    role: "You are a gamified-learning designer building an interactive practice WIDGET for a 7-year-old on a tablet for ANY school subject (Matematik, Bahasa Melayu, English, Sains, Sejarah, etc.). The child taps, drags, or matches on screen — you MUST choose the widget that best fits the ACTUAL topic, never default to the same widget for every topic.",
    pedagogical_purpose: "Let the child PRACTICE the concept through a short on-screen game (tap-the-many, matching pairs, number scale) with real data, not a text worksheet.",
    prior_knowledge: "Has reviewed WORKED_EXAMPLE step-by-step procedure.",
    block_responsibility: "Choose one widget_type, write a short child instruction, and provide CONCRETE seed_data the widget can render immediately (pairs, items, or values) — NEVER empty.",
    content_rules: [
      "widget_type: choose the ONE widget best suited to THIS topic from the registry: 'matching' (padankan pasangan gambar↔perkataan), 'drag_and_drop' (kategori/susun objek ke dalam kumpulan), 'number_scale' (banding dua nombor: > < =), 'sentence_builder' (bina ayat/perkataan daripada pilihan), 'base_ten_blocks' (nilai tempat nombor 1-99), 'fraction_slicer' (wakil pecahan), 'quiz_wheel' (pilih satu jawapan betul).",
      "Pick the widget that matches the ACTUAL topic — Bahasa Melayu/English ejaan/ayat → sentence_builder or matching; Matematik nombor/banding → number_scale or base_ten_blocks; Sains pengelasan/ciri → drag_and_drop; Matematik pecah → fraction_slicer; sebarang semakan pantas → quiz_wheel. Do NOT default to 'matching' for every topic.",
      "instruction: ONE short child sentence telling the child what to do on screen (e.g. 'Tolong Suku Penyu — tekan gambar yang BANYAK!'). Max 12 words.",
      "seed_data: MUST be a non-empty object containing concrete data the chosen widget renders. NEVER return {}.",
      "For 'matching': {pairs: [{image, label}, ...]} 3-6 pasangan, image = emoji string (e.g. '🍎🍎🍎'), label = perkataan (e.g. 'BANYAK'). Arahan MATCHING mesti guna 'Tekan kad untuk padankan' (TAP) — JANGAN sekali-kali 'Tarik garisan' (tiada widget lukis garisan; kanak-kanak tekan kad kiri kemudian kad kanan).",
      "For 'drag_and_drop': {categories: [label,...], items: [{label, category}, ...]} — setiap item mesti ada medan 'category' yang sepadan dengan salah satu label dalam categories (cth: {label:'🍎🍎🍎🍎🍎', category:'Banyak'}).",
      "For 'number_scale': {left_val: number, right_val: number, correct_relation: 'MORE_THAN'|'LESS_THAN'|'EQUAL'}.",
      "For 'sentence_builder': {target_sentence: string, word_bank: [string,...]} word_bank mengandungi perkataan betul + 1-2 pencelah.",
      "For 'base_ten_blocks': {target_number: number} nombor antara 1-99.",
      "For 'fraction_slicer': {target_fraction: string (e.g. '1/2'), total_parts: number, shaded_parts: number}.",
      "For 'quiz_wheel': {question: string, options: [string,...] (4 pilihan), correct_index: number (0-3)}.",
      "Use emoji to represent objects so the child can SEE and interact on screen.",
      "Write DIRECTLY to the child, never as teacher instructions."
    ],
    language_rules: ["Playful, encouraging child-direct Bahasa Melayu."],
    age_appropriateness: "7-year-old can do the widget in under 1 minute. Visual + tap/drag, minimal reading.",
    malaysian_context: "Use Malaysian objects/emoji and child words.",
    output_contract: {
      required_fields: ["title", "widget_type", "instruction", "seed_data"],
      schema_description: "Object with title, widget_type (string), instruction (string), seed_data (non-empty object with pairs/items/values)."
    },
    validation_rules: [
      "widget_type MUST be exactly one of: matching, drag_and_drop, number_scale, sentence_builder, base_ten_blocks, fraction_slicer, quiz_wheel. NEVER 'unknown' or empty.",
      "seed_data MUST NOT be empty {}.",
      "seed_data MUST match the chosen widget_type schema (pairs for matching, items+categories for drag_and_drop, left_val/right_val/correct_relation for number_scale, target_sentence+word_bank for sentence_builder, target_number for base_ten_blocks, target_fraction+total_parts+shaded_parts for fraction_slicer, question+options+correct_index for quiz_wheel).",
      "instruction MUST be a child-direct action sentence under 12 words.",
      "The widget MUST fit the actual topic — do not force 'matching' for non-matching topics.",
      "Must NOT contain teacher-only instructions."
    ],
    quality_criteria: {
      game_data_completeness: 35,
      widget_renderability: 30,
      child_clarity: 20,
      curriculum_alignment: 15
    },
    forbidden_behaviour: [
      "Do NOT return empty seed_data {} — the widget will render blank and the child will be stuck.",
      "Do NOT choose a widget_type outside matching/drag_and_drop/number_scale.",
      "Do NOT write teacher instructions ('Berikan petunjuk', 'Sediakan latihan').",
      "Do NOT use long text hints — the child practices by DOING, not reading."
    ],
    next_block_handoff: "Builds confidence for independent, unassisted problem solving (INDEPENDENT_PRACTICE)."
  },

  INDEPENDENT_PRACTICE: {
    macro_version: MACRO_VERSION,
    asset_type: "INDEPENDENT_PRACTICE",
    role: "You are an educational assessment writer creating unassisted practice exercises.",
    pedagogical_purpose: "Test student mastery through unassisted practice problems.",
    prior_knowledge: "Has mastered scaffolded practice in GUIDED_PRACTICE.",
    block_responsibility: "Provide clean practice items that require independent application.",
    content_rules: [
      "Provide 2-3 practice questions of varied difficulty (easy, medium).",
      "Include detailed explanations for post-attempt review."
    ],
    language_rules: ["Clear assessment Bahasa Melayu."],
    age_appropriateness: "Clear, unambiguous question formatting.",
    malaysian_context: "Standard KSSR problem context.",
    output_contract: {
      required_fields: ["questions"],
      schema_description: "Array of practice question objects with options, correct answer, and explanation."
    },
    validation_rules: [
      "Must contain practice questions.",
      "Must include correct answer and explanation for review."
    ],
    quality_criteria: {
      item_clarity: 30,
      curriculum_alignment: 30,
      explanation_quality: 25,
      appropriate_difficulty: 15
    },
    forbidden_behaviour: [
      "Do NOT make question wording ambiguous.",
      "Do NOT leak answers in the question prompt."
    ],
    next_block_handoff: "Prepares student for lesson review and key takeaway consolidation (REFLECTION)."
  },

  REFLECTION: {
    macro_version: MACRO_VERSION,
    asset_type: "REFLECTION",
    role: "You are a metacognitive learning specialist helping students summarize and reflect on key lesson takeaways.",
    pedagogical_purpose: "Consolidate learning, highlight key takeaways, and prompt metacognitive self-reflection.",
    prior_knowledge: "Completed all instructional and practice blocks in the lesson.",
    block_responsibility: "Summarize 3-5 core takeaways and provide a self-assessment reflection prompt.",
    content_rules: [
      "summary_points: 3-5 short bullets about the ACTUAL lesson topic, each max 10 words, child-direct ('Kita belajar...', 'Ingat: ...').",
      "memory_tip: ONE short catchy sentence using a child-friendly analogy (e.g. 'Lebih macam makan banyak, kurang macam makan sikit!').",
      "common_mistakes: 1-2 short child sentences about mistakes to avoid.",
      "reflection_prompt: ONE short closing question to resolve the STORY_HOOK. IMPORTANT: The question MUST specifically mention the concrete objects the student just learned to count (e.g., shells, apples). Jika Blok 1 (STORY HOOK) sebelum ini menggunakan objek 'cengkerang' (shells), soalan ini WAJIB bertanya tentang 'cengkerang'. JANGAN reka objek baru (seperti epal) jika cerita asalnya adalah cengkerang/penyu/dsb!",
      "flashcards: 2-4 objects each with 'term' (one word) and 'definition' (one short child sentence).",
      "Write DIRECTLY to the child, encouraging and warm ('Syabas!', 'Tahniah!').",
      "Do NOT introduce brand-new un-taught concepts."
    ],
    language_rules: ["Reflective, encouraging, child-direct Bahasa Melayu."],
    age_appropriateness: "Short bullets with emoji. 7-year-old can scan or listen via TTS.",
    malaysian_context: "Encouraging Malaysian tone ('Syabas!', 'Tahniah!', 'Hebat!').",
    output_contract: {
      required_fields: ["title", "summary_points", "memory_tip", "common_mistakes", "reflection_prompt", "flashcards"],
      schema_description: "Object with title, summary_points (array of short strings), memory_tip (string), common_mistakes (array of short strings), reflection_prompt (string), flashcards (array of {term, definition})."
    },
    validation_rules: [
      "summary_points MUST have 3-5 entries about the actual topic.",
      "memory_tip MUST be non-empty and catchy.",
      "reflection_prompt MUST be a short child question.",
      "flashcards MUST have 2-4 entries with non-empty term and definition."
    ],
    quality_criteria: {
      synthesis_clarity: 35,
      metacognitive_value: 30,
      curriculum_alignment: 20,
      formatting: 15
    },
    forbidden_behaviour: [
      "Do NOT introduce brand new un-taught concepts in the summary.",
      "Do NOT make reflection overly academic."
    ],
    next_block_handoff: "Prepares student for final PBD assessment evaluation (ASSESSMENT_ITEM / QUIZ_QUESTION)."
  },

  VIDEO: {
    macro_version: MACRO_VERSION,
    asset_type: "VIDEO",
    role: "You are an expert educational video producer and scriptwriter for Malaysian digital learning platforms.",
    pedagogical_purpose: "Deliver high-engagement video scripts with synchronized narration, visual cues, and key takeaways.",
    prior_knowledge: "Complements lesson concept visual exploration.",
    block_responsibility: "Provide complete video script, narration text, scene-by-scene visual instructions, and key points.",
    content_rules: [
      "Write narration in natural, engaging spoken Bahasa Melayu.",
      "Provide timestamps / scene descriptors for visual animations.",
      "Include on-screen text callouts.",
      "Limit video duration scope to 2-4 minutes."
    ],
    language_rules: ["Dynamic, spoken educational Bahasa Melayu."],
    age_appropriateness: "Fast-paced, clear visual cues, upbeat tone.",
    malaysian_context: "Relatable animation prompts and Malaysian voice-over tone.",
    output_contract: {
      required_fields: ["video_title", "video_script", "scene_descriptions", "key_takeaways"],
      schema_description: "Object containing video title, full voice script, scene animation breakdown, and key takeaway summary."
    },
    validation_rules: [
      "Must contain video script narration text.",
      "Must contain visual scene descriptions."
    ],
    quality_criteria: {
      script_engagement: 30,
      visual_synchronization: 25,
      pedagogical_clarity: 25,
      pacing: 20
    },
    forbidden_behaviour: [
      "Do NOT output plain text without visual scene cues.",
      "Do NOT write overly long monologues."
    ],
    next_block_handoff: "Complements interactive visual learning activities (INTERACTIVE)."
  },

  INTERACTIVE: {
    macro_version: MACRO_VERSION,
    asset_type: "INTERACTIVE",
    role: "You are a gamified learning activity designer specializing in primary education interactives.",
    pedagogical_purpose: "Engage students through interactive game mechanics (matching, sorting, drag-and-drop) to reinforce concepts.",
    prior_knowledge: "Understands key vocabulary and concept pairings.",
    block_responsibility: "Design interactive game data, instructions, matching pairs/categories, and feedback messages.",
    content_rules: [
      "Specify clear game type (matching, sorting, sequence).",
      "Provide concise instructions (Arahan Permainan).",
      "Include 4-6 matching pairs or category items.",
      "Provide positive and corrective feedback messages."
    ],
    language_rules: ["Fun, playful Bahasa Melayu."],
    age_appropriateness: "Simple rules, immediate gratification mechanics.",
    malaysian_context: "Fun gamified theme (e.g. Padankan, Susun Nombor, Misi Sains).",
    output_contract: {
      required_fields: ["activity_type", "instructions", "game_data", "feedback_messages"],
      schema_description: "Object with activity type string, instructions, game items/pairs payload, and feedback strings."
    },
    validation_rules: [
      "Must include clear instructions.",
      "Must include structured game pairs or items array."
    ],
    quality_criteria: {
      game_mechanic_clarity: 30,
      educational_value: 30,
      feedback_quality: 20,
      engagement: 20
    },
    forbidden_behaviour: [
      "Do NOT invent unsupported widget mechanics outside matching, sorting, and sequencing.",
      "Do NOT create ambiguous matching pairs with multiple valid answers.",
      "Do NOT leave game items array empty."
    ],
    next_block_handoff: "Reinforces memory retention before memory card drills (FLASHCARD)."
  },

  FLASHCARD: {
    macro_version: MACRO_VERSION,
    asset_type: "FLASHCARD",
    role: "You are a flashcard memory & spaced-repetition design specialist.",
    pedagogical_purpose: "Promote active recall and key term retention through digital flashcards.",
    prior_knowledge: "Reviewed concept definitions and key terminology.",
    block_responsibility: "Create 4-6 high-yield flashcards with prompt (front) and answer/explanation (back).",
    content_rules: [
      "Front: Clear question, term, or visual prompt.",
      "Back: Concise definition, answer, or key rule.",
      "Explanation: 1-sentence context or mnemonic helper."
    ],
    language_rules: ["Concise, punchy Bahasa Melayu."],
    age_appropriateness: "Bite-sized memory cards for fast review.",
    malaysian_context: "KSSR terminology focus.",
    output_contract: {
      required_fields: ["cards"],
      schema_description: "Array of flashcard objects containing front, back, and optional explanation/mnemonic."
    },
    validation_rules: [
      "Must contain array of at least 3 flashcard items.",
      "Every card must have non-empty front and back text."
    ],
    quality_criteria: {
      recall_value: 35,
      conciseness: 30,
      curriculum_relevance: 20,
      clarity: 15
    },
    forbidden_behaviour: [
      "Do NOT put long paragraphs on the front of a flashcard.",
      "Do NOT leave card back empty."
    ],
    next_block_handoff: "Prepares student for self-testing via quiz questions (QUIZ_QUESTION)."
  },

  QUIZ_QUESTION: {
    macro_version: MACRO_VERSION,
    asset_type: "QUIZ_QUESTION",
    role: "You are a formative quiz author for Malaysian KSSR early-years, writing 2-3 MCQs a 7-year-old answers on a tablet.",
    pedagogical_purpose: "Give 2-3 short picture-friendly questions to check the child understands the concept.",
    prior_knowledge: "Covered complete lesson instructional materials.",
    block_responsibility: "Produce a questions array; each question has a short stem, exactly 4 plain-text options, the correct option index (0-3), a short explanation, and an optional TP level.",
    content_rules: [
      "questions: array of 2-3 question objects.",
      "Each stem: ONE short question the child can read alone (max 15 words). Use emoji where helpful.",
      "Each options: array of exactly 4 short plain-text strings (the answer text, no labels).",
      "Each correct_index: integer 0-3 pointing to the correct option.",
      "Each explanation: ONE short child sentence explaining why the answer is correct.",
      "tp_level: optional, one of TP1/TP2/TP3.",
      "Make distractors plausible but clearly wrong so a 7-year-old is not confused.",
      "Write DIRECTLY to the child."
    ],
    language_rules: ["Child-direct Bahasa Melayu. Short words."],
    age_appropriateness: "7-year-old reads stem + 4 options quickly. No long formal phrasing.",
    malaysian_context: "Malaysian names and objects in scenarios.",
    output_contract: {
      required_fields: ["title", "questions"],
      schema_description: "Object with title, questions (array of {stem, options[4], correct_index, explanation, tp_level?})."
    },
    validation_rules: [
      "questions MUST contain 2-3 entries.",
      "Each question MUST have exactly 4 options.",
      "Each correct_index MUST be 0-3 and within the options array length.",
      "Each explanation MUST be non-empty.",
      "Must NOT use 'all of the above' / 'none of the above'."
    ],
    quality_criteria: {
      item_alignment: 30,
      distractor_plausibility: 25,
      explanation_clarity: 25,
      child_readability: 20
    },
    forbidden_behaviour: [
      "Do NOT create 'all of the above' / 'none of the above' options.",
      "Do NOT give ambiguous questions with multiple correct options.",
      "Do NOT use formal assessment language ('Pilih pernyataan yang paling tepat')."
    ],
    next_block_handoff: "Contributes to formative assessment bank."
  },

  ASSESSMENT_ITEM: {
    macro_version: MACRO_VERSION,
    asset_type: "ASSESSMENT_ITEM",
    role: "You are a Malaysian Examination Syndicate (LPM) & PBD assessment expert.",
    pedagogical_purpose: "Deliver formal summative/PBD assessment item evaluating specific Tahap Penguasaan (TP1-TP6).",
    prior_knowledge: "Evaluates comprehensive understanding of the Learning Standard (SP).",
    block_responsibility: "Formulate rigorous PBD assessment item tagged with Cognitive Level (Bloom) and TP level.",
    content_rules: [
      "Align strictly with target SP code and TP level.",
      "Formulate multiple choice or structured response item.",
      "Include diagnostic misconception target for incorrect choices.",
      "Provide server-verifiable correct answer key."
    ],
    language_rules: ["Formal Malaysian assessment Bahasa Melayu."],
    age_appropriateness: "Rigorous yet fair assessment language.",
    malaysian_context: "PBD Tahap Penguasaan (TP1-TP6) standard alignment.",
    output_contract: {
      required_fields: ["question_text", "options", "correct_answer", "explanation", "tp_level", "cognitive_level", "misconception_target"],
      schema_description: "Object containing PBD question, options, correct answer key, explanation, TP level (1-6), cognitive level, and misconception target."
    },
    validation_rules: [
      "Must include TP level specification (TP1 - TP6).",
      "Correct answer MUST match one of the options.",
      "Must specify cognitive level."
    ],
    quality_criteria: {
      pbd_tp_alignment: 35,
      psychometric_validity: 30,
      explanation_thoroughness: 20,
      formatting: 15
    },
    forbidden_behaviour: [
      "Do NOT leak answer keys in the question stem.",
      "Do NOT generate invalid TP levels outside 1-6."
    ],
    next_block_handoff: "Provides authoritative data for server-side mastery evaluation (submitAssessment)."
  }
});

export function getPromptForAssetType(assetType: string): PromptContract {
  if (!assetType || typeof assetType !== "string") {
    throw new Error("Asset type mesti berupa rentetan (string) yang sah.");
  }

  const normalized = assetType.trim().toUpperCase();
  const aliasMap: Record<string, string> = {
    STORY_HOOK: "LESSON_HOOK",
    REAL_WORLD_CONTEXT: "LESSON_HOOK",
    AUDIO_HOOK: "LESSON_HOOK",
    LEARNING_OBJECTIVE: "LESSON_OBJECTIVE",
    MIND_MAP: "CONCEPT",
    INFOGRAPHIC: "CONCEPT",
    CONCEPT_CARD: "CONCEPT",
    CONCEPT_CPA: "CONCEPT",
    WORKED_EXAMPLE: "WORKED_EXAMPLE",
    GUIDED_PRACTICE: "GUIDED_PRACTICE",
    INTERACTIVE_PRACTICE: "GUIDED_PRACTICE",
    INDEPENDENT_PRACTICE: "INDEPENDENT_PRACTICE",
    KEY_TAKEAWAY: "REFLECTION",
    REFLECTION: "REFLECTION",
    VIDEO_LESSON: "VIDEO",
    VIDEO: "VIDEO",
    MATCHING_GAME: "INTERACTIVE",
    INTERACTIVE: "INTERACTIVE",
    FLASHCARD_DECK: "FLASHCARD",
    FLASHCARD: "FLASHCARD",
    QUIZ_QUESTION: "QUIZ_QUESTION",
    INTERACTIVE_GAME: "ASSESSMENT_ITEM",
    ASSESSMENT_ITEM: "ASSESSMENT_ITEM",
  };

  const targetKey = aliasMap[normalized] || normalized;
  const contract = BLOCK_PROMPT_REGISTRY[targetKey];

  if (!contract) {
    throw new Error(`Asset type '${assetType}' tidak wujud dalam Block Prompt Registry.`);
  }

  return contract;
}

export function validateMacroContext(context: any): boolean {
  if (!context || typeof context !== "object") {
    throw new Error("Konteks penjanaan macro tidak sah (harus berupa objek).");
  }

  const curriculum = context.curriculum_context || {};
  const learner = context.learner_profile || {};

  const hasSP = Boolean(curriculum.sp_code && String(curriculum.sp_code).trim());
  const hasTopic = Boolean((curriculum.topic_id || curriculum.topic) && String(curriculum.topic_id || curriculum.topic).trim());

  if (!hasSP && !hasTopic) {
    throw new Error("Kurikulum identiti tidak lengkap. Diperlukan sp_code atau topic_id/topic.");
  }

  if (!learner.year_level && !learner.grade && !learner.age) {
    throw new Error("Profil pelajar (learner_profile) tidak lengkap. Diperlukan year_level, grade, atau age.");
  }

  return true;
}

export function buildMacroPrompt(options: any = {}): string {
  const {
    asset_type,
    curriculum_context = {},
    learner_profile = {},
    previous_block_summary = null,
    next_block_purpose = null,
    global_macro = {}
  } = options;

  validateMacroContext(options);
  const contract = getPromptForAssetType(asset_type);

  const subject = curriculum_context.subject || "Matematik";
  const yearLevel = learner_profile.year_level || learner_profile.grade || "Tahun 1";
  const age = learner_profile.age || (yearLevel.includes("1") ? 7 : yearLevel.includes("2") ? 8 : 9);
  const language = learner_profile.language || "Bahasa Melayu";
  const topic = curriculum_context.topic || curriculum_context.topic_name || "Topik Pelajaran";
  const subtopic = curriculum_context.subtopic || curriculum_context.subtopic_name || "";
  const spCode = curriculum_context.sp_code || "SP 1.1.1";
  const learningStandard = curriculum_context.learning_standard || curriculum_context.sp_description || "Standard Pembelajaran";

  const systemPrompt = `================================================================================
STUDYQUEST AI — MACRO PROMPT CONTRACT (VERSION ${contract.macro_version})
================================================================================

[MACRO 1 — ROLE]
${contract.role}

[MACRO 2 — CURRICULUM IDENTITY]
- Subjek: ${subject}
- Tingkatan / Tahun: ${yearLevel}
- Topik: ${topic}
- Unit / Subtopik: ${subtopic || "Tidak dinyatakan"}
- Standard Pembelajaran (SP Code): ${spCode}
- Penerangan Standard: ${learningStandard}

[MACRO 2B — CURRICULUM BOUNDARY (WAJIB)]
- Fokus tunggal aset ini ialah: ${learningStandard}.
- Topik hanya konteks induk. Unit/subtopik dan SP di atas menentukan kemahiran yang mesti diajar, divisualkan, dan dinilai.
- Jangan bawa kemahiran daripada unit lain. Khususnya, JANGAN menghasilkan aktiviti 'Banyak dan Sedikit', padanan satu-ke-satu, atau simbol > < = kecuali penerangan SP di atas benar-benar meminta perbandingan kuantiti/nombor.

[MACRO 3 — LEARNER PROFILE]
- Target Learner: Murid ${yearLevel} (Anggaran umur: ${age} tahun)
- Bahasa Pengantar: ${language}
- Tahap Pembacaan: ${learner_profile.reading_ability || "Sederhana / Sesuai Umur"}
- Keperluan Pedagogi: Concrete-Pictorial-Abstract (CPA) & Penjelasan visual.

[MACRO 3B — DEVICE-FIRST CONSTRAINT (WAJIB)]
- Pelajar menggunakan TABLET/TELEFON SAHAJA — tiada guru di sebelah, tiada objek sebenar, tiada kertas untuk melukis.
- SEMUA kandungan mesti dialamatkan TERUS kepada kanak-kanak ('Tengok!', 'Tekan!', 'Cuba!').
- DILARANG menulis arahan kepada guru ('Guru menunjukkan', 'Murid memegang', 'Gunakan objek sebenar', 'Lukiskan di kertas').
- Gantikan aktiviti fizikal kelas dengan interaksi skrin: tekan (tap), tarik (drag), padan (match), dengar (TTS 🔊).
- Gunakan emoji/gambar dalam teks supaya kanak-kanak BOLEH LIHAT dan kira di skrin.
- Ayat maksimum 10-12 patah perkataan. Perkataan mudah. Tiada 'serta', 'manakala', 'sebagai'.
- Setiap blok mesti boleh diselesaikan seorang diri dalam masa singkat.
- PERSONALISASI (WAJIB): Sebut nama murid sekurang-kurangnya sekali setiap blok menggunakan placeholder {{nama}} (cth: 'Mari, {{nama}}!', 'Tengok ni, {{nama}}', 'Syabas, {{nama}}!', '{{nama}}, tolong Suku Penyu...'). JANGAN tulis nama sebenar — gunakan {{nama}} sahaja. Sistem akan gantikan {{nama}} dengan nama murid atau nama samaran secara automatik. Ini menjadikan setiap pelajaran terasa mesra dan peribadi untuk kanak-kanak.

[MACRO 3C — KSSR PEDAGOGY & NUMBER RANGE (WAJIB)]
- JULAT NOMBOR (NUMBER RANGE): Jika SP meliputi satu julat (contoh: "Kenali 1 hingga 10", "Nombor hingga 100"), anda WAJIB menyertakan contoh dari JULAT ATAS (upper range) untuk menguji penguasaan sebenar (contoh: guna nombor 7, 8, atau 9, JANGAN terhad hanya kepada kuantiti 1-5).
- ALATAN KOGNITIF (JARI & ANGGOTA): Walaupun tiada objek fizikal, anda SANGAT DIGALAKKAN menyuruh murid menggunakan jari mereka sendiri (cth: "Angkat 7 jari adik 🖐️✌️", "Kira guna jari") atau merujuk anggota badan untuk mengira, ini adalah kaedah KSSR yang kuat.
- KAEDAH VISUAL: Sokong konsep dengan Garis Nombor (Number Line), Kombinasi Nombor (Number Bonds), atau Bongkah Asas Sepuluh jika sesuai dengan SP.

[MACRO 4 — PEDAGOGICAL PURPOSE]
${contract.pedagogical_purpose}

[MACRO 5 — PRIOR KNOWLEDGE]
${contract.prior_knowledge}

[MACRO 6 — BLOCK RESPONSIBILITY]
${contract.block_responsibility}

[MACRO 7 — CONTENT RULES]
${contract.content_rules.map((rule, idx) => `${idx + 1}. ${rule}`).join("\n")}

[MACRO 8 — LANGUAGE RULES]
${contract.language_rules.map((rule, idx) => `- ${rule}`).join("\n")}

[MACRO 9 — AGE APPROPRIATENESS]
${contract.age_appropriateness}

[MACRO 10 — MALAYSIAN CULTURAL CONTEXT]
${contract.malaysian_context}

[MACRO 11 — OUTPUT CONTRACT]
Diperlukan medan: ${contract.output_contract.required_fields.join(", ")}
Format Output: HANYA pulangkan JSON sah yang mematuhi struktur di atas. Jangan sertakan teks markdown lain.

[MACRO 12 — VALIDATION RULES]
${contract.validation_rules.map((v, idx) => `${idx + 1}. ${v}`).join("\n")}

[MACRO 13 — QUALITY CRITERIA RUBRIC]
${Object.entries(contract.quality_criteria).map(([k, v]) => `- ${k}: ${v}%`).join("\n")}

[MACRO 14 — FORBIDDEN BEHAVIOUR]
${contract.forbidden_behaviour.map((f, idx) => `❌ ${f}`).join("\n")}

[MACRO 15 — NEXT-BLOCK HANDOFF]
${contract.next_block_handoff}
${previous_block_summary ? `\n[PEDAGOGICAL CONTINUITY — PREVIOUS BLOCK SUMMARY]\n${previous_block_summary}` : ""}
${next_block_purpose ? `\n[PEDAGOGICAL CONTINUITY — NEXT BLOCK PURPOSE]\n${next_block_purpose}` : ""}
${global_macro.lesson_goal ? `\n[GLOBAL LESSON GOAL]\n${global_macro.lesson_goal}` : ""}

================================================================================
STRICT REQUIREMENT: Generate ONLY the requested content asset matching ${contract.asset_type}.
================================================================================`;

  return systemPrompt;
}
