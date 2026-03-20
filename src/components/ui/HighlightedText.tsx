import { useMemo } from "react";

interface HighlightedTextProps {
  text: string;
  className?: string;
  /** Map of Slack user ID → display name for resolving <@USERID> mentions */
  userMap?: Map<string, string>;
}

interface TextSegment {
  type: "text" | "highlight";
  content: string;
}

function resolveRawMentions(
  text: string,
  userMap?: Map<string, string>,
): string {
  if (!userMap || userMap.size === 0) return text;
  return text.replace(/<@([A-Z0-9]+)>/gi, (_match, userId: string) => {
    const name = userMap.get(userId);
    return name ? `@${name}` : `@${userId}`;
  });
}

// Common English contractions — never split these at the apostrophe
const CONTRACTION_RE =
  /\b(?:i'm|i'll|i'd|i've|it's|he's|she's|we're|we've|we'll|we'd|they're|they've|they'll|they'd|you're|you've|you'll|you'd|that's|there's|here's|what's|who's|where's|how's|let's|can't|won't|don't|doesn't|didn't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|couldn't|wouldn't|shouldn't|mustn't|ain't|o'clock)\b/gi;

function parseHighlights(text: string): TextSegment[] {
  const segments: TextSegment[] = [];

  // Step 1: Protect contractions by replacing their apostrophes with a placeholder
  const PLACEHOLDER = "\u200B"; // zero-width space
  const protectedText = text.replace(CONTRACTION_RE, (match) =>
    match.replace(/'/g, PLACEHOLDER),
  );

  // Step 2: Also protect possessive 's (e.g., "Bhavesh's", "project's")
  const withPossessives = protectedText.replace(
    /(\w)'(s\b)/gi,
    `$1${PLACEHOLDER}$2`,
  );

  // Step 3: Match quoted phrases in the protected text
  // Opening quote must be preceded by whitespace/start, closing by whitespace/punctuation/end
  const regex = /(?<=^|[\s([{])'([^']+)'(?=$|[\s)\]},.:;!?])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(withPossessives)) !== null) {
    if (match.index > lastIndex) {
      const raw = withPossessives.slice(lastIndex, match.index);
      segments.push({ type: "text", content: raw.replaceAll(PLACEHOLDER, "'") });
    }
    segments.push({ type: "highlight", content: match[1].replaceAll(PLACEHOLDER, "'") });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < withPossessives.length) {
    const raw = withPossessives.slice(lastIndex);
    segments.push({ type: "text", content: raw.replaceAll(PLACEHOLDER, "'") });
  }

  return segments;
}

export function HighlightedText({ text, className, userMap }: HighlightedTextProps) {
  const resolved = useMemo(() => resolveRawMentions(text, userMap), [text, userMap]);
  const segments = useMemo(() => parseHighlights(resolved), [resolved]);

  if (segments.length === 1 && segments[0].type === "text") {
    return <span className={className}>{resolved}</span>;
  }

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === "highlight" ? (
          <mark
            key={i}
            className="inline rounded-sm bg-accent/12 px-0.5 font-medium text-accent dark:bg-accent/18 dark:text-accent"
            style={{ textDecoration: "none" }}
          >
            {seg.content}
          </mark>
        ) : (
          <span key={i}>{seg.content}</span>
        ),
      )}
    </span>
  );
}
