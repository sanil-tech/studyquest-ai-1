import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { transformSync } from 'esbuild';

const sdkPath = pathToFileURL(path.resolve('./node_modules/@base44/sdk/dist/index.js')).href;
const mapperPath = pathToFileURL(path.resolve('./base44/shared/lessonMapper.ts')).href;
const evaluatorPath = pathToFileURL(path.resolve('./base44/shared/lessonCompletenessEvaluator.ts')).href;

export function loadFunction(funcPath: string) {
  const fullPath = path.resolve(funcPath);
  let code = fs.readFileSync(fullPath, 'utf-8');

  code = code.replace(/npm:@base44\/sdk@[^\s'"]+/g, sdkPath);
  code = code.replace(/["']\.\.\/\.\.\/shared\/lessonMapper\.ts["']/g, `'${mapperPath}'`);
  code = code.replace(/["']\.\.\/\.\.\/shared\/lessonCompletenessEvaluator\.ts["']/g, `'${evaluatorPath}'`);

  const transformed = transformSync(code, {
    loader: 'ts',
    format: 'esm',
    target: 'esnext'
  });

  const dataUrl = `data:text/javascript;base64,${Buffer.from(transformed.code).toString('base64')}`;
  return import(dataUrl);
}

const mod = await loadFunction('./base44/functions/generateModularLessonContent/entry.ts');
console.log("SUCCESSFULLY LOADED FUNCTION HANDLER!", typeof mod.default);
