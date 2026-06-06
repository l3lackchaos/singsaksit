import sanitizeHtml from 'sanitize-html';

// Allow a small, safe subset of formatting for admin/CMS rich text.
export function sanitizeRichText(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'h4',
      'blockquote', 'span',
    ],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  });
}

// Strip all markup — for plain-text fields like review comments.
export function stripTags(input: string): string {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
}
