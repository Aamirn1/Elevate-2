import sanitizeHtmlBase from "sanitize-html";

/**
 * Permissive HTML sanitization for blog content (TipTap output).
 * Allows rich formatting, headings, lists, tables, images, iframes (for video embeds),
 * inline styles for colors/alignment/sizing, and safe link attributes.
 */
export function sanitizeHtml(
  input: string,
  options?: { allowedTags?: string[]; allowBasicOnly?: boolean }
): string {
  if (!input) return "";

  // Basic mode: limited inline tags for short text (e.g. testimonial quotes)
  if (options?.allowBasicOnly) {
    return sanitizeHtmlBase(input, {
      allowedTags: ["p", "br", "strong", "em", "a"],
      allowedAttributes: {
        a: ["href", "target", "rel", "title"],
      },
      allowedSchemes: ["http", "https", "mailto", "tel"],
      transformTags: {
        a: (tagName, attribs) => ({
          tagName,
          attribs: {
            ...attribs,
            target: "_blank",
            rel: "noopener noreferrer nofollow",
          },
        }),
      },
    });
  }

  // Full blog content mode
  const allowedTags = options?.allowedTags ?? [
    "p", "br", "strong", "em", "u", "s", "sup", "sub",
    "a", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "pre", "code",
    "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span", "iframe", "hr", "mark",
  ];

  return sanitizeHtmlBase(input, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "target", "rel", "title", "style"],
      img: ["src", "alt", "title", "width", "height", "style"],
      iframe: ["src", "width", "height", "allowfullscreen", "frameborder", "allow", "style"],
      span: ["style"],
      p: ["style"],
      div: ["style", "class"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      h5: ["style"],
      h6: ["style"],
      mark: ["style", "class"],
      td: ["style", "colspan", "rowspan"],
      th: ["style", "colspan", "rowspan"],
      code: ["class"],
      pre: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
      iframe: ["http", "https"],
    },
    allowedStyles: {
      "*": {
        color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\((\s*\d{1,3}\s*,?){3}\)$/i, /^rgba\((\s*\d{1,3}\s*,?){4}\)$/i, /^[\w-]+$/i],
        "background-color": [/^#(0x)?[0-9a-f]+$/i, /^rgb\((\s*\d{1,3}\s*,?){3}\)$/i, /^rgba\((\s*\d{1,3}\s*,?){4}\)$/i, /^[\w-]+$/i],
        "text-align": [/^(left|right|center|justify|start|end)$/i],
        "font-size": [/^[\d.]+(px|em|rem|%)?$/i],
        "font-weight": [/^[\w\d-]+$/i],
        "font-style": [/^(normal|italic|oblique)$/i],
        "text-decoration": [/^(none|underline|line-through|overline)$/i],
        margin: [/^.+$/],
        padding: [/^.+$/],
        width: [/^[\d.]+(px|em|rem|%)?$/i],
        height: [/^[\d.]+(px|em|rem|%)?$/i],
        "line-height": [/^[\d.]+(px|em|rem|%)?$/i],
        "border-color": [/^#(0x)?[0-9a-f]+$/i, /^rgb\((\s*\d{1,3}\s*,?){3}\)$/i, /^[\w-]+$/i],
        "border-width": [/^[\d.]+(px|em|rem|%)?$/i],
        "border-style": [/^(none|solid|dashed|dotted|double|groove|ridge|inset|outset)$/i],
      },
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: attribs.target ?? "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
    },
  });
}

/**
 * Slugify a string: lowercase, strip non-alphanumeric, hyphenate spaces.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Ensure a slug is unique by appending -2, -3, etc. when an existing slug is found.
 * `existsFn` should return true if the slug already exists in the DB.
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  existsFn: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug || "post";
  let n = 2;
  while (await existsFn(slug)) {
    slug = `${baseSlug}-${n}`;
    n += 1;
  }
  return slug;
}

/**
 * Parse a JSON-encoded tags string into a string array.
 */
export function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw !== "string") return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/**
 * Calculate reading time in minutes from content word count (200 wpm, min 1).
 */
export function calcReadingTime(content: string): number {
  if (!content) return 1;
  // strip HTML tags
  const text = content
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .trim();
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
