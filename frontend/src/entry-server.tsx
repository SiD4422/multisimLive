import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './pages/Layout';
import FeedbackWidget from './components/FeedbackWidget';
import NotFound from './pages/NotFound';
import { renderMarketingRoutes } from './routes/marketingRoutes';

// Eagerly import all non-simulator pages ONLY in the SSR bundle so renderToString
// emits full synchronous HTML with zero Suspense fallbacks or hidden stream templates.
const eagerPages = import.meta.glob<{ default: React.ComponentType }>(
  ['./pages/**/*.tsx', '!./pages/Simulator.tsx'],
  { eager: true },
);

// Re-key `./pages/...` -> `../pages/...` to match keys used inside src/routes/marketingRoutes.tsx
const normalizedEagerPages: Record<string, { default: React.ComponentType }> = {};
for (const [key, mod] of Object.entries(eagerPages)) {
  normalizedEagerPages[key.replace('./pages/', '../pages/')] = mod;
}

export interface RenderResult {
  html: string;
  headTags: string;
}

/**
 * Extracts React 19 hoisted head metadata (<title>, <meta>, <link>) and any inline
 * JSON-LD <script type="application/ld+json"> emitted by Helmet/SEO so they can be
 * placed cleanly inside <head>, leaving only visible body markup inside #root.
 */
function separateHeadAndBody(renderedHtml: string, helmet?: HelmetServerState): RenderResult {
  const headParts: string[] = [];
  let body = renderedHtml;

  // 1. Collect React 19 hoisted document metadata at the start of the rendered output
  // React 19 hoists <title>, <meta>, and <link> elements as a contiguous prefix before DOM nodes.
  const hoistedPrefixMatch = body.match(/^(?:<(?:title|meta|link)\b[^>]*>(?:.*?<\/title>)?)+/is);
  if (hoistedPrefixMatch) {
    headParts.push(hoistedPrefixMatch[0]);
    body = body.slice(hoistedPrefixMatch[0].length);
  }

  // 2. Also capture any <HelmetProvider> context tags (fallback if React ever buffers there)
  if (helmet) {
    const contextTags = [
      helmet.title.toString(),
      helmet.meta.toString(),
      helmet.link.toString(),
      helmet.script.toString(),
    ]
      .filter(Boolean)
      .join('\n    ');
    if (contextTags) headParts.push(contextTags);
  }

  // 3. Extract any remaining <title>, <meta>, <link rel="canonical">, or JSON-LD <script> inside body
  const inlineHeadPattern = /<(?:title[^>]*>[\s\S]*?<\/title>|meta\b[^>]*\/?>|link\b[^>]*rel=["']canonical["'][^>]*\/?>|script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>)/gi;
  body = body.replace(inlineHeadPattern, (match) => {
    headParts.push(match);
    return '';
  });

  return {
    html: body,
    headTags: headParts.join('\n    '),
  };
}

/**
 * Synchronously renders any marketing, tutorial, tool, compare, or circuit route to full static HTML.
 */
export async function render(url: string): Promise<RenderResult> {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const app = (
    <ThemeProvider>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <FeedbackWidget />
          <Routes>
            {renderMarketingRoutes(normalizedEagerPages)}
            <Route element={<Layout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </StaticRouter>
      </HelmetProvider>
    </ThemeProvider>
  );

  const rawHtml = renderToString(app);
  return separateHeadAndBody(rawHtml, helmetContext.helmet);
}
