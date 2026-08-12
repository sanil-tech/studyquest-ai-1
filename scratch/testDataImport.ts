import fs from 'fs';
import path from 'path';
import { transformSync } from 'esbuild';

const entryPath = path.resolve('./base44/functions/generateModularLessonContent/entry.ts');
let code = fs.readFileSync(entryPath, 'utf-8');

// Replace Deno npm: specifier with standard Node module name
code = code.replace(/npm:@base44\/sdk@[^\s'"]+/g, '@base44/sdk');

// Transpile TS to JS
const transformed = transformSync(code, {
  loader: 'ts',
  format: 'esm',
  target: 'esnext'
});

// Import transpiled JS via data URL
const dataUrl = `data:text/javascript;base64,${Buffer.from(transformed.code).toString('base64')}`;
const module = await import(dataUrl);

console.log("SUCCESSFULLY LOADED FUNCTION HANDLER VIA HARNESS!", typeof module.default);
