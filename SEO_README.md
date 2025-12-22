# SEO Improvements for TRAG.edu

We have implemented dynamic metadata to make your past papers searchable by their specific content (e.g., "Grade 10 Science 1st Term").

## Changes Made

1.  **Added `react-helmet-async`**: This library manages the document head (Title, Meta Description, Keywords) dynamically for each page.
2.  **Updated `App.tsx`**: Removed manual title setting and added a default title/description.
3.  **Updated `PaperDetail.tsx`**: Now sets the page title to the Paper Title and includes rich descriptions and keywords based on the paper's grade, subject, and year.
4.  **Updated `GradePage.tsx` & `SubjectPage.tsx`**: Added dynamic metadata for category pages.

## Actions Required

1.  **Install Dependencies**:
    You must run the following command to install the new library:
    ```bash
    npm install
    ```
    (We added `react-helmet-async` to your `package.json`).

2.  **Sitemap Generation**:
    The current `public/sitemap.xml` is static. To fully leverage the new metadata, search engines need to find the links to the individual papers.
    - Ensure your grade and subject pages are crawlable (they are linked from Home).
    - Consider generating a sitemap that lists all `#/paper/:id` URLs if you have a way to export them from your database.
    - Since you use Hash Routing (`#/`), ensure you submit your base URL to Google Search Console and let Google crawl the JavaScript.

## Verification

After installing and running (`npm run dev`), navigate to a paper page.
Inspect the browser tab title. It should now show the paper name (e.g., "Science 2023 | Grade 10...").
Inspect the HTML source (or Elements tab in DevTools) `<head>` to see the updated `<meta name="description">`.
