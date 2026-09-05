(function storefrontInteractions() {
    'use strict';

    function trackEvent(eventName, parameters) {
        window.dataLayer = window.dataLayer || [];

        function queueGtagCommand() {
            window.dataLayer.push(arguments);
        }

        queueGtagCommand('event', eventName, parameters || {});
    }

    function deviceType() {
        return window.innerWidth <= 800 ? 'mobile' : 'desktop';
    }

    function cleanText(element) {
        return element ? element.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function currentLanguage() {
        var match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/);
        var storedLanguage = '';

        try {
            storedLanguage = window.localStorage.getItem('solatubeLanguage') || '';
        } catch (error) {
            storedLanguage = '';
        }

        return match ? match[1] : (storedLanguage || 'en');
    }

    var lastLanguage = currentLanguage();
    var roofTypeHelpUsed = false;
    var roofCoveringHelpUsed = false;
    var roofTileTypeHelpUsed = false;

    function productContext() {
        var productId = document.querySelector('form[data-cart-item-add] input[name="product_id"]');
        var productName = document.querySelector('.productView-title');

        return {
            item_id: productId ? String(productId.value || '') : '',
            item_name: cleanText(productName),
            device_type: deviceType(),
            page_path: window.location.pathname
        };
    }

    function installRoofTypeHelp() {
        var modal = document.getElementById('modal-roof-type-guide');
        if (!modal) return;

        var draftRoofLabels = null;
        var draftTileRoof = null;

        function matchingRoofFlashingInput(field, labels) {
            var desiredLabels = labels.map(function normalizeDesiredLabel(label) {
                return label.toLowerCase().trim();
            });
            var matchedInput = null;

            field.querySelectorAll('input[type="radio"]').forEach(function findMatchingInput(input) {
                var label = field.querySelector('label[for="' + input.id + '"]');
                if (desiredLabels.indexOf(cleanText(label).toLowerCase()) !== -1) matchedInput = input;
            });

            return matchedInput;
        }

        function sameRoofChoice(labels) {
            return Boolean(
                draftRoofLabels
                && labels.length
                && draftRoofLabels[0].toLowerCase().trim() === labels[0].toLowerCase().trim()
            );
        }

        function selectedFlashingName() {
            return draftRoofLabels && draftRoofLabels.length ? draftRoofLabels[0].trim() : '';
        }

        function updateGuide() {
            var coveringStep = modal.querySelector('[data-roof-guide-step="covering"]');
            var summary = modal.querySelector('[data-roof-guide-summary]');
            var summaryFlashing = modal.querySelector('[data-roof-guide-summary-flashing]');
            var summaryTile = modal.querySelector('[data-roof-guide-summary-tile]');
            var applyButton = modal.querySelector('[data-roof-guide-apply]');
            var setupComplete = Boolean(draftRoofLabels && draftTileRoof !== null);

            modal.querySelectorAll('[data-roof-flashing-choice]').forEach(function syncFlashingChoice(choice) {
                var labels = (choice.getAttribute('data-roof-flashing-labels') || '').split('|');
                var selected = sameRoofChoice(labels);

                choice.classList.toggle('is-selected', selected);
                choice.setAttribute('aria-pressed', selected ? 'true' : 'false');
            });

            modal.querySelectorAll('[data-roof-tile-choice]').forEach(function syncTileChoice(choice) {
                var selected = (
                    (choice.getAttribute('data-roof-tile-choice') === 'tile' && draftTileRoof === true)
                    || (choice.getAttribute('data-roof-tile-choice') === 'standard' && draftTileRoof === false)
                );

                choice.classList.toggle('is-selected', selected);
                choice.setAttribute('aria-pressed', selected ? 'true' : 'false');
            });

            if (coveringStep) coveringStep.hidden = !draftRoofLabels;
            if (summary) summary.hidden = !setupComplete;
            if (applyButton) applyButton.disabled = !setupComplete;

            if (setupComplete) {
                summaryFlashing.textContent = selectedFlashingName() + ' — included with your skylight';
                summaryTile.textContent = draftTileRoof
                    ? 'Universal Tile Flashing — required add-on selected below'
                    : 'Universal Tile Flashing — not needed';
            }
        }

        function initializeGuide() {
            var field = document.querySelector('.productView-options [data-roof-type-option]');
            if (!field) return;

            draftRoofLabels = null;
            modal.querySelectorAll('[data-roof-flashing-choice]').forEach(function findCurrentFlashing(choice) {
                var labels = (choice.getAttribute('data-roof-flashing-labels') || '').split('|');
                var input = matchingRoofFlashingInput(field, labels);
                if (input && input.checked) draftRoofLabels = labels;
            });

            draftTileRoof = typeof window.solatubeTileFlashingSelected === 'boolean'
                ? window.solatubeTileFlashingSelected
                : null;
            updateGuide();
        }

        function updateTileRoofNotice(field, selected) {
            var notice = document.querySelector('[data-roof-tile-selection-notice]');

            if (!selected) {
                if (notice) notice.remove();
                return;
            }

            if (!notice) {
                notice = document.createElement('p');
                notice.className = 'roofTileSelectionNotice';
                notice.setAttribute('data-roof-tile-selection-notice', '');
                field.insertAdjacentElement('afterend', notice);
            }

            notice.innerHTML = '<strong>Tile roof setup:</strong> Universal Tile Flashing has been selected under Complete Your Skylight Kit.';
        }

        document.querySelectorAll('.productView-options [data-roof-type-option]').forEach(function addHelpTrigger(field) {
            if (field.closest('.modal') || field.querySelector('[data-roof-type-help-trigger]')) return;

            var heading = field.querySelector(':scope > .form-label--alternate');
            if (!heading) return;

            var trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'roofTypeHelp-trigger';
            trigger.setAttribute('data-roof-type-help-trigger', '');
            trigger.setAttribute('data-reveal-id', 'modal-roof-type-guide');
            trigger.setAttribute('aria-haspopup', 'dialog');
            trigger.setAttribute('aria-controls', 'modal-roof-type-guide');

            var icon = document.createElement('span');
            icon.className = 'roofTypeHelp-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = '?';

            var text = document.createElement('span');
            text.className = 'roofTypeHelp-text';
            text.textContent = cleanText(heading).indexOf('Roof Flashing') !== -1
                ? 'Which roof flashing do I need?'
                : 'Which roof type do I have?';

            trigger.appendChild(icon);
            trigger.appendChild(text);
            trigger.addEventListener('click', initializeGuide);

            field.classList.add('roofTypeHelp-field');
            field.appendChild(trigger);
        });

        modal.querySelectorAll('[data-roof-flashing-choice]').forEach(function bindFlashingChoice(choice) {
            if (choice.hasAttribute('data-roof-flashing-bound')) return;

            choice.setAttribute('data-roof-flashing-bound', '');
            choice.addEventListener('click', function chooseRoofFlashing() {
                draftRoofLabels = (choice.getAttribute('data-roof-flashing-labels') || '').split('|');
                updateGuide();
            });
        });

        modal.querySelectorAll('[data-roof-tile-choice]').forEach(function bindTileChoice(choice) {
            choice.addEventListener('click', function chooseRoofCovering() {
                draftTileRoof = choice.getAttribute('data-roof-tile-choice') === 'tile';
                updateGuide();
            });
        });

        var applyButton = modal.querySelector('[data-roof-guide-apply]');
        if (applyButton) {
            applyButton.addEventListener('click', function applyRoofSetup() {
                var field = document.querySelector('.productView-options [data-roof-type-option]');
                var input = field && draftRoofLabels && matchingRoofFlashingInput(field, draftRoofLabels);
                if (!field || !input || draftTileRoof === null) return;

                if (!input.checked) input.click();

                window.solatubeTileFlashingSelected = draftTileRoof;
                document.dispatchEvent(new CustomEvent('solatube:tile-flashing-choice', {
                    detail: {
                        selected: draftTileRoof,
                        roofPitch: /little|flat|no-pitch/i.test(selectedFlashingName())
                            ? 'little-to-no-pitch'
                            : 'pitched'
                    }
                }));
                updateTileRoofNotice(field, draftTileRoof);

                var closeButton = modal.querySelector('.modal-close');
                if (closeButton) closeButton.click();
            });
        }

        modal.addEventListener('open.fndtn.reveal', initializeGuide);
        updateGuide();
    }

    function installRoofCoveringHelp() {
        var modal = document.getElementById('modal-roof-covering-guide');
        if (!modal) return;

        document.querySelectorAll('.productView-options [data-roof-covering-option]').forEach(function addHelpTrigger(field) {
            if (field.closest('.modal') || field.querySelector('[data-roof-covering-help-trigger]')) return;

            var heading = field.querySelector(':scope > .form-label--alternate');
            if (!heading) return;

            var trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'roofTypeHelp-trigger';
            trigger.setAttribute('data-roof-covering-help-trigger', '');
            trigger.setAttribute('data-reveal-id', 'modal-roof-covering-guide');
            trigger.setAttribute('aria-haspopup', 'dialog');
            trigger.setAttribute('aria-controls', 'modal-roof-covering-guide');

            var icon = document.createElement('span');
            icon.className = 'roofTypeHelp-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = '?';

            var text = document.createElement('span');
            text.className = 'roofTypeHelp-text';
            text.textContent = 'Which roof covering do I have?';

            trigger.appendChild(icon);
            trigger.appendChild(text);

            field.classList.add('roofTypeHelp-field');
            heading.insertAdjacentElement('afterend', trigger);
        });
    }

    function installRoofTileTypeHelp() {
        var modal = document.getElementById('modal-roof-tile-type-guide');
        if (!modal) return;

        document.querySelectorAll('.productView-options [data-roof-tile-type-option]').forEach(function addHelpTrigger(field) {
            if (field.closest('.modal') || field.querySelector('[data-roof-tile-type-help-trigger]')) return;

            var heading = field.querySelector(':scope > .form-label--alternate');
            if (!heading) return;

            var trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'roofTypeHelp-trigger';
            trigger.setAttribute('data-roof-tile-type-help-trigger', '');
            trigger.setAttribute('data-reveal-id', 'modal-roof-tile-type-guide');
            trigger.setAttribute('aria-haspopup', 'dialog');
            trigger.setAttribute('aria-controls', 'modal-roof-tile-type-guide');

            var icon = document.createElement('span');
            icon.className = 'roofTypeHelp-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = '?';

            var text = document.createElement('span');
            text.className = 'roofTypeHelp-text';
            text.textContent = 'Which roof tile type do I have?';

            trigger.appendChild(icon);
            trigger.appendChild(text);

            field.classList.add('roofTypeHelp-field');
            heading.insertAdjacentElement('afterend', trigger);
        });
    }

    function installProductIdentifierSync() {
        var sources = {
            sku: document.querySelector('.productView [data-product-sku]'),
            upc: document.querySelector('.productView [data-product-upc]')
        };

        function syncIdentifier(type) {
            var source = sources[type];
            var displays = document.querySelectorAll('[data-product-' + type + '-display]');
            if (!source || !displays.length) return;

            var value = cleanText(source);
            displays.forEach(function updateDisplay(display) {
                var row = display.closest('[data-product-identifier-row]');
                display.textContent = value;
                if (row) row.hidden = !value;
            });
        }

        Object.keys(sources).forEach(function watchIdentifier(type) {
            var source = sources[type];
            if (!source) return;

            syncIdentifier(type);
            new MutationObserver(function identifierChanged() {
                syncIdentifier(type);
            }).observe(source, { childList: true, characterData: true, subtree: true });
        });
    }

    function installSpaceSizeHelp() {
        function closeSpaceSizeHelp(except) {
            document.querySelectorAll('[data-space-size-help][aria-expanded="true"]').forEach(function closeHelp(trigger) {
                if (trigger === except) return;

                var help = trigger.closest('.spaceSizeHelp');
                var tooltip = help && help.querySelector('.spaceSizeHelp-tooltip');

                trigger.setAttribute('aria-expanded', 'false');
                if (tooltip) tooltip.hidden = true;
            });
        }

        document.addEventListener('click', function toggleSpaceSizeHelp(event) {
            var trigger = event.target.closest('[data-space-size-help]');

            if (trigger) {
                var help = trigger.closest('.spaceSizeHelp');
                var tooltip = help && help.querySelector('.spaceSizeHelp-tooltip');
                var willOpen = trigger.getAttribute('aria-expanded') !== 'true';

                event.stopPropagation();
                closeSpaceSizeHelp(trigger);
                trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
                if (tooltip) tooltip.hidden = !willOpen;
                return;
            }

            if (!event.target.closest('.spaceSizeHelp')) closeSpaceSizeHelp();
        }, true);

        document.addEventListener('keydown', function closeSpaceSizeHelpOnEscape(event) {
            if (event.key !== 'Escape') return;

            var openTrigger = document.querySelector('[data-space-size-help][aria-expanded="true"]');
            closeSpaceSizeHelp();
            if (openTrigger) openTrigger.focus();
        });
    }

    // Own the featured product-menu arrow interaction on mobile. Capture mode
    // prevents the theme's two legacy handlers from toggling the same item.
    document.addEventListener('click', function mobileProductMenu(event) {
        if (window.innerWidth > 800) return;

        var icon = event.target.closest('.featuredMega-item > .navPages-action .navPages-action-moreIcon');
        if (!icon) return;

        var item = icon.closest('.featuredMega-item');
        var toggle = item && item.querySelector(':scope > .navPages-action');
        var panel = item && item.querySelector(':scope > [data-featured-mega]');

        // The dedicated mega-menu controller owns the newer full-width
        // disclosure buttons; retain this fallback only for legacy anchors.
        if (toggle && toggle.hasAttribute('data-featured-mega-toggle')) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        if (!item || !toggle || !panel) return;

        var currentlyExpanded = (
            item.classList.contains('link-expanded')
            || toggle.classList.contains('is-open')
            || panel.classList.contains('is-open')
            || toggle.getAttribute('aria-expanded') === 'true'
            || window.getComputedStyle(panel).display !== 'none'
        );
        var expanded = !currentlyExpanded;

        item.classList.toggle('link-expanded', expanded);
        item.classList.remove('hover');
        toggle.classList.toggle('is-open', expanded);
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        panel.classList.toggle('is-open', expanded);
        panel.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    }, true);

    document.addEventListener('click', function analyticsClick(event) {
        var roofTypeHelp = event.target.closest('[data-roof-type-help-trigger]');
        if (roofTypeHelp) {
            roofTypeHelpUsed = true;
            trackEvent('roof_type_help_open', productContext());
        }

        var roofCoveringHelp = event.target.closest('[data-roof-covering-help-trigger]');
        if (roofCoveringHelp) {
            roofCoveringHelpUsed = true;
            trackEvent('roof_covering_help_open', productContext());
        }

        var roofTileTypeHelp = event.target.closest('[data-roof-tile-type-help-trigger]');
        if (roofTileTypeHelp) {
            roofTileTypeHelpUsed = true;
            trackEvent('roof_tile_type_help_open', productContext());
        }

        var filter = event.target.closest('[data-faceted-search-facet]');
        if (filter) {
            var facet = filter.closest('[data-facet]');
            var accordion = filter.closest('.accordion-block');
            var facetTitle = accordion && accordion.querySelector('.accordion-title');

            trackEvent('filter_applied', {
                filter_action: filter.classList.contains('is-selected') ? 'removed' : 'applied',
                filter_name: (facet && facet.getAttribute('data-facet')) || cleanText(facetTitle) || 'unknown',
                filter_value: cleanText(filter),
                page_path: window.location.pathname
            });
        }

        var quickView = event.target.closest('.quickview');
        if (quickView) {
            var card = quickView.closest('[data-entity-id]');
            var list = quickView.closest('[data-list-name]');

            trackEvent('quick_view_open', {
                item_id: String(quickView.getAttribute('data-product-id') || (card && card.getAttribute('data-entity-id')) || ''),
                item_name: (card && card.getAttribute('data-name')) || cleanText(card && card.querySelector('.card-title')),
                item_list_name: (list && list.getAttribute('data-list-name')) || '',
                device_type: deviceType(),
                page_path: window.location.pathname
            });
        }

        var languageButton = event.target.closest('[data-translate-language]');
        if (languageButton) {
            var selectedLanguage = languageButton.getAttribute('data-translate-language') || 'en';
            if (selectedLanguage !== lastLanguage) {
                trackEvent('language_change', {
                    language_from: lastLanguage,
                    language_to: selectedLanguage,
                    selector_type: 'language_menu',
                    page_path: window.location.pathname
                });
                lastLanguage = selectedLanguage;
            }
        }

        var link = event.target.closest('.navPages a[href]');
        if (!link || event.target.closest('.navPages-action-moreIcon')) return;

        var linkUrl = link.getAttribute('href');
        if (!linkUrl || linkUrl === '#' || linkUrl.indexOf('javascript:') === 0) return;

        var mainMenu = link.closest('.navPages-mainNav');
        var linkClone = link.cloneNode(true);
        Array.prototype.forEach.call(linkClone.children, function removeChild(child) { child.remove(); });

        trackEvent('navigation_click', {
            link_text: cleanText(linkClone),
            link_url: linkUrl,
            menu_name: mainMenu ? 'main_navigation' : 'utility_navigation',
            device_type: deviceType(),
            page_path: window.location.pathname
        });
    }, true);

    document.addEventListener('change', function nativeLanguageChange(event) {
        var roofTypeField = event.target.closest('[data-roof-type-option]');
        if (roofTypeField && event.target.matches('input[type="radio"]') && event.isTrusted) {
            var roofTypeParameters = productContext();
            var roofTypeLabel = roofTypeField.querySelector('label[for="' + event.target.id + '"]');

            roofTypeParameters.roof_type = cleanText(roofTypeLabel) || String(event.target.value || '');
            roofTypeParameters.help_used = roofTypeHelpUsed;
            trackEvent('roof_type_selected', roofTypeParameters);
        }

        var roofCoveringField = event.target.closest('[data-roof-covering-option]');
        if (roofCoveringField && event.target.matches('input[type="radio"]') && event.isTrusted) {
            var roofCoveringParameters = productContext();
            var roofCoveringLabel = roofCoveringField.querySelector('label[for="' + event.target.id + '"]');

            roofCoveringParameters.roof_covering = cleanText(roofCoveringLabel) || String(event.target.value || '');
            roofCoveringParameters.help_used = roofCoveringHelpUsed;
            trackEvent('roof_covering_selected', roofCoveringParameters);
        }

        var roofTileTypeField = event.target.closest('[data-roof-tile-type-option]');
        if (roofTileTypeField && event.target.matches('input[type="radio"]') && event.isTrusted) {
            var roofTileTypeParameters = productContext();
            var roofTileTypeLabel = roofTileTypeField.querySelector('label[for="' + event.target.id + '"]');

            roofTileTypeParameters.roof_tile_type = cleanText(roofTileTypeLabel) || String(event.target.value || '');
            roofTileTypeParameters.help_used = roofTileTypeHelpUsed;
            trackEvent('roof_tile_type_selected', roofTileTypeParameters);
        }

        if (!event.target.matches('#google_translate_element select.goog-te-combo')) return;

        var selectedLanguage = event.target.value || 'en';
        if (selectedLanguage === lastLanguage) return;

        trackEvent('language_change', {
            language_from: lastLanguage,
            language_to: selectedLanguage,
            selector_type: 'mobile_native_selector',
            page_path: window.location.pathname
        });
        lastLanguage = selectedLanguage;
    }, true);

    document.addEventListener('submit', function priceFilter(event) {
        var form = event.target.closest('[data-faceted-search-range]');
        if (!form) return;

        var minimum = form.querySelector('[name="min_price"]');
        var maximum = form.querySelector('[name="max_price"]');

        trackEvent('filter_applied', {
            filter_action: 'applied',
            filter_name: 'price',
            filter_value: (minimum ? minimum.value : '') + '-' + (maximum ? maximum.value : ''),
            page_path: window.location.pathname
        });
    }, true);

    installRoofTypeHelp();
    installRoofCoveringHelp();
    installRoofTileTypeHelp();
    installProductIdentifierSync();
    installSpaceSizeHelp();
}());
