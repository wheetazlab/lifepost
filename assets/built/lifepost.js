/* ==========================================================================
   Lifepost — runtime enhancements
   Loaded after main.min.js. All features are progressive enhancements.
   ========================================================================== */
(function () {
    'use strict';

    var doc = document;
    var root = doc.documentElement;

    /* ---------------- Category strip sort ---------------- */
    // Tags with a numeric value in Ghost Admin → Tag → Meta title are sorted by that number.
    // Tags without a meta title value fall to the end in their original (alphabetical) order.
    var catGrid = doc.querySelector('.gh-categories-grid');
    if (catGrid) {
        var catCards = catGrid.querySelectorAll('.gh-category-card');
        catCards.forEach(function (card) {
            var n = parseFloat(card.getAttribute('data-order'));
            card.style.order = isNaN(n) ? '9999' : String(n);
        });
    }

    /* ---------------- Dark / light mode ---------------- */
    function getSiteDefault() {
        var meta = doc.querySelector('meta[name="sw-color-scheme"]');
        return meta ? meta.content.toLowerCase() : 'auto';
    }
    function applyTheme(mode) {
        if (mode === 'auto') {
            mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        root.setAttribute('data-theme', mode);
    }
    function readStoredMode() {
        try { return localStorage.getItem('sw-theme'); } catch (e) { return null; }
    }
    function writeStoredMode(m) {
        try { localStorage.setItem('sw-theme', m); } catch (e) {}
    }
    // Initial application (also handled inline in default.hbs for no-flash)
    applyTheme(readStoredMode() || getSiteDefault());

    var toggles = doc.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var current = root.getAttribute('data-theme') || 'light';
            var next = current === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            writeStoredMode(next);
        });
    });

    // If user never chose, follow OS changes live
    if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        var handler = function () {
            if (!readStoredMode()) applyTheme('auto');
        };
        mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    }

    /* ---------------- Nav overflow: cap inline items at 5, rest to dropdown ---------------- */
    // Overrides the upstream width-based overflow (main.min.js) with a count-based rule.
    var navUl = doc.querySelector('.gh-head-menu .nav');
    if (navUl) {
        var MAX_VISIBLE = 5;
        var readBreakpoint = function () {
            var raw = getComputedStyle(doc.documentElement).getPropertyValue('--sw-breakpoint-mobile').trim();
            return parseInt(raw, 10) || 768;
        };
        var reorgNav = function () {
            var dropdown = navUl.querySelector('.gh-dropdown');
            var moreToggle = navUl.querySelector('.nav-more-toggle');
            if (!moreToggle || !dropdown) return; // upstream hasn't initialized yet
            var items = Array.prototype.slice.call(navUl.querySelectorAll('li'));
            if (window.innerWidth < readBreakpoint()) {
                // Mobile: restore all items inline, hide the More toggle + dropdown
                items.forEach(function (li) { navUl.insertBefore(li, moreToggle); });
                moreToggle.style.display = 'none';
                dropdown.style.display = 'none';
                return;
            }
            items.forEach(function (li, i) {
                if (i < MAX_VISIBLE) navUl.insertBefore(li, moreToggle);
                else dropdown.appendChild(li);
            });
            var hasOverflow = items.length > MAX_VISIBLE;
            moreToggle.style.display = hasOverflow ? '' : 'none';
            dropdown.style.display = hasOverflow ? '' : 'none';
        };
        var rerun = function () { requestAnimationFrame(reorgNav); };
        window.addEventListener('load', rerun);
        window.addEventListener('resize', rerun);
        rerun();
    }

    /* ---------------- Frosted nav scroll state ---------------- */
    var navEl = doc.querySelector('.gh-head-lp');
    if (navEl) {
        var onScroll = function () {
            if (window.scrollY > 24) navEl.classList.add('is-scrolled');
            else navEl.classList.remove('is-scrolled');
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------------- Reading progress bar ---------------- */
    var progress = doc.getElementById('gh-reading-progress');
    if (progress) {
        var bar = progress.querySelector('span');
        var article = doc.querySelector('.gh-article') || doc.querySelector('.gh-content');
        var ticking = false;
        var updateProgress = function () {
            if (!article) return;
            var rect = article.getBoundingClientRect();
            var start = window.scrollY + rect.top;
            var end = window.scrollY + rect.bottom - window.innerHeight;
            var pct = 0;
            if (end > start) {
                pct = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start))) * 100;
            }
            bar.style.width = pct.toFixed(2) + '%';
            ticking = false;
        };
        window.addEventListener('scroll', function () {
            if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
        }, { passive: true });
        updateProgress();
    }

    /* ---------------- Copy-to-clipboard + language chip for code blocks ---------------- */
    var codeBlocks = doc.querySelectorAll('.gh-content pre');
    codeBlocks.forEach(function (pre) {
        // Detect language from inner code element class (`language-foo`)
        var code = pre.querySelector('code');
        if (code) {
            var m = /language-([\w+-]+)/.exec(code.className || '');
            if (m) pre.setAttribute('data-lang', m[1]);
        }
        var btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'gh-lp-copy-btn';
        btn.textContent = 'Copy';
        btn.addEventListener('click', function () {
            var text = code ? code.textContent : pre.textContent;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function () { flashCopied(btn); });
            } else {
                var ta = doc.createElement('textarea');
                ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
                doc.body.appendChild(ta); ta.select();
                try { doc.execCommand('copy'); flashCopied(btn); } catch (e) {}
                doc.body.removeChild(ta);
            }
        });
        pre.appendChild(btn);
    });
    function flashCopied(btn) {
        btn.classList.add('is-copied');
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.classList.remove('is-copied'); btn.textContent = 'Copy'; }, 1400);
    }

    /* ---------------- Cmd+K / "/" → trigger Ghost's built-in search ---------------- */
    window.addEventListener('keydown', function (e) {
        var isTyping = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);
        var trigger = null;
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            trigger = doc.querySelector('[data-ghost-search]');
        } else if (e.key === '/' && !isTyping) {
            trigger = doc.querySelector('[data-ghost-search]');
        }
        if (trigger) {
            e.preventDefault();
            trigger.click();
        }
    });

})();
