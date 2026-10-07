import $ from 'jquery';

function removedFacet(link) {
    const currentUrl = new URL(window.location.href);
    const removeUrl = new URL(link.href, currentUrl.href);
    const names = Array.from(new Set(Array.from(currentUrl.searchParams.keys())));

    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const remaining = removeUrl.searchParams.getAll(name).slice();
        const current = currentUrl.searchParams.getAll(name);

        for (let j = 0; j < current.length; j++) {
            const value = current[j];
            const matchingIndex = remaining.indexOf(value);

            if (matchingIndex === -1) return { name, value };
            remaining.splice(matchingIndex, 1);
        }
    }

    return null;
}

function friendlyBooleanFacetLabel(facet) {
    if (!facet || !/^(yes|no)$/i.test(facet.value)) return '';

    if (facet.name === 'High Velocity Hurricane Zone Rated') {
        return /^yes$/i.test(facet.value) ? 'Hurricane Rated (HVHZ)' : 'Not Hurricane Rated (HVHZ)';
    }

    const included = /^yes$/i.test(facet.value) ? 'Included' : 'Not included';

    if (facet.name === '20" Extension Tubes Included') {
        return `Extension tubes: ${included}`;
    }

    if (facet.name === 'Solar-powered Night Light Included') {
        return `Solar NightLight: ${included}`;
    }

    return '';
}

export function updateSelectedFacetLabels() {
    document.querySelectorAll('.facetedSearch-refineFilters .facetLabel').forEach(link => {
        const label = friendlyBooleanFacetLabel(removedFacet(link));

        if (!label) return;

        Array.from(link.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) node.remove();
        });
        link.insertBefore(document.createTextNode(`${label} `), link.firstChild);
        link.setAttribute('aria-label', `Remove filter: ${label}`);
    });
}

export default function loaded() {
    updateSelectedFacetLabels();

    if ($('#facetedSearch').length <= 0) {
        $('.toggleSidebarBlock').on('click', function toggleLink(e) {
            e.preventDefault();
            const toggleEleId = $(this).attr('href').replace('#', '');
            const toggleEle = document.getElementById(toggleEleId);
            $(this).toggleClass('is-open');
            $(toggleEle).toggleClass('is-open');
        });
    }

    // subcategory display
    if ($('.page-content-subcategories .image-wrap:not(.image-placeholder)').length > 0) {
        $('.page-content-subcategories ul').addClass('subcategory-grid');
    }
}
