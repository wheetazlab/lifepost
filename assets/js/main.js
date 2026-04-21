// Theme JS entrypoint for the Lifepost Ghost theme.
// Most functionality (dropdown nav, search modal, pagination helper) is
// provided by @tryghost/shared-theme-assets and bundled via gulp. This file
// only wires up the theme-specific behaviours below.

// Infinite-scroll pagination powered by @tryghost/helpers-pagination.
// Passing `true` enables auto-loading as the user scrolls.
(function () {
    pagination(true);
})();

