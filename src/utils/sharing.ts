import { ContentSummaryDto } from '../api';

/**
 * Build the public, shareable URL for a piece of content.
 * Uses the deployed origin in production and localhost in dev.
 */
export function buildShareUrl(content: { id: number; format: 'short' | 'long' }): string {
  const path = content.format === 'short' ? `/shorts/${content.id}` : `/long/${content.id}`;
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

/**
 * Native share if the browser supports the Web Share API; otherwise
 * copy the URL to the clipboard. Returns the action taken so the
 * caller can show an appropriate toast ("Shared!" vs "Link copied!").
 */
export type ShareResult = 'shared' | 'copied' | 'failed';

export async function shareContent(
  content: ContentSummaryDto,
  extras?: { url?: string; text?: string }
): Promise<ShareResult> {
  const url = extras?.url ?? buildShareUrl(content);
  const title = `${content.title} · BookSee.App`;
  const text = extras?.text ?? `Listen to "${content.title}" by ${content.author} on BookSee.App`;

  // 1) Native share sheet (mobile Safari, Chrome Android, etc.)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (e: unknown) {
      // User cancelled — don't treat as failure.
      if (e instanceof Error && e.name === 'AbortError') return 'failed';
      // Fall through to clipboard fallback.
    }
  }

  // 2) Clipboard fallback
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
