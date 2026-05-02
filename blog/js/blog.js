// Blog utility functions — pure, no Firebase dependencies

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Escape a string for safe use inside an HTML attribute value.
 * Replaces &, ", <, >, and ' with their HTML entities.
 * @param {string} str
 * @returns {string}
 */
function escapeAttr(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

/**
 * Format an ISO date string (YYYY-MM-DD) as a human-readable date.
 * e.g. "2026-05-01" → "May 1, 2026"
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  // Parse as UTC to avoid timezone-shift issues with YYYY-MM-DD strings
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

// ---------------------------------------------------------------------------
// Task 3.1 — calculateReadingTime
// ---------------------------------------------------------------------------

/**
 * Calculate estimated reading time in minutes.
 * Assumes an average reading speed of 200 words per minute.
 * Result is always at least 1.
 *
 * @param {number} wordCount - Number of words in the post content
 * @returns {number} Reading time in minutes (integer ≥ 1)
 *
 * Requirements: 6.1, 6.2
 */
export function calculateReadingTime(wordCount) {
  if (!wordCount || wordCount < 1) return 1;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// ---------------------------------------------------------------------------
// Task 3.3 — sortPostsByDate
// ---------------------------------------------------------------------------

/**
 * Return a new array of posts sorted in descending date order (newest first).
 * Does NOT mutate the input array.
 * String comparison works correctly for ISO dates in YYYY-MM-DD format.
 *
 * @param {Array<{date: string}>} posts
 * @returns {Array<{date: string}>}
 *
 * Requirements: 1.1
 */
export function sortPostsByDate(posts) {
  return [...posts].sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Task 3.5 — filterPostsByTag
// ---------------------------------------------------------------------------

/**
 * Filter posts by tag.
 * - If tag is null or an empty string, returns all posts unchanged.
 * - Otherwise returns only posts whose `tags` array includes the tag
 *   (case-insensitive comparison).
 *
 * @param {Array<{tags: string[]}>} posts
 * @param {string|null} tag
 * @returns {Array<{tags: string[]}>}
 *
 * Requirements: 5.1, 5.3, 5.5
 */
export function filterPostsByTag(posts, tag) {
  if (tag === null || tag === undefined || tag === '') {
    return posts;
  }
  const normalised = tag.toLowerCase();
  return posts.filter(
    (post) =>
      Array.isArray(post.tags) &&
      post.tags.some((t) => t.toLowerCase() === normalised)
  );
}

// ---------------------------------------------------------------------------
// isAdmin helper (also exported for use in auth.js / tests)
// ---------------------------------------------------------------------------

/**
 * Returns true iff the user is the designated admin.
 * Admin is identified by a specific verified email address.
 *
 * @param {object|null} user - Firebase Auth user object or null
 * @returns {boolean}
 *
 * Requirements: 9.1, 9.9
 */
export function isAdmin(user) {
  return (
    user !== null &&
    user !== undefined &&
    user.email === 'adeptashish@gmail.com' &&
    user.emailVerified === true
  );
}

// ---------------------------------------------------------------------------
// Task 3.7 — renderBlogCard
// ---------------------------------------------------------------------------

/**
 * Render an HTML string for a blog post card.
 * Includes admin controls (Edit / Delete) only when isAdmin(user) is true.
 *
 * @param {{
 *   id: string,
 *   title: string,
 *   authorName: string,
 *   date: string,
 *   readingTime: number,
 *   excerpt: string,
 *   tags: string[]
 * }} post
 * @param {object|null} user - Firebase Auth user or null
 * @returns {string} HTML string
 *
 * Requirements: 1.2, 6.3, 9.2, 9.3
 */
export function renderBlogCard(post, user) {
  const tagsAttr = escapeAttr(Array.isArray(post.tags) ? post.tags.join(',') : '');
  const idAttr = escapeAttr(post.id);
  const formattedDate = formatDate(post.date);
  const readingTimeDisplay = `${post.readingTime} min read`;

  const tagsHtml = Array.isArray(post.tags)
    ? post.tags
        .map(
          (tag) =>
            `<button class="blog-tag" data-tag="${escapeAttr(tag)}">${escapeAttr(tag)}</button>`
        )
        .join('')
    : '';

  const adminControlsHtml = isAdmin(user)
    ? `<div class="blog-admin-controls">
        <a class="btn btn-secondary btn-sm" href="write.html?edit=${idAttr}">Edit</a>
        <button class="btn btn-danger btn-sm blog-delete-btn" data-id="${idAttr}">Delete</button>
      </div>`
    : (user && post.authorUid && user.uid === post.authorUid)
      ? `<div class="blog-admin-controls">
          <a class="btn btn-secondary btn-sm" href="write.html?edit=${idAttr}">Edit</a>
        </div>`
      : '';

  return `<article class="blog-card" data-tags="${tagsAttr}" data-id="${idAttr}">
  <div class="blog-card-meta">${escapeAttr(formattedDate)} · ${escapeAttr(readingTimeDisplay)}</div>
  <h2 class="blog-card-title"><a href="post.html?slug=${idAttr}">${escapeAttr(post.title)}</a></h2>
  <p class="blog-card-excerpt">${escapeAttr(post.excerpt)}</p>
  <div class="blog-card-footer">
    <span class="blog-author">${escapeAttr(post.authorName)}</span>
    <div class="blog-tags">${tagsHtml}</div>
  </div>
  ${adminControlsHtml}</article>`;
}

// ---------------------------------------------------------------------------
// Task 3.9 — renderBlogDetail
// ---------------------------------------------------------------------------

/**
 * Render an HTML string for the full blog post detail view.
 *
 * @param {{
 *   id: string,
 *   title: string,
 *   authorName: string,
 *   date: string,
 *   readingTime: number,
 *   tags: string[],
 *   content: string
 * }} post
 * @returns {string} HTML string
 *
 * Requirements: 2.1, 6.4
 */
export function renderBlogDetail(post) {
  const formattedDate = formatDate(post.date);
  const readingTimeDisplay = `${post.readingTime} min read`;

  const tagsHtml = Array.isArray(post.tags)
    ? post.tags
        .map(
          (tag) =>
            `<button class="blog-tag" data-tag="${escapeAttr(tag)}">${escapeAttr(tag)}</button>`
        )
        .join('')
    : '';

  return `<header class="blog-post-header">
  <h1 class="blog-post-title">${escapeAttr(post.title)}</h1>
  <div class="blog-post-meta">
    <span class="blog-author blog-post-byline">${escapeAttr(post.authorName)}</span>
    <span>${escapeAttr(formattedDate)}</span>
    <span>${escapeAttr(readingTimeDisplay)}</span>
  </div>
  <div class="blog-tags">${tagsHtml}</div>
</header>
<div class="blog-post-content">${post.content}</div>`;
}
