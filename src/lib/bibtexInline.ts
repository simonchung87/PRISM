import type { BibTeXInlineNode } from '@/types/publication';

const commandTypes: Record<string, Exclude<BibTeXInlineNode['type'], 'text'>> = {
  emph: 'em',
  textit: 'em',
  textbf: 'strong',
  textsc: 'smallCaps',
  textsuperscript: 'sup',
  textsubscript: 'sub',
};

interface ParseResult {
  nodes: BibTeXInlineNode[];
  index: number;
}

export interface ParsedBibTeXInline {
  plainText: string;
  nodes: BibTeXInlineNode[];
}

function normalizeBibTeXInput(value: string): string {
  return value.replace(/^["']|["']$/g, '');
}

function pushText(nodes: BibTeXInlineNode[], text: string) {
  if (!text) return;

  const last = nodes[nodes.length - 1];
  if (last?.type === 'text') {
    last.text += text;
    return;
  }

  nodes.push({ type: 'text', text });
}

function readCommand(value: string, index: number): { command: string; index: number } {
  let cursor = index;
  let command = '';

  while (cursor < value.length && /[A-Za-z]/.test(value[cursor])) {
    command += value[cursor];
    cursor += 1;
  }

  if (!command && cursor < value.length) {
    command = value[cursor];
    cursor += 1;
  }

  return { command, index: cursor };
}

function parseGroup(value: string, index: number): ParseResult | null {
  if (value[index] !== '{') {
    return null;
  }

  return parseNodes(value, index + 1, true);
}

function findClosingDelimiter(value: string, startIndex: number, delimiter: string): number {
  let index = startIndex;

  while (index < value.length) {
    if (value[index] === '\\') {
      if (delimiter !== '$' && delimiter !== '$$' && value.startsWith(delimiter, index)) {
        return index;
      }
      index += 2;
      continue;
    }

    if (value.startsWith(delimiter, index)) {
      return index;
    }

    index += 1;
  }

  return -1;
}

function parseNodes(value: string, startIndex: number, stopAtBrace: boolean): ParseResult {
  const nodes: BibTeXInlineNode[] = [];
  let index = startIndex;

  while (index < value.length) {
    const char = value[index];

    if (char === '}' && stopAtBrace) {
      return { nodes, index: index + 1 };
    }

    if (value.startsWith('$$', index)) {
      const closeIndex = findClosingDelimiter(value, index + 2, '$$');
      if (closeIndex !== -1) {
        pushText(nodes, value.slice(index, closeIndex + 2));
        index = closeIndex + 2;
        continue;
      }
    }

    if (char === '$') {
      const closeIndex = findClosingDelimiter(value, index + 1, '$');
      if (closeIndex !== -1 && !value.slice(index + 1, closeIndex).includes('\n\n')) {
        pushText(nodes, value.slice(index, closeIndex + 1));
        index = closeIndex + 1;
        continue;
      }
    }

    if (value.startsWith('\\(', index)) {
      const closeIndex = findClosingDelimiter(value, index + 2, '\\)');
      if (closeIndex !== -1) {
        pushText(nodes, value.slice(index, closeIndex + 2));
        index = closeIndex + 2;
        continue;
      }
    }

    if (value.startsWith('\\[', index)) {
      const closeIndex = findClosingDelimiter(value, index + 2, '\\]');
      if (closeIndex !== -1) {
        pushText(nodes, value.slice(index, closeIndex + 2));
        index = closeIndex + 2;
        continue;
      }
    }

    if (char === '{') {
      const parsedGroup = parseGroup(value, index);
      if (parsedGroup) {
        nodes.push(...parsedGroup.nodes);
        index = parsedGroup.index;
        continue;
      }
    }

    if (char === '\\') {
      const { command, index: afterCommand } = readCommand(value, index + 1);

      if (command === 'cite') {
        const citationGroup = parseGroup(value, afterCommand);
        index = citationGroup?.index ?? afterCommand;
        continue;
      }

      const nodeType = commandTypes[command];
      if (nodeType && value[afterCommand] === '{') {
        const parsedGroup = parseGroup(value, afterCommand);
        if (parsedGroup) {
          nodes.push({ type: nodeType, children: parsedGroup.nodes });
          index = parsedGroup.index;
          continue;
        }
      }

      pushText(nodes, command ? command : '\\');
      index = afterCommand;
      continue;
    }

    if (char === '~') {
      pushText(nodes, ' ');
      index += 1;
      continue;
    }

    pushText(nodes, char);
    index += 1;
  }

  return { nodes, index };
}

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeParagraphWhitespace(value: string): string {
  const normalized = value
    .replace(/\r\n?/g, '\n')
    .replace(/\\par\b\s*/g, '\n\n')
    .trim();

  if (!normalized) {
    return '';
  }

  // First split on explicit blank lines (\n\n+)
  const rawBlocks = normalized.split(/\n\s*\n+/);
  const paragraphs: string[] = [];

  for (const block of rawBlocks) {
    const lines = block
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .filter(Boolean);

    if (lines.length === 0) continue;

    // Join lines unless the previous line clearly ends a sentence/paragraph
    let current = lines[0];
    for (let i = 1; i < lines.length; i += 1) {
      if (/[.!?:"'”’)]$/.test(current)) {
        paragraphs.push(current);
        current = lines[i];
      } else {
        current = `${current} ${lines[i]}`;
      }
    }
    paragraphs.push(current);
  }

  return paragraphs.join('\n\n');
}

export function flattenBibTeXInlineNodes(nodes: BibTeXInlineNode[]): string {
  return nodes.map((node) => {
    if (node.type === 'text') {
      return node.text;
    }
    return flattenBibTeXInlineNodes(node.children);
  }).join('');
}

export function parseBibTeXInline(
  value?: string,
  options?: { preserveParagraphs?: boolean }
): ParsedBibTeXInline {
  if (!value) {
    return { plainText: '', nodes: [] };
  }

  const preprocessed = options?.preserveParagraphs
    ? normalizeBibTeXInput(value).replace(/\\par\b\s*/g, '\n\n')
    : normalizeBibTeXInput(value);

  const parsed = parseNodes(preprocessed, 0, false);
  const flattened = flattenBibTeXInlineNodes(parsed.nodes);
  const plainText = options?.preserveParagraphs
    ? normalizeParagraphWhitespace(flattened)
    : compactWhitespace(flattened);

  return {
    plainText,
    nodes: parsed.nodes,
  };
}
