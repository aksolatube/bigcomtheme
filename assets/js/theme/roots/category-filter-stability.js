(function categoryFilterStability() {
    'use strict';

    var filterContainer = document.getElementById('faceted-search-container');
    if (!filterContainer) return;

    function normalized(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterByFacet(filters, fragment) {
        return filters.find(function findFilter(filter) {
            return filter.facet.indexOf(fragment) !== -1;
        });
    }

    function filterByExactFacet(filters, facetName) {
        return filters.find(function findFilter(filter) {
            return filter.facet === facetName;
        });
    }

    function filterLabel(facet) {
        if (facet === 'room size' || facet.indexOf('recommended space size') !== -1 || facet === 'space size') return 'Room size';
        if (facet.indexOf('night light') !== -1 || facet.indexOf('nightlight') !== -1) return 'NightLight';
        if (facet.indexOf('fixture shape') !== -1) return 'Fixture';
        if (facet.indexOf('coverage') !== -1) return 'Coverage';
        if (facet.indexOf('diameter') !== -1) return 'Diameter';
        if (facet.indexOf('roof') !== -1) return 'Roof';
        if (facet.indexOf('extension') !== -1) return 'Extension tubes';
        return '';
    }

    function sizeDescription(filters) {
        var size = filterByFacet(filters, 'room size')
            || filterByFacet(filters, 'recommended space size')
            || filterByFacet(filters, 'space size')
            || filterByFacet(filters, 'coverage')
            || filterByFacet(filters, 'diameter');
        var value = size && size.value;

        if (!value) return '';
        if (value.indexOf('smaller') !== -1
            || value.indexOf('0–150') !== -1
            || value.indexOf('0-150') !== -1
            || value.indexOf('150-200') !== -1
            || value.indexOf('10 in') !== -1
            || value.indexOf('250 mm') !== -1
            || value.indexOf('25cm') !== -1) return 'smaller';
        if (value.indexOf('larger') !== -1
            || value.indexOf('150–300') !== -1
            || value.indexOf('150-300') !== -1
            || value.indexOf('250-300') !== -1
            || value.indexOf('14 in') !== -1
            || value.indexOf('350 mm') !== -1
            || value.indexOf('35cm') !== -1) return 'larger';
        return '';
    }

    function extensionDescription(filter) {
        var lengthMatch = filter && filter.facet.match(/(\d+)\s*["”]/);

        return lengthMatch ? lengthMatch[1] + '-inch extension tubes' : 'extension tubes';
    }

    function skylightCurrentViewTitle(filters) {
        var hurricaneFilter = filterByExactFacet(filters, 'high velocity hurricane zone rated');
        var hurricaneRated = hurricaneFilter && hurricaneFilter.value === 'yes';
        var size = sizeDescription(filters);
        var shapeFilter = filterByFacet(filters, 'fixture shape');
        var nightFilter = filterByFacet(filters, 'night light') || filterByFacet(filters, 'nightlight');
        var extensionFilter = filterByFacet(filters, 'extension');
        var roofFilter = filterByFacet(filters, 'roof');
        var shape = shapeFilter && shapeFilter.rawValue;
        var night = nightFilter && nightFilter.value;
        var extension = extensionFilter && extensionFilter.value;
        var extensionTubes = extensionDescription(extensionFilter);
        var title;

        if (size) {
            title = (shape ? shape + ' skylights' : 'Skylights') + ' for ' + size + ' spaces';
        } else if (shape) {
            title = shape + ' skylights';
        } else if (roofFilter) {
            title = 'Skylights for ' + roofFilter.rawValue.toLowerCase();
        } else if (extension === 'yes') {
            title = 'Skylight kits with ' + extensionTubes + ' included';
        } else if (extension === 'no') {
            title = 'Skylight kits without included ' + extensionTubes;
        } else {
            title = 'Solatube skylights';
        }

        if (hurricaneRated) {
            title = title === 'Solatube skylights'
                ? 'Hurricane-Rated Skylight Kits'
                : 'Hurricane-Rated ' + title.charAt(0).toLowerCase() + title.slice(1);
        }

        if (night === 'yes') title += ' with an integrated NightLight';
        if (night === 'no') title += ' without an integrated NightLight';
        if (extension === 'yes' && title.indexOf('extension tubes') === -1) {
            title += ' with ' + extensionTubes + ' included';
        }
        if (extension === 'no' && title.indexOf('extension tubes') === -1) {
            title += ' without included ' + extensionTubes;
        }

        return title;
    }

    function accessoryTypeTitle(rawValue) {
        var value = normalized(rawValue);

        if (value === 'extension tube') return 'Extension Tubes';
        if (value === 'add-on kit') return 'Add-On Kits';
        if (value === 'flashing/installation') return 'Roof Flashing & Installation';
        if (value === 'daylight control') return 'Daylight Controls';

        return rawValue;
    }

    function accessoryFunctionTitle(rawValue) {
        var value = normalized(rawValue);

        if (value === 'light control') return 'Daylight Controls';
        if (value === 'structural') return 'Structural Accessories';
        if (value === 'ventilation') return 'Ventilation Accessories';

        return rawValue;
    }

    function tubeDiameterTitle(filter) {
        var rawValue = filter && filter.rawValue;
        var inchMatch = rawValue && rawValue.match(/(\d+(?:\s*\/\s*\d+)?)\s*(?:inch|in\b|[\"”])/i);
        var metricMatch = rawValue && rawValue.match(/(\d+)\s*(mm|cm)\b/i);

        if (inchMatch) return inchMatch[1].replace(/\s/g, '') + '-Inch';
        if (metricMatch) return metricMatch[1] + ' ' + metricMatch[2].toLowerCase();

        return '';
    }

    function selectedFiltersByFacet(filters, facetName) {
        return filters.filter(function matchFacet(filter) {
            return filter.facet === facetName;
        });
    }

    function accessoryDiameterTitle(filters) {
        var diameterFilters = selectedFiltersByFacet(filters, 'tube diameter');
        var modelNames = diameterFilters.map(function mapDiameter(filter) {
            var rawValue = normalized(filter.rawValue);

            if (rawValue.indexOf('10 inch') !== -1 || rawValue.indexOf('160 model') !== -1) return 'Solatube 160';
            if (rawValue.indexOf('14 inch') !== -1 || rawValue.indexOf('290 model') !== -1) return 'Solatube 290';

            return tubeDiameterTitle(filter);
        }).filter(function uniqueValue(value, index, values) {
            return value && values.indexOf(value) === index;
        });

        if (modelNames.length === 1) return 'Parts for ' + modelNames[0] + ' Systems';
        if (modelNames.length > 1) return 'Parts for ' + modelNames.join(' & ') + ' Systems';

        return '';
    }

    function accessoryRoofTitle(filters) {
        var roofFilter = filters.find(function matchRoof(filter) {
            return filter.facet === 'roof type';
        });
        var value = normalized(roofFilter && roofFilter.rawValue);

        if (value.indexOf('flat') !== -1 || value.indexOf('no-pitch') !== -1) return 'Flat Roofs';
        if (value.indexOf('sloped') !== -1 || value.indexOf('pitched') !== -1) return 'Pitched Roofs';

        return '';
    }

    function categoryCurrentViewTitle(filters, categoryName) {
        var typeFilter = filterByExactFacet(filters, 'type');
        var functionFilter = filterByExactFacet(filters, 'function');
        var typeTitle = typeFilter && accessoryTypeTitle(typeFilter.rawValue);
        var functionTitle = functionFilter && accessoryFunctionTitle(functionFilter.rawValue);
        var diameterTitle = accessoryDiameterTitle(filters);
        var roofTitle = accessoryRoofTitle(filters);

        if (typeTitle) return typeTitle + (diameterTitle ? ' for ' + diameterTitle.replace(/^Parts for /, '').replace(/ Systems$/, '') : '');
        if (functionTitle) return functionTitle + (diameterTitle ? ' for ' + diameterTitle.replace(/^Parts for /, '').replace(/ Systems$/, '') : '');
        if (diameterTitle) return diameterTitle;
        if (roofTitle) return 'Solatube Parts for ' + roofTitle;

        return categoryName || 'Products';
    }

    function isSkylightCurrentView(categoryName) {
        var name = normalized(categoryName);
        var path = normalized(window.location.pathname).replace(/\/+$/, '');

        return name.indexOf('skylight') !== -1
            || name === 'daylighting systems'
            || path === '/solatube-skylights'
            || path === '/daylighting-systems';
    }

    function currentViewTitle(filters, categoryName) {
        if (isSkylightCurrentView(categoryName)) return skylightCurrentViewTitle(filters);

        return categoryCurrentViewTitle(filters, categoryName);
    }

    function isUsOrCanadaSkylightCategory() {
        var host = normalized(window.location.hostname);
        var path = normalized(window.location.pathname).replace(/\/+$/, '');
        var isCanada = host === 'solatubeshop.ca' || host === 'www.solatubeshop.ca';
        var isUs = host === 'shop.solatube.com' || host === 'www.shop.solatube.com';

        return (isCanada && path === '/solatube-skylights')
            || (isUs && path === '/daylighting-systems');
    }

    function hideRoofTypeFacet() {
        if (!isUsOrCanadaSkylightCategory()) return;

        Array.prototype.forEach.call(filterContainer.querySelectorAll('[data-facet]'), function hideFacet(facet) {
            if (normalized(facet.getAttribute('data-facet')) !== 'roof type') return;

            var block = facet.closest('.accordion-block');
            if (block) block.hidden = true;
        });
    }

    function updateCurrentView() {
        var views = document.querySelectorAll('.categoryCurrentView');

        Array.prototype.forEach.call(views, function updateView(view) {
            var heading = view.querySelector('[data-current-view-heading]');
            var categoryName = view.getAttribute('data-current-view-category') || '';
            var filters = Array.prototype.map.call(view.querySelectorAll('[data-current-view-filter]'), function readFilter(filter) {
                var facet = normalized(filter.getAttribute('data-filter-facet'));
                var rawValue = filter.getAttribute('data-filter-value') || '';
                var shortLabel = filterLabel(facet);
                var label = filter.querySelector('[data-current-view-filter-label]');

                if (label) {
                    if (shortLabel) {
                        if (label.textContent !== shortLabel + ':') label.textContent = shortLabel + ':';
                    } else if (!label.hidden) {
                        label.hidden = true;
                    }
                }

                return {
                    facet: facet,
                    rawValue: rawValue,
                    value: normalized(rawValue)
                };
            });
            var title = currentViewTitle(filters, categoryName);

            if (heading && heading.textContent !== title) heading.textContent = title;

            // The listing is replaced on every filter/sort response. Use that
            // fresh state rather than the independently refreshed mobile sidebar.
            if (view.closest('#product-listing-container')) {
                var pageHeading = document.querySelector('[data-category-page-title]');
                var pageTitle = filters.length ? title : categoryName;

                if (pageHeading && pageHeading.textContent !== pageTitle) pageHeading.textContent = pageTitle;
            }
        });
    }

    updateCurrentView();
    hideRoofTypeFacet();
    if (window.MutationObserver) {
        var listingContainer = document.getElementById('product-listing-container');
        if (listingContainer) {
            new MutationObserver(function listingChanged() {
                updateCurrentView();
                hideRoofTypeFacet();
            }).observe(listingContainer, { childList: true, subtree: true });
        }
        new MutationObserver(hideRoofTypeFacet).observe(filterContainer, { childList: true, subtree: true });
    }

}());
