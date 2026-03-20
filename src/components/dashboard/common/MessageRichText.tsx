"use client";

import React from "react";
import Link from "next/link";
import {
  IconExternalLink,
  IconFile,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconFileText,
  IconPhoto,
  IconCode,
  IconFileZip,
  IconLink,
  IconMovie,
  IconSettings,
  IconPresentation,
  IconGitPullRequest,
  IconBug,
  IconPalette,
  IconCheckbox,
} from "@tabler/icons-react";
import { replaceSlackEmojis } from "@/lib/utils/slackEmoji";
import { Tooltip } from "@/components/ui";
import type { SlackFileAttachment } from "@/lib/types";

interface MessageRichTextProps {
  text: string;
  className?: string;
  /** Map of Slack user ID → display name for resolving user mentions */
  userMap?: Map<string, string>;
  /** File attachments to render below the text */
  files?: SlackFileAttachment[];
  /** Trigger phrases from LLM analysis to highlight in-text */
  triggerPhrases?: string[];
  /** CSS color for trigger phrase highlights (emotion-derived) */
  highlightColor?: string;
}

type SlackToken =
  | { kind: "user"; label: string }
  | { kind: "channel"; label: string }
  | { kind: "link"; href: string; label: string }
  | { kind: "reference"; label: string };

const slackTokenRegex = /<[^>]+>/g;
const quotedPhraseRegex = /("[^"]+"|\u201c[^\u201d\n]+\u201d)/g;

function parseSlackToken(
  raw: string,
  userMap?: Map<string, string>,
): SlackToken {
  if (raw.startsWith("<@") && raw.endsWith(">")) {
    const userId = raw.slice(2, -1);
    const name = userMap?.get(userId);
    return { kind: "user", label: `@${name ?? userId}` };
  }

  if (raw.startsWith("<#") && raw.endsWith(">")) {
    const inner = raw.slice(2, -1);
    const [id, label] = inner.split("|");
    return {
      kind: "channel",
      label: `#${label ?? id}`,
    };
  }

  if (raw.startsWith("<http") && raw.endsWith(">")) {
    const inner = raw.slice(1, -1);
    const [href, label] = inner.split("|");
    return {
      kind: "link",
      href,
      label: label ?? href,
    };
  }

  return {
    kind: "reference",
    label: raw.slice(1, -1),
  };
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ─── Type-specific link icons ───────────────────────────────────────────────

type LinkType = "pr" | "issue" | "repo" | "doc" | "design" | "task" | "link";

function inferLinkType(url: string): LinkType {
  const lower = url.toLowerCase();
  const domain = extractDomain(url).toLowerCase();

  if (
    domain.includes("github.com") ||
    domain.includes("gitlab.com") ||
    domain.includes("bitbucket.org")
  ) {
    if (/\/pull\/|\/merge_requests\/|\/pull-requests\//.test(lower))
      return "pr";
    if (/\/issues\//.test(lower)) return "issue";
    return "repo";
  }
  if (
    domain.includes("docs.google.com") ||
    domain.includes("notion.so") ||
    domain.includes("confluence")
  )
    return "doc";
  if (domain.includes("figma.com")) return "design";
  if (
    domain.includes("linear.app") ||
    domain.includes("jira") ||
    domain.includes("asana.com") ||
    domain.includes("trello.com")
  )
    return "task";
  return "link";
}

function getLinkIcon(linkType: LinkType) {
  switch (linkType) {
    case "pr":
      return IconGitPullRequest;
    case "issue":
      return IconBug;
    case "doc":
      return IconFileText;
    case "design":
      return IconPalette;
    case "task":
      return IconCheckbox;
    default:
      return IconLink;
  }
}

function renderSlackToken(
  raw: string,
  key: string,
  userMap?: Map<string, string>,
) {
  const token = parseSlackToken(raw, userMap);

  switch (token.kind) {
    case "link": {
      const linkType = inferLinkType(token.href);
      const LinkIcon = getLinkIcon(linkType);
      const displayLabel =
        token.label !== token.href ? token.label : extractDomain(token.href);
      return (
        <Tooltip key={key} content={token.href}>
          <Link
            href={token.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[0.8em] text-accent underline-offset-2 hover:bg-accent/18 hover:underline transition-colors"
          >
            <LinkIcon size={12} className="shrink-0 opacity-60" />
            {displayLabel}
          </Link>
        </Tooltip>
      );
    }
    case "user":
      return (
        <span
          key={key}
          className="rounded-md bg-accent/12 px-1.5 py-0.5 font-mono text-[0.78em] text-accent"
        >
          {token.label}
        </span>
      );
    case "channel":
      return (
        <span
          key={key}
          className="rounded-md bg-positive/12 px-1.5 py-0.5 font-mono text-[0.78em] text-positive"
        >
          {token.label}
        </span>
      );
    case "reference":
      return (
        <span
          key={key}
          className="rounded-md bg-surprise/12 px-1.5 py-0.5 font-mono text-[0.78em] text-surprise"
        >
          {token.label}
        </span>
      );
  }
}

function renderTextWithEmojis(text: string, keyPrefix: string) {
  const segments = replaceSlackEmojis(text);

  // If no emojis found, return plain text
  if (segments.length === 1 && typeof segments[0] === "string") {
    return <React.Fragment key={`${keyPrefix}-plain`}>{text}</React.Fragment>;
  }

  return (
    <React.Fragment key={`${keyPrefix}-emojis`}>
      {segments.map((seg, i) => {
        if (typeof seg === "string")
          return <span key={`${keyPrefix}-t-${i}`}>{seg}</span>;
        if ("emoji" in seg) {
          return (
            <Tooltip key={`${keyPrefix}-e-${i}`} content={`:${seg.name}:`}>
              <span
                role="img"
                aria-label={seg.name.replace(/_/g, " ")}
                className="inline-block text-[1.1em] leading-none align-middle"
              >
                {seg.emoji}
              </span>
            </Tooltip>
          );
        }
        // Unknown / custom workspace emoji — show as styled badge
        return (
          <Tooltip
            key={`${keyPrefix}-u-${i}`}
            content={`Custom emoji: :${seg.unknown}:`}
          >
            <span className="inline-block rounded bg-bg-tertiary/60 px-1 py-0.5 font-mono text-[0.8em] text-text-tertiary">
              :{seg.unknown}:
            </span>
          </Tooltip>
        );
      })}
    </React.Fragment>
  );
}

// ─── Inline formatting: bold, italic, strikethrough, inline code ─────────────

type FormattedSegment =
  | { kind: "text"; value: string }
  | { kind: "bold"; value: string }
  | { kind: "italic"; value: string }
  | { kind: "strike"; value: string }
  | { kind: "code"; value: string };

/**
 * Parse Slack inline formatting: *bold*, _italic_, ~strikethrough~, `code`
 * Order matters — code first (most specific), then bold, italic, strikethrough.
 * Does NOT handle nesting (Slack itself doesn't render nested formatting).
 */
function parseInlineFormatting(text: string): FormattedSegment[] {
  // Regex matches code, bold, italic, strikethrough in one pass
  // Code: `...` (no nesting)
  // Bold: *...* (not preceded/followed by space for Slack-like behavior)
  // Italic: _..._ (not inside words — requires word boundary or start/end)
  // Strikethrough: ~...~
  const formatRegex =
    /`([^`]+)`|\*([^*]+)\*|(?:^|(?<=\s))_([^_]+)_(?=\s|$|[.,!?;:])|~([^~]+)~/g;

  const segments: FormattedSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = formatRegex.exec(text)) !== null) {
    // Add preceding plain text
    if (match.index > lastIndex) {
      segments.push({
        kind: "text",
        value: text.slice(lastIndex, match.index),
      });
    }

    if (match[1] !== undefined) {
      segments.push({ kind: "code", value: match[1] });
    } else if (match[2] !== undefined) {
      segments.push({ kind: "bold", value: match[2] });
    } else if (match[3] !== undefined) {
      segments.push({ kind: "italic", value: match[3] });
    } else if (match[4] !== undefined) {
      segments.push({ kind: "strike", value: match[4] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining plain text
  if (lastIndex < text.length) {
    segments.push({ kind: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ kind: "text", value: text }];
}

function renderFormattedSegment(
  seg: FormattedSegment,
  key: string,
  keyPrefix: string,
  userMap?: Map<string, string>,
  triggerPhrases?: string[],
  highlightColor?: string,
) {
  switch (seg.kind) {
    case "bold":
      return (
        <strong key={key} className="font-semibold text-text-primary">
          {renderTextWithTriggers(
            seg.value,
            `${keyPrefix}-bold`,
            userMap,
            triggerPhrases,
            highlightColor,
          )}
        </strong>
      );
    case "italic":
      return (
        <em key={key} className="italic">
          {renderTextWithTriggers(
            seg.value,
            `${keyPrefix}-italic`,
            userMap,
            triggerPhrases,
            highlightColor,
          )}
        </em>
      );
    case "strike":
      return (
        <del key={key} className="text-text-tertiary line-through">
          {renderTextWithTriggers(
            seg.value,
            `${keyPrefix}-strike`,
            userMap,
            triggerPhrases,
            highlightColor,
          )}
        </del>
      );
    case "code":
      return (
        <code
          key={key}
          className="rounded bg-bg-tertiary/80 px-1.5 py-0.5 font-mono text-[0.85em] text-accent"
        >
          {seg.value}
        </code>
      );
    case "text":
    default:
      return (
        <span key={key}>
          {renderInlineTokens(
            seg.value,
            keyPrefix,
            userMap,
            triggerPhrases,
            highlightColor,
          )}
        </span>
      );
  }
}

// ─── Trigger phrase highlighting ────────────────────────────────────────────

/**
 * Splits text by trigger phrases, wrapping matched phrases in highlight spans.
 * Uses case-insensitive matching. Highlights ALL occurrences.
 */
function applyTriggerHighlights(
  text: string,
  keyPrefix: string,
  triggerPhrases: string[],
  highlightColor: string,
  renderContent: (text: string, key: string) => React.ReactNode,
): React.ReactNode[] {
  if (triggerPhrases.length === 0) {
    return [<React.Fragment key={`${keyPrefix}-plain`}>{renderContent(text, `${keyPrefix}-plain`)}</React.Fragment>];
  }

  // Build a regex that matches any trigger phrase (case-insensitive, escaped)
  const escaped = triggerPhrases
    .filter((p) => p.length > 0)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (escaped.length === 0) {
    return [<React.Fragment key={`${keyPrefix}-plain`}>{renderContent(text, `${keyPrefix}-plain`)}</React.Fragment>];
  }

  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;
    // Check if this part matches any trigger phrase
    if (regex.test(part)) {
      regex.lastIndex = 0; // Reset after test
      return (
        <span
          key={`${keyPrefix}-trigger-${i}`}
          className="rounded-sm px-0.5 border-b-2"
          style={{
            backgroundColor: `color-mix(in srgb, ${highlightColor} 8%, transparent)`,
            borderColor: `color-mix(in srgb, ${highlightColor} 55%, transparent)`,
          }}
        >
          {renderContent(part, `${keyPrefix}-trigger-content-${i}`)}
        </span>
      );
    }
    regex.lastIndex = 0;
    return <React.Fragment key={`${keyPrefix}-text-${i}`}>{renderContent(part, `${keyPrefix}-text-${i}`)}</React.Fragment>;
  });
}

function renderTextWithTriggers(
  text: string,
  keyPrefix: string,
  userMap?: Map<string, string>,
  triggerPhrases?: string[],
  highlightColor?: string,
): React.ReactNode {
  if (!triggerPhrases || triggerPhrases.length === 0 || !highlightColor) {
    return renderTextWithEmojis(text, keyPrefix);
  }

  const result = applyTriggerHighlights(
    text,
    keyPrefix,
    triggerPhrases,
    highlightColor,
    (t, k) => renderTextWithEmojis(t, k),
  );
  return <>{result}</>;
}

function renderInlineTokens(
  text: string,
  keyPrefix: string,
  userMap?: Map<string, string>,
  triggerPhrases?: string[],
  highlightColor?: string,
) {
  const parts = text.split(quotedPhraseRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (quotedPhraseRegex.test(part)) {
      quotedPhraseRegex.lastIndex = 0;
      return (
        <mark
          key={`${keyPrefix}-quote-${index}`}
          className="rounded-sm bg-surprise/12 px-1 py-0.5 text-text-primary ring-1 ring-inset ring-surprise/25"
        >
          {renderTextWithTriggers(
            part,
            `${keyPrefix}-quote-${index}`,
            userMap,
            triggerPhrases,
            highlightColor,
          )}
        </mark>
      );
    }

    quotedPhraseRegex.lastIndex = 0;
    const tokens = part.split(slackTokenRegex);
    const matches = part.match(slackTokenRegex) ?? [];

    return (
      <span key={`${keyPrefix}-text-${index}`}>
        {tokens.map((chunk, tokenIndex) => (
          <span key={`${keyPrefix}-chunk-${index}-${tokenIndex}`}>
            {renderTextWithTriggers(
              chunk,
              `${keyPrefix}-chunk-${index}-${tokenIndex}`,
              userMap,
              triggerPhrases,
              highlightColor,
            )}
            {matches[tokenIndex]
              ? renderSlackToken(
                  matches[tokenIndex],
                  `${keyPrefix}-token-${index}-${tokenIndex}`,
                  userMap,
                )
              : null}
          </span>
        ))}
      </span>
    );
  });
}

function renderInlineSegment(
  text: string,
  keyPrefix: string,
  userMap?: Map<string, string>,
  triggerPhrases?: string[],
  highlightColor?: string,
) {
  const formatted = parseInlineFormatting(text);

  // Fast path: no formatting found
  if (formatted.length === 1 && formatted[0].kind === "text") {
    return renderInlineTokens(
      text,
      keyPrefix,
      userMap,
      triggerPhrases,
      highlightColor,
    );
  }

  return formatted.map((seg, i) =>
    renderFormattedSegment(
      seg,
      `${keyPrefix}-fmt-${i}`,
      `${keyPrefix}-fmt-${i}`,
      userMap,
      triggerPhrases,
      highlightColor,
    ),
  );
}

// ─── Code blocks ─────────────────────────────────────────────────────────────

function extractCodeBlocks(
  text: string,
): Array<
  | { kind: "text"; value: string }
  | { kind: "codeblock"; value: string; lang?: string }
> {
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts: Array<
    | { kind: "text"; value: string }
    | { kind: "codeblock"; value: string; lang?: string }
  > = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({
      kind: "codeblock",
      value: match[2],
      lang: match[1] || undefined,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ kind: "text", value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ kind: "text", value: text }];
}

// ─── File attachment cards ───────────────────────────────────────────────────

function getFileIcon(filetype?: string) {
  if (!filetype) return IconFile;
  if (filetype === "pdf") return IconFileTypePdf;
  if (["doc", "docx", "txt", "rtf"].includes(filetype)) return IconFileText;
  if (["xls", "xlsx", "csv"].includes(filetype)) return IconFileSpreadsheet;
  if (["ppt", "pptx"].includes(filetype)) return IconPresentation;
  if (
    ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"].includes(
      filetype,
    )
  )
    return IconPhoto;
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(filetype)) return IconMovie;
  if (["zip", "tar", "gz", "rar", "7z"].includes(filetype)) return IconFileZip;
  if (
    [
      "js",
      "ts",
      "py",
      "rb",
      "go",
      "rs",
      "php",
      "go",
      "html",
      "java",
      "cpp",
      "c",
      "h",
      "jsx",
      "tsx",
    ].includes(filetype)
  )
    return IconCode;
  if (["json", "yaml", "yml", "xml", "toml", "ini", "env"].includes(filetype))
    return IconSettings;
  return IconFile;
}

function renderFileIcon(filetype?: string) {
  return React.createElement(getFileIcon(filetype), { size: 18 });
}

function getFileColor(filetype?: string): string {
  if (!filetype) return "text-text-tertiary";
  if (filetype === "pdf") return "text-anger/70";
  if (["doc", "docx", "txt", "rtf"].includes(filetype)) return "text-accent/70";
  if (["xls", "xlsx", "csv"].includes(filetype)) return "text-positive/70";
  if (["ppt", "pptx"].includes(filetype)) return "text-surprise/70";
  if (
    ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"].includes(
      filetype,
    )
  )
    return "text-surprise/70";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(filetype))
    return "text-accent/70";
  if (["zip", "tar", "gz", "rar", "7z"].includes(filetype))
    return "text-text-tertiary";
  if (
    [
      "js",
      "ts",
      "py",
      "rb",
      "go",
      "rs",
      "java",
      "cpp",
      "c",
      "h",
      "jsx",
      "tsx",
    ].includes(filetype)
  )
    return "text-accent/70";
  return "text-text-tertiary";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileAttachmentCard({ file }: { file: SlackFileAttachment }) {
  const fileColor = getFileColor(file.filetype);
  const label = file.title || file.name;
  const size = file.size ? formatFileSize(file.size) : null;

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-bg-secondary/60 px-3 py-2.5 text-[12px] transition-colors hover:bg-bg-secondary group">
      <div
        className={`shrink-0 rounded-md bg-bg-tertiary/50 p-1.5 ${fileColor}`}
      >
        {renderFileIcon(file.filetype)}
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-text-primary leading-tight line-clamp-2">
          {label}
        </span>
        {(size || file.filetype) && (
          <span className="mt-0.5 block text-[10px] text-text-tertiary">
            {file.filetype?.toUpperCase()}
            {size ? ` \u00B7 ${size}` : ""}
          </span>
        )}
      </div>
      {file.permalink && (
        <a
          href={file.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded p-1 text-text-tertiary transition-colors hover:text-accent hover:bg-accent/8 opacity-0 group-hover:opacity-100"
        >
          <IconExternalLink size={14} />
        </a>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function MessageRichText({
  text,
  className = "",
  userMap,
  files,
  triggerPhrases,
  highlightColor,
}: MessageRichTextProps) {
  // Step 1: Extract code blocks first (most specific)
  const blocks = extractCodeBlocks(text);

  return (
    <div className={className}>
      {blocks.map((block, blockIndex) => {
        if (block.kind === "codeblock") {
          // Never highlight inside code blocks — they are literal text
          return (
            <pre
              key={`codeblock-${blockIndex}`}
              className="my-2 overflow-x-auto rounded-lg bg-bg-tertiary/60 border border-border-subtle/50 px-4 py-3 font-mono text-[0.82em] leading-relaxed text-text-secondary"
            >
              {block.lang && (
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  {block.lang}
                </span>
              )}
              <code>{block.value}</code>
            </pre>
          );
        }

        // Regular text — split into lines, wrapped in a keyed Fragment
        const lines = block.value.split("\n");
        return (
          <React.Fragment key={`textblock-${blockIndex}`}>
            {lines.map((line, index) => {
              const lineKey = `block-${blockIndex}-line-${index}`;
              const trimmed = line.trim();
              const isQuoteLine = trimmed.startsWith(">");
              const content = isQuoteLine ? trimmed.replace(/^>\s?/, "") : line;

              if (!content.trim()) {
                return <div key={`blank-${lineKey}`} className="h-2" />;
              }

              if (isQuoteLine) {
                return (
                  <div
                    key={`quote-${lineKey}`}
                    className="my-2 rounded-r-md border-l-2 border-l-accent/45 bg-accent/8 px-3 py-2 font-body text-[0.95em] italic text-text-primary"
                  >
                    {renderInlineSegment(
                      content,
                      `quote-${lineKey}`,
                      userMap,
                      triggerPhrases,
                      highlightColor,
                    )}
                  </div>
                );
              }

              return (
                <p key={lineKey} className="leading-relaxed">
                  {renderInlineSegment(
                    content,
                    lineKey,
                    userMap,
                    triggerPhrases,
                    highlightColor,
                  )}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}

      {/* File attachments — vertical stacking for clear visual hierarchy */}
      {files && files.length > 0 && (
        <div className="mt-2.5 flex flex-col gap-1.5">
          {files.map((f, i) => (
            <FileAttachmentCard key={`file-${i}`} file={f} />
          ))}
        </div>
      )}
    </div>
  );
}
