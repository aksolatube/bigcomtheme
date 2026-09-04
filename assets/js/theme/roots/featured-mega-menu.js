(function featuredMegaMenu() {
    'use strict';

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-featured-mega]'));

    if (!panels.length) return;

    function firstText(root, selectors) {
        for (var i = 0; i < selectors.length; i += 1) {
            var match = root.querySelector(selectors[i]);
            if (match && match.textContent.trim()) return match.textContent.trim();
        }
        return '';
    }

    function firstAttribute(root, selectors, attributes) {
        for (var i = 0; i < selectors.length; i += 1) {
            var match = root.querySelector(selectors[i]);
            if (!match) continue;
            for (var j = 0; j < attributes.length; j += 1) {
                var value = match.getAttribute(attributes[j]);
                if (value) return value;
            }
        }
        return '';
    }

    function absoluteUrl(value, base) {
        try {
            return new URL(value, base).href;
        } catch (error) {
            return value;
        }
    }

    function productData(card, baseUrl) {
        var link = card.querySelector('.card-title a, [data-test="card-title"] a, a[href]');
        var href = link ? link.getAttribute('href') : '';
        var image = firstAttribute(card, ['.card-image', '.card-figure img', 'img'], ['data-src', 'data-lazy', 'src']);
        var name = firstText(card, ['.card-title', '[data-test="card-title"]', 'h3', 'h4']);
        var price = firstText(card, ['[data-product-price-with-tax]', '[data-product-price-without-tax]', '.price--withTax', '.price--withoutTax', '.price']);

        if (!href || !name || !image) return null;

        return {
            href: absoluteUrl(href, baseUrl),
            image: absoluteUrl(image, baseUrl),
            name: name,
            price: price,
        };
    }

    function makeProductCard(product) {
        var card = document.createElement('a');
        var media = document.createElement('span');
        var image = document.createElement('img');
        var copy = document.createElement('span');
        var name = document.createElement('span');
        var footer = document.createElement('span');
        var price = document.createElement('span');
        var arrow = document.createElement('span');

        card.className = 'featuredMega-product';
        card.href = product.href;
        media.className = 'featuredMega-productMedia';
        image.src = product.image;
        image.alt = '';
        image.loading = 'lazy';
        copy.className = 'featuredMega-productCopy';
        name.className = 'featuredMega-productName';
        name.textContent = product.name;
        footer.className = 'featuredMega-productFooter';
        price.className = 'featuredMega-productPrice';
        price.textContent = product.price;
        arrow.className = 'featuredMega-productArrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '→';

        media.appendChild(image);
        footer.appendChild(price);
        footer.appendChild(arrow);
        copy.appendChild(name);
        copy.appendChild(footer);
        card.appendChild(media);
        card.appendChild(copy);

        return card;
    }

    function normalized(value) {
        return String(value || '').trim().toLowerCase();
    }

    function currentStoreSuffix() {
        var hostname = window.location.hostname.toLowerCase();

        if (hostname.indexOf('shop.solatube.com') !== -1) return 'us';
        if (hostname.indexOf('solatubeshop.be') !== -1) return 'be';
        if (hostname.indexOf('solatubeshop.ca') !== -1) return 'ca';
        if (hostname.indexOf('solatubedirect.co.uk') !== -1) return 'uk';
        return '';
    }

    function storeAttribute(shortcut, attribute, storeSuffix) {
        var storeValue = storeSuffix ? shortcut.getAttribute(attribute + '-' + storeSuffix) : '';

        return storeValue || shortcut.getAttribute(attribute);
    }

    function setShortcutLabel(shortcut, label) {
        var textNode;

        if (!label) return;
        textNode = Array.prototype.slice.call(shortcut.childNodes).find(function findText(node) {
            return node.nodeType === 3;
        });
        if (textNode) textNode.nodeValue = label + ' ';
    }

    function applyStoreLabel(shortcut, storeSuffix) {
        var label = storeSuffix ? shortcut.getAttribute('data-label-' + storeSuffix) : '';

        setShortcutLabel(shortcut, label);
    }

    function ukLanding(shortcut) {
        var facetName = shortcut.getAttribute('data-facet-name');
        var facetValue = shortcut.getAttribute('data-facet-value');
        var facetIndex = shortcut.getAttribute('data-facet-index');
        var label = shortcut.textContent.trim().toLowerCase();

        if (facetName === 'Tube Diameter' && facetIndex === '0') {
            return { href: '/categories/solatube-skylights/250-mm-diameter-tube-skylight.html' };
        }
        if (facetName === 'Tube Diameter' && facetIndex === '1') {
            return { href: '/categories/solatube-skylights/350-mm-diameter-tube-skylights.html' };
        }
        if (facetName === 'Solar-powered Night Light Included') {
            return { href: '/categories/solatube-skylights/square-ceiling-fixtures.html', label: 'Square ceiling fixtures' };
        }
        if (label.indexOf('kits with extension tubes') !== -1) {
            return { href: '/categories/solatube-skylights/kits-with-extension-tubes.html' };
        }
        if (facetName === 'Type' && facetValue === 'Extension Tube') {
            return { href: '/daylighting-systems/fixtures-accessories-flashings-parts/extension-tubes/' };
        }
        if (facetName === 'Type' && facetValue === 'Add-On Kit') {
            return { href: '/categories/parts-accessories/add-on-kits.html' };
        }
        if (facetName === 'Function' && facetValue === 'Light Control') {
            return { href: '/categories/parts-accessories/daylight-controls.html' };
        }
        if (facetName === 'Type' && facetValue === 'Flashing/Installation') {
            return { href: '/categories/parts-accessories/roof-flashing.html' };
        }
        return null;
    }

    function hideUkAutomaticShortcuts(panel) {
        if (currentStoreSuffix() !== 'uk') return;

        panel.querySelectorAll('.featuredMega-shortcuts > li').forEach(function removeAutomaticShortcut(item) {
            if (!item.querySelector('[data-featured-facet]')) item.remove();
        });
    }

    function immediateFacetLinks(panel) {
        var categoryUrl = panel.getAttribute('data-category-url');
        var storeSuffix = currentStoreSuffix();

        panel.querySelectorAll('[data-featured-facet]').forEach(function prime(shortcut) {
            var ukFallback = storeSuffix === 'uk' ? ukLanding(shortcut) : null;
            var facetName = storeAttribute(shortcut, 'data-facet-name', storeSuffix);
            var facetValue = storeAttribute(shortcut, 'data-facet-value', storeSuffix);
            var storeHref = storeAttribute(shortcut, 'data-href', storeSuffix) || (ukFallback && ukFallback.href);

            applyStoreLabel(shortcut, storeSuffix);
            if (ukFallback) setShortcutLabel(shortcut, ukFallback.label);
            if (storeHref) {
                shortcut.href = absoluteUrl(storeHref, categoryUrl);
                return;
            }
            if (!facetName || !facetValue) return;

            try {
                var url = new URL(categoryUrl, window.location.href);
                url.search = '';
                url.searchParams.set('_bc_fsnf', '1');
                url.searchParams.set(facetName, facetValue);
                shortcut.href = url.href;
            } catch (error) {
                // Keep the safe category fallback if URL construction is unavailable.
            }
        });
    }

    function resolveFacetLinks(panel, doc, categoryUrl) {
        var available = Array.prototype.slice.call(doc.querySelectorAll('[data-faceted-search-facet]'));
        var storeSuffix = currentStoreSuffix();

        panel.querySelectorAll('[data-featured-facet]').forEach(function resolve(shortcut) {
            var ukFallback = storeSuffix === 'uk' ? ukLanding(shortcut) : null;
            var storeHref = storeAttribute(shortcut, 'data-href', storeSuffix) || (ukFallback && ukFallback.href);
            var desiredName = normalized(storeAttribute(shortcut, 'data-facet-name', storeSuffix));
            var desiredValue = normalized(storeAttribute(shortcut, 'data-facet-value', storeSuffix));
            var fallbackName = normalized(storeAttribute(shortcut, 'data-fallback-facet-name', storeSuffix));
            var requestedIndex = shortcut.getAttribute('data-facet-index');

            if (storeHref) {
                shortcut.href = absoluteUrl(storeHref, categoryUrl);
                applyStoreLabel(shortcut, storeSuffix);
                if (ukFallback) setShortcutLabel(shortcut, ukFallback.label);
                return;
            }
            function facetCandidates(facetName) {
                return available.filter(function findFacet(anchor) {
                var url;

                try {
                    url = new URL(anchor.getAttribute('href'), categoryUrl);
                } catch (error) {
                    return false;
                }

                return Array.prototype.slice.call(url.searchParams.entries()).some(function matchesFacet(entry) {
                    if (normalized(entry[0]) !== facetName) return false;
                    return requestedIndex !== null || normalized(entry[1]).indexOf(desiredValue) !== -1;
                });
            });
            }

            var candidates = facetCandidates(desiredName);
            if (!candidates.length && fallbackName) candidates = facetCandidates(fallbackName);
            var match = requestedIndex !== null ? candidates[parseInt(requestedIndex, 10)] : candidates[0];

            if (match) {
                shortcut.href = absoluteUrl(match.getAttribute('href'), categoryUrl);

                if (shortcut.hasAttribute('data-use-facet-label')) {
                    var label = match.textContent.trim().replace(/\s*\(\d+\)\s*$/, '');
                    var textNode = Array.prototype.slice.call(shortcut.childNodes).find(function findText(node) {
                        return node.nodeType === 3;
                    });
                    if (textNode && label) textNode.nodeValue = label + ' ';
                }
            }

            applyStoreLabel(shortcut, storeSuffix);
        });
    }

    function render(panel, products) {
        var target = panel.querySelector('[data-featured-mega-products]');
        var status = panel.querySelector('[data-featured-mega-status]');

        target.textContent = '';
        products.forEach(function appendProduct(product) {
            target.appendChild(makeProductCard(product));
        });

        if (status) {
            status.textContent = products.length ? '' : 'Browse the category to see available products.';
            status.hidden = products.length > 0;
        }
    }

    function productsFromMarkup(markup, categoryUrl, limit) {
        var doc = new DOMParser().parseFromString(markup, 'text/html');
        var cards = Array.prototype.slice.call(doc.querySelectorAll('.productGrid .product, .productGrid > li, [data-product-id] .card'));
        var products = [];

        cards.forEach(function collect(card) {
            if (products.length >= limit) return;
            var data = productData(card, categoryUrl);
            if (data && !products.some(function duplicate(item) { return item.href === data.href; })) products.push(data);
        });

        return { doc: doc, products: products };
    }

    function requestCategory(categoryUrl) {
        return window.fetch(categoryUrl, { credentials: 'same-origin' })
            .then(function responseText(response) {
                if (!response.ok) throw new Error('Category request failed');
                return response.text();
            });
    }

    function loadSubcategoryProducts(panel, sourceUrls) {
        return Promise.all(sourceUrls.slice(0, 3).map(function requestSource(sourceUrl) {
            return requestCategory(sourceUrl)
                .then(function firstProduct(markup) {
                    return productsFromMarkup(markup, sourceUrl, 1).products[0] || null;
                })
                .catch(function unavailableSource() {
                    return null;
                });
        })).then(function renderSources(products) {
            var uniqueProducts = products.filter(function validUnique(product, index, allProducts) {
                return product && allProducts.findIndex(function same(candidate) {
                    return candidate && candidate.href === product.href;
                }) === index;
            });

            panel.setAttribute('data-products-state', 'loaded');
            render(panel, uniqueProducts);
        });
    }

    function load(panel) {
        if (panel.getAttribute('data-products-state')) return;
        panel.setAttribute('data-products-state', 'loading');

        var categoryUrl = panel.getAttribute('data-category-url');
        var productSources = Array.prototype.slice.call(panel.querySelectorAll('[data-featured-product-source]'))
            .map(function sourceUrl(link) { return absoluteUrl(link.getAttribute('href'), window.location.href); })
            .filter(Boolean);

        if (productSources.length) {
            loadSubcategoryProducts(panel, productSources)
                .catch(function failedSources() {
                    panel.setAttribute('data-products-state', 'failed');
                    render(panel, []);
                });
            return;
        }

        requestCategory(categoryUrl)
            .then(function parseCategory(markup) {
                var parsed = productsFromMarkup(markup, categoryUrl, 3);

                resolveFacetLinks(panel, parsed.doc, categoryUrl);

                panel.setAttribute('data-products-state', 'loaded');
                render(panel, parsed.products);
            })
            .catch(function failed() {
                panel.setAttribute('data-products-state', 'failed');
                render(panel, []);
            });
    }

    function setExpanded(item, expanded) {
        var toggle = item.querySelector(':scope > .navPages-action');
        var panel = item.querySelector(':scope > [data-featured-mega]');

        if (!toggle || !panel) return;
        item.classList.toggle('hover', expanded && window.innerWidth > 800);
        item.classList.toggle('link-expanded', expanded && window.innerWidth <= 800);
        toggle.classList.toggle('is-open', expanded);
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        panel.classList.toggle('is-open', expanded);
        panel.setAttribute('aria-hidden', expanded ? 'false' : 'true');
        if (expanded) load(panel);
    }

    function clearTimers(item) {
        window.clearTimeout(item.featuredMegaOpenTimer);
        window.clearTimeout(item.featuredMegaCloseTimer);
    }

    function closeItem(item) {
        clearTimers(item);
        item.classList.remove('is-pinned');
        setExpanded(item, false);
    }

    function closeOthers(activeItem) {
        panels.forEach(function closeOther(panel) {
            var item = panel.closest('[data-featured-mega-item]');
            if (item && item !== activeItem) closeItem(item);
        });
    }

    function closeQuickSearch() {
        var quickSearch = document.querySelector('.quickSearchWrap');

        if (!quickSearch) return;
        Array.prototype.forEach.call(quickSearch.querySelectorAll('.quickSearchResults'), function hideResults(results) {
            results.style.display = 'none';
        });
        Array.prototype.forEach.call(quickSearch.querySelectorAll('[data-search-quick]'), function collapseInput(input) {
            input.setAttribute('aria-expanded', 'false');
            input.setAttribute('aria-activedescendant', '');
            if (document.activeElement === input) input.blur();
        });
    }

    function closeStandardMenus() {
        if (window.innerWidth <= 800) return;

        Array.prototype.forEach.call(document.querySelectorAll('.navPages-mainNav > .navPages-item:not([data-featured-mega-item])'), function closeStandard(item) {
            var rootToggle = item.querySelector(':scope > .navPages-action');
            var rootPanel = item.querySelector(':scope > .navPage-subMenu');

            item.classList.remove('hover', 'link-expanded');
            if (rootToggle) {
                rootToggle.classList.remove('is-open');
                rootToggle.setAttribute('aria-expanded', 'false');
            }
            if (rootPanel) {
                rootPanel.classList.remove('is-open');
                rootPanel.setAttribute('aria-hidden', 'true');
            }
        });
    }

    function prepareFeaturedOpen(activeItem) {
        closeOthers(activeItem);
        closeStandardMenus();
        closeQuickSearch();
    }

    panels.forEach(function prepare(panel) {
        var item = panel.closest('[data-featured-mega-item]');
        if (!item) return;

        hideUkAutomaticShortcuts(panel);
        immediateFacetLinks(panel);

        if (window.MutationObserver) {
            var mobileStateObserver = new MutationObserver(function mobileStateChanged() {
                if (window.innerWidth <= 800 && item.classList.contains('link-expanded')) {
                    setExpanded(item, true);
                }
            });

            mobileStateObserver.observe(item, { attributes: true, attributeFilter: ['class'] });
        }

        var toggle = item.querySelector(':scope > [data-featured-mega-toggle]');

        item.addEventListener('mouseenter', function enter() {
            if (window.innerWidth <= 800) return;
            window.clearTimeout(item.featuredMegaCloseTimer);
            item.featuredMegaOpenTimer = window.setTimeout(function delayedOpen() {
                prepareFeaturedOpen(item);
                setExpanded(item, true);
            }, 350);
        });

        item.addEventListener('mouseleave', function leave() {
            if (window.innerWidth <= 800) return;
            window.clearTimeout(item.featuredMegaOpenTimer);
            if (item.classList.contains('is-pinned')) return;
            item.featuredMegaCloseTimer = window.setTimeout(function delayedClose() {
                setExpanded(item, false);
            }, 300);
        });

        item.addEventListener('focusout', function focusOut(event) {
            if (window.innerWidth > 800
                && !item.contains(event.relatedTarget)
                && !item.classList.contains('is-pinned')) {
                setExpanded(item, false);
            }
        });

        if (toggle) {
            toggle.addEventListener('click', function toggleMenu(event) {
                event.preventDefault();
                clearTimers(item);

                var expanded = toggle.getAttribute('aria-expanded') === 'true';

                if (window.innerWidth > 800) {
                    if (expanded && item.classList.contains('is-pinned')) {
                        closeItem(item);
                        return;
                    }

                    prepareFeaturedOpen(item);
                    item.classList.add('is-pinned');
                    setExpanded(item, true);
                    return;
                }

                closeOthers(item);
                item.classList.remove('is-pinned');
                setExpanded(item, !expanded);
            });
        }
    });

    var quickSearch = document.querySelector('.quickSearchWrap');
    if (quickSearch) {
        quickSearch.addEventListener('focusin', function searchOpened() {
            if (window.innerWidth <= 800) return;
            closeOthers(null);
            closeStandardMenus();
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('.navPages-mainNav > .navPages-item:not([data-featured-mega-item])'), function coordinateStandardItem(item) {
        function standardMenuOpened() {
            if (window.innerWidth <= 800) return;
            closeOthers(null);
            closeQuickSearch();
        }

        item.addEventListener('mouseenter', standardMenuOpened);
        item.addEventListener('focusin', standardMenuOpened);
    });

    document.addEventListener('click', function closeOnOutsideClick(event) {
        if (event.target.closest('[data-featured-mega-item]')) return;
        panels.forEach(function close(panel) {
            var item = panel.closest('[data-featured-mega-item]');
            if (item) closeItem(item);
        });
    });

    var desktopMenuToggle = document.querySelector('.desktopMenu-toggle a');
    if (desktopMenuToggle) {
        desktopMenuToggle.addEventListener('click', function openFirstDesktopMega() {
            // This control is only actionable while the desktop header is compressed.
            // Let the native header controller expand the navigation first, then open
            // the first mega menu through this module's existing state management.
            if (window.innerWidth <= 800) return;

            window.requestAnimationFrame(function openAfterHeaderExpansion() {
                var firstItem = panels[0] && panels[0].closest('[data-featured-mega-item]');
                if (!firstItem) return;

                prepareFeaturedOpen(firstItem);
                firstItem.classList.add('is-pinned');
                setExpanded(firstItem, true);
            });
        });
    }

    var desktopHeader = document.querySelector('.header');
    if (desktopHeader && window.MutationObserver) {
        var headerStateObserver = new MutationObserver(function desktopHeaderStateChanged() {
            if (window.innerWidth <= 800 || !desktopHeader.classList.contains('slim')) return;
            panels.forEach(function closeForCompressedHeader(panel) {
                var item = panel.closest('[data-featured-mega-item]');
                if (item) closeItem(item);
            });
        });

        headerStateObserver.observe(desktopHeader, { attributes: true, attributeFilter: ['class'] });
    }

    var mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function preloadMobileProducts() {
            if (window.innerWidth <= 800) panels.forEach(load);
        }, { once: true });
    }

    document.addEventListener('keydown', function closeOnEscape(event) {
        if (event.key !== 'Escape') return;
        panels.forEach(function close(panel) {
            var item = panel.closest('[data-featured-mega-item]');
            if (!item) return;
            var toggle = item.querySelector(':scope > [data-featured-mega-toggle]');
            var containedFocus = item.contains(document.activeElement);
            closeItem(item);
            if (containedFocus && toggle) toggle.focus();
        });
    });
}());
