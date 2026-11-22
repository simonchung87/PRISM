import katex from 'katex';

interface LatexSegment {
  type: 'text' | 'inline-math' | 'display-math';
  content: string;
}

function splitLatexSegments(input: string): LatexSegment[] {
  const segments: LatexSegment[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const remaining = input.slice(cursor);

    // Match display math $$...$$ or \[...\] or inline math $...$ or \(...\)
    const match = remaining.match(
      /(?<!\\)(\$\$[\s\S]+?(?<!\\)\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$(?!\$)([^$\n]|\\\$)+?(?<!\\)\$)/
    );

    if (!match || match.index === undefined) {
      segments.push({ type: 'text', content: remaining });
      break;
    }

    if (match.index > 0) {
      segments.push({ type: 'text', content: remaining.slice(0, match.index) });
    }

    const token = match[0];
    if (token.startsWith('$$') && token.endsWith('$$')) {
      segments.push({ type: 'display-math', content: token.slice(2, -2).trim() });
    } else if (token.startsWith('\\[') && token.endsWith('\\]')) {
      segments.push({ type: 'display-math', content: token.slice(2, -2).trim() });
    } else if (token.startsWith('\\(') && token.endsWith('\\)')) {
      segments.push({ type: 'inline-math', content: token.slice(2, -2).trim() });
    } else {
      segments.push({ type: 'inline-math', content: token.slice(1, -1).trim() });
    }

    cursor += match.index + token.length;
  }

  return segments;
}

export default function LatexText({ text }: { text: string }) {
  if (!text) return null;

  const segments = splitLatexSegments(text);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>;
        }

        const isDisplay = segment.type === 'display-math';
        const html = katex.renderToString(segment.content, {
          displayMode: isDisplay,
          throwOnError: false,
          strict: false,
        });

        if (isDisplay) {
          return (
            <span
              key={index}
              className="block my-2 overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        return (
          <span
            key={index}
            className="inline-block align-baseline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </>
  );
}
