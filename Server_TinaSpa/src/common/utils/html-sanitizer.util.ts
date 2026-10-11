import sanitizeHtml from 'sanitize-html';

/** Only these schemes may appear in links / images; blocks javascript:, data:, vbscript:, file: ... */
const LINK_SCHEMES = ['http', 'https', 'mailto', 'tel'];
const IMAGE_SCHEMES = ['http', 'https'];

const BLOG_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h2',
    'h3',
    'h4',
    'p',
    'br',
    'hr',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'blockquote',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'figure',
    'figcaption',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'code',
    'pre',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    // loading / decoding / referrerpolicy are injected by transformTags below (which runs first).
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding', 'referrerpolicy'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: LINK_SCHEMES,
  allowedSchemesByTag: { img: IMAGE_SCHEMES },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  // Relative URLs (/images/..) are fine, protocol-relative (//evil.com) is not.
  allowProtocolRelative: false,
  // Drop the whole element (content included) for these instead of keeping the inner text.
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'iframe', 'object', 'embed', 'svg', 'math'],
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (tagName, attribs) => {
      const external = /^https?:/i.test(attribs.href ?? '');
      return {
        tagName,
        attribs: {
          ...attribs,
          ...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow ugc' } : { rel: 'noopener' }),
        },
      };
    },
    img: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' },
    }),
  },
};

/** Cleans editor HTML for storage: removes scripts, event handlers, inline styles, iframes, dangerous URLs. */
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, BLOG_OPTIONS).trim();
}

/** Strips every tag; for summaries, titles and SEO fields that must be plain text. */
export function stripHtml(text: string): string {
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {}, nonTextTags: ['script', 'style', 'textarea', 'noscript'] })
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .trim();
}

/** Accepts https URLs or site-relative paths only (no javascript:, data:, protocol-relative). */
export const SAFE_URL_PATTERN = /^(https:\/\/[^\s<>"'`]+|\/(?!\/)[^\s<>"'`]*)$/;
