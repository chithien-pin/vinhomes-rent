export function parseRequestedPhotoPaths(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((path): path is string => typeof path === "string" && path.length > 0);
}

export function filterStoredPhotoPaths(
  requestedPaths: string[],
  storedPaths: string[]
): string[] {
  const stored = new Set(storedPaths);
  const seen = new Set<string>();

  return requestedPaths.filter((path) => {
    if (!stored.has(path) || seen.has(path)) return false;
    seen.add(path);
    return true;
  });
}
