const fs = require('fs');
let code = fs.readFileSync('src/components/lesson/blocks/ConceptCPABlock.jsx', 'utf8');

const oldEmoji = `  else if (lower.includes("oren") || lower.includes("buah")) emoji = "🍊";
  else if (lower.includes("cengkerang") || lower.includes("ketam")) emoji = "🦀";
  else if (lower.includes("gula-gula") || lower.includes("manisan")) emoji = "🍬";`;

const newEmoji = `  else if (lower.includes("oren") || lower.includes("buah")) emoji = "🍊";
  else if (lower.includes("cengkerang") || lower.includes("siput")) emoji = "🐚";
  else if (lower.includes("penyu")) emoji = "🐢";
  else if (lower.includes("telur")) emoji = "🥚";
  else if (lower.includes("gula-gula") || lower.includes("manisan")) emoji = "🍬";`;

code = code.replace(oldEmoji, newEmoji);
fs.writeFileSync('src/components/lesson/blocks/ConceptCPABlock.jsx', code);
