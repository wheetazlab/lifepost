#!/usr/bin/env node
/* eslint-disable no-console */
/*
 * Browser audit: responsive layout, keyboard navigation, archive pages, 404.
 * Runs in a single browser/viewport combination (env-driven) so it can be
 * fanned out via a GitHub Actions matrix.
 */
const { chromium, firefox, webkit } = require('@playwright/test');

const SITE = process.env.SITE_URL || 'https://lifepost.swheetlife.com';
const BROWSER = process.env.BROWSER || 'chromium';
const VIEWPORT = process.env.VIEWPORT || 'desktop';

const viewports = {
    mobile:  { width: 375,  height: 667 },
    tablet:  { width: 768,  height: 1024 },
    desktop: { width: 1280, height: 800 },
};
const launchers = { chromium, firefox, webkit };

async function firstLink(page, prefix) {
    const href = await page.evaluate((p) => {
        const a = [...document.querySelectorAll(`a[href*="${p}"]`)]
            .find((el) => new URL(el.href, location.origin).pathname.startsWith(p));
        return a ? new URL(a.href, location.origin).pathname : null;
    }, prefix);
    return href;
}

async function checkPage(page, url, { requireList = false } = {}) {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => pageErrors.push(e.message));

    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    if (!resp || !resp.ok()) throw new Error(`HTTP ${resp && resp.status()} for ${url}`);

    // No horizontal scroll
    const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
    }));
    if (overflow.scrollWidth > overflow.innerWidth + 1) {
        throw new Error(`Horizontal overflow on ${url}: ${overflow.scrollWidth}px > ${overflow.innerWidth}px`);
    }

    if (requireList) {
        const cards = await page.$$eval(
            '.gh-card, article, .post-card, .gh-list-item, [class*="post"]',
            (nodes) => nodes.length
        );
        if (cards < 1) throw new Error(`Archive ${url} has zero post cards`);
    }

    // Surface console/page errors (but don't fail — many Ghost sites log benign console errors)
    if (consoleErrors.length) console.log(`  console errors on ${url}: ${consoleErrors.length}`);
    if (pageErrors.length) throw new Error(`JS errors on ${url}: ${pageErrors.join(' | ')}`);
}

async function checkKeyboard(page) {
    await page.goto(SITE, { waitUntil: 'domcontentloaded' });
    const reached = [];
    for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            const s = getComputedStyle(el);
            const hasFocus =
                s.outlineStyle !== 'none' ||
                s.boxShadow.includes('rgb') ||
                s.borderColor !== s.backgroundColor;
            return {
                tag: el.tagName,
                text: (el.innerText || el.getAttribute('aria-label') || '').slice(0, 40),
                hasFocus,
            };
        });
        if (info) reached.push(info);
    }
    if (reached.length === 0) throw new Error('Keyboard Tab reached zero focusable elements');
    const anyVisible = reached.some((r) => r.hasFocus);
    if (!anyVisible) throw new Error('No Tab-focused element had a visible focus indicator');
    console.log(`  keyboard: ${reached.length} focusable elements reached via Tab`);
}

(async () => {
    const viewport = viewports[VIEWPORT];
    const launcher = launchers[BROWSER];
    if (!viewport) throw new Error(`unknown viewport: ${VIEWPORT}`);
    if (!launcher) throw new Error(`unknown browser: ${BROWSER}`);

    console.log(`[${BROWSER}/${VIEWPORT}] auditing ${SITE}`);
    const browser = await launcher.launch();
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    try {
        await checkPage(page, SITE);
        console.log(`  ✓ home`);

        const tagPath = await firstLink(page, '/tag/');
        const authorPath = await firstLink(page, '/author/');

        if (tagPath) {
            await checkPage(page, SITE + tagPath, { requireList: true });
            console.log(`  ✓ tag archive (${tagPath})`);
        } else {
            console.log('::warning::no /tag/ link found on home');
        }

        if (authorPath) {
            await checkPage(page, SITE + authorPath, { requireList: true });
            console.log(`  ✓ author archive (${authorPath})`);
        } else {
            console.log('::warning::no /author/ link found on home');
        }

        // 404
        const resp = await page.goto(SITE + '/this-does-not-exist-xyz/', { waitUntil: 'domcontentloaded' });
        if (resp.status() !== 404) throw new Error(`404 page returned ${resp.status()}`);
        const hasHeading = await page.$('h1, h2');
        if (!hasHeading) throw new Error('404 page has no heading');
        console.log(`  ✓ 404 page`);

        // Keyboard on home (only once per matrix cell — skip on mobile where OS keyboards differ)
        if (VIEWPORT === 'desktop') {
            await checkKeyboard(page);
            console.log(`  ✓ keyboard navigation`);
        }
    } finally {
        await browser.close();
    }

    console.log(`[${BROWSER}/${VIEWPORT}] OK`);
})().catch((err) => {
    console.error(`[${BROWSER}/${VIEWPORT}] FAILED: ${err.message}`);
    process.exit(1);
});
