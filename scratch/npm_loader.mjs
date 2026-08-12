export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('npm:')) {
    let cleanSpecifier = specifier.slice(4);
    // Strip version tag if present e.g. @base44/sdk@0.8.40 -> @base44/sdk
    cleanSpecifier = cleanSpecifier.replace(/@[^/]+$/, '');
    return nextResolve(cleanSpecifier, context);
  }
  return nextResolve(specifier, context);
}
