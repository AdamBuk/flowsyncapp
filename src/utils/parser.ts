export interface ParsedTask {
  cleanTitle: string;
  tags: string[];
  rawText: string;
}

export function parseTaskInput(input: string): ParsedTask {
  const trimmed = input.trim();
  if (!trimmed) {
    return { cleanTitle: '', tags: [], rawText: '' };
  }

  // Match tags starting with # followed by alphanumeric characters or underscores
  const tagRegex = /(?:^|\s)#([\w\d\p{L}_-]+)/gu;
  const tags: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(trimmed)) !== null) {
    const tag = match[1].toLowerCase();
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  // Remove the tags from the displayed clean title
  const cleanTitle = trimmed
    .replace(/(?:^|\s)#[\w\d\p{L}_-]+/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    cleanTitle: cleanTitle || trimmed, // Fallback to raw text if only tag was typed
    tags,
    rawText: trimmed
  };
}
