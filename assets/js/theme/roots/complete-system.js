import utils from '@bigcommerce/stencil-utils';
import { normalizeFormData } from '../common/utils/api';

const STOREFRONT_MARKETS = {
    'solatubeshop.ca': 'ca',
    'shop.solatube.com': 'us',
};

// These six product IDs are shared by the Canada and USA catalogs. Product
// rendering and variant prices still come from the current storefront.
const NORTH_AMERICAN_ACCESSORIES = [
    {
        productId: 20,
        type: 'extensionTube',
        name: '20 in. Extension Tube',
        description: 'Adds 20 inches of highly reflective tubing for installations with a greater distance between the roof and ceiling. You can add more than one tube.',
        quantity: true,
    },
    {
        productId: 57,
        type: 'nightLight',
        name: 'Solar NightLight',
        description: 'Adds a soft, solar-powered glow after dark without electrical wiring. Useful for hallways, bathrooms and other spaces that need gentle nighttime visibility.',
    },
    {
        productId: 24,
        type: 'electricLight',
        name: 'Electric Light Add-On',
        description: 'Adds an electric light so the same ceiling fixture can provide illumination after dark. The correct 160 or 290 model is matched to your skylight.',
    },
    {
        productId: 42,
        type: 'dimmer',
        name: 'Daylight Dimmer',
        description: 'Lets you reduce or restore the amount of daylight entering the room using the included remote control.',
    },
    {
        productId: 25,
        type: 'tileFlashing',
        name: 'Universal Tile Flashing',
        description: 'Required for tile roofs. It works with the selected base flashing and is matched to the 160 or 290 skylight tube diameter.',
    },
    {
        productId: 21,
        type: 'angleTube',
        name: 'Adjustable Angle Extension Tube',
        description: 'Adds an adjustable 0–90° bend when the roof opening and ceiling opening do not line up. The correct 160 or 290 model is matched to your skylight.',
        quantity: true,
    },
];

const CATALOG = {
    ca: NORTH_AMERICAN_ACCESSORIES,
    us: NORTH_AMERICAN_ACCESSORIES,
};

function analyticsAccessory(item) {
    if (!item) return {};

    const quantity = Number(item.querySelector('[data-complete-system-qty]')?.value || 1);
    const price = Number(item.querySelector('[data-complete-system-price]')?.dataset.priceValue);
    const accessory = {
        accessory_item_id: String(item.dataset.productId || ''),
        accessory_item_name: item.querySelector('.completeSystem-name, [data-complete-system-detail-name]')?.textContent.trim() || '',
        quantity: Number.isFinite(quantity) ? quantity : 1,
    };

    if (Number.isFinite(price)) {
        accessory.accessory_price = price;
        accessory.value = price * accessory.quantity;
    }

    return accessory;
}

function trackAccessoryEvent(eventName, root, item, details = {}) {
    window.dataLayer = window.dataLayer || [];
    const parameters = Object.assign({
        parent_item_id: String(root.dataset.parentProductId || ''),
        parent_item_sku: root.dataset.parentProductSku || '',
        parent_item_name: root.dataset.parentProductName || '',
        currency: root.dataset.currencyCode || 'USD',
        device_type: window.innerWidth <= 800 ? 'mobile' : 'desktop',
        page_path: window.location.pathname,
    }, analyticsAccessory(item), details);

    function queueGtagCommand() {
        window.dataLayer.push(arguments);
    }

    queueGtagCommand('event', eventName, parameters);
}

function selectionAnalytics(items) {
    return items.reduce((summary, item) => {
        const accessory = analyticsAccessory(item);
        summary.accessory_count += accessory.quantity || 1;
        if (Number.isFinite(accessory.value)) summary.value += accessory.value;
        return summary;
    }, { accessory_count: 0, value: 0 });
}

function marketFromRoot(root) {
    const host = window.location.hostname.toLowerCase().replace(/^www\./, '');
    const storeName = (root.dataset.storeName || '').toLowerCase();
    const canonical = document.querySelector('link[rel="canonical"]');
    let canonicalHost = '';

    if (canonical && canonical.href) {
        try {
            canonicalHost = new URL(canonical.href).hostname.toLowerCase().replace(/^www\./, '');
        } catch (error) {
            canonicalHost = '';
        }
    }

    return STOREFRONT_MARKETS[host]
        || STOREFRONT_MARKETS[canonicalHost]
        || (storeName.indexOf('canada') !== -1 ? 'ca' : null);
}

function isSolatubeSkylight(root) {
    const categoryContext = `${root.dataset.parentProductCategories || ''}|${root.dataset.parentProductBreadcrumbs || ''}`
        .toLowerCase();

    return categoryContext.indexOf('solatube skylight') !== -1;
}

function parentProductContext(root) {
    return [
        root.dataset.parentProductName,
        root.dataset.parentProductSku,
        root.dataset.parentProductCategories,
        root.dataset.parentProductBreadcrumbs,
    ].join('|').toLowerCase();
}

function systemSeries(root) {
    const context = `${root.dataset.parentProductSeries || ''}|${parentProductContext(root)}`;

    if (/\b(290|350\s*mm|35\s*cm)\b|14\s*(?:inch|in\.?|["”])/.test(context)) return '290';
    if (/\b(160|250\s*mm|25\s*cm)\b|10\s*(?:inch|in\.?|["”])/.test(context)) return '160';

    return null;
}

function includesNightLight(root) {
    const explicitValue = (root.dataset.parentProductHasNightlight || '').trim().toLowerCase();
    const context = parentProductContext(root);

    if (/^(yes|true|included)$/.test(explicitValue)) return true;

    return /integrated[\s-]*(?:solar[\s-]*)?night[\s-]*light|integrated[\s-]*nightlight|\b(?:160|290)\s*isn\b|nightlight[\s-]*kit/.test(context);
}

function compatibleDefinitions(root, definitions) {
    const hasNightLight = includesNightLight(root);

    return definitions.filter(definition => !(hasNightLight && definition.type === 'nightLight'));
}

function compatibleValue(field, series, roofPitch) {
    const choices = Array.prototype.slice.call(field.querySelectorAll('option, input[type="radio"]'));
    const labelFor = choice => {
        if (choice.tagName === 'OPTION') return choice.textContent.trim().toLowerCase();

        const label = field.querySelector(`label[for="${choice.id}"]`);
        return label ? label.textContent.trim().toLowerCase() : '';
    };
    const usable = choices.filter(choice => String(choice.value || '').trim() !== '');
    const seriesPattern = series === '290'
        ? /14\s*(inch|in\.)|290\s*models|350\s*mm|35\s*cm/
        : /10\s*(inch|in\.)|160\s*models|250\s*mm|25\s*cm/;
    const systemValue = usable.find(choice => seriesPattern.test(labelFor(choice)));
    const roofPitchValue = usable.find(choice => {
        const label = labelFor(choice);

        return roofPitch === 'little-to-no-pitch'
            ? /flat|little[\s-]*to[\s-]*no|no[\s-]*pitch/.test(label)
            : /sloped[\s/-]*pitched|^pitched|pitched roof/.test(label);
    });
    const noValue = usable.find(choice => /^(no|none)$/.test(labelFor(choice)));

    return systemValue || roofPitchValue || noValue || (usable.length === 1 ? usable[0] : null);
}

function selectCompatibleOptions(item, series, roofPitch) {
    const form = item.querySelector('[data-complete-system-form]');
    const fields = Array.prototype.slice.call(form.querySelectorAll('[data-product-attribute]'));
    let valid = true;

    fields.forEach(field => {
        const choice = compatibleValue(field, series, roofPitch);

        if (!choice) {
            valid = false;
            return;
        }

        if (choice.tagName === 'OPTION') {
            choice.selected = true;
        } else {
            choice.checked = true;
        }
    });

    return valid;
}

function formattedPrice(price) {
    if (!price) return null;
    if (price.with_tax) return price.with_tax;
    if (price.without_tax) return price.without_tax;

    return null;
}

function updateItemPrice(item, price) {
    const activePrice = formattedPrice(price);
    if (!activePrice) return;

    const priceNode = item.querySelector('[data-complete-system-price]');
    priceNode.textContent = activePrice.formatted;
    priceNode.dataset.priceValue = activePrice.value;
}

function resolveVariant(item, series, roofPitch) {
    return new Promise(resolve => {
        const form = item.querySelector('[data-complete-system-form]');
        const productId = form.querySelector('[name="product_id"]').value;
        const hasOptions = form.querySelector('[data-product-attribute]');

        if (!hasOptions) {
            resolve(true);
            return;
        }

        if (!selectCompatibleOptions(item, series, roofPitch)) {
            resolve(false);
            return;
        }

        utils.api.productAttributes.optionChange(
            productId,
            $(form).serialize(),
            'products/bulk-discount-rates',
            (err, response) => {
                if (err || !response || !response.data) {
                    resolve(false);
                    return;
                }

                updateItemPrice(item, response.data.price);
                resolve(response.data.purchasable !== false && response.data.instock !== false);
            },
        );
    });
}

function renderAccessory(definition, series, roofPitch) {
    return new Promise((resolve, reject) => {
        utils.api.product.getById(
            definition.productId,
            { template: 'products/complete-system-item' },
            async (err, html) => {
                if (err || !html) {
                    reject(err || new Error('Accessory unavailable'));
                    return;
                }

                const holder = document.createElement('div');
                holder.innerHTML = html;
                const item = holder.firstElementChild;

                if (!item) {
                    reject(new Error('Accessory unavailable'));
                    return;
                }

                item.dataset.completeSystemType = definition.type;
                if (definition.conditional) item.hidden = true;

                const name = item.querySelector('.completeSystem-name');
                const checkbox = item.querySelector('[data-complete-system-checkbox]');
                name.textContent = definition.name;
                checkbox.setAttribute('aria-label', `Add ${definition.name}`);
                item.querySelector('[data-complete-system-detail-name]').textContent = definition.name;
                item.querySelector('[data-complete-system-description-text]').textContent = definition.description;
                Array.prototype.slice.call(item.querySelectorAll('[data-complete-system-details]')).forEach(trigger => {
                    if (trigger.classList.contains('completeSystem-media')) {
                        trigger.setAttribute('aria-label', `View details for ${definition.name}`);
                    }
                });
                const expandImage = item.querySelector('[data-complete-system-image-expand]');
                const dialogImage = item.querySelector('.completeSystem-dialogImage');
                if (expandImage) expandImage.setAttribute('aria-label', `View a full-screen image of ${definition.name}`);
                if (dialogImage) dialogImage.alt = definition.name;

                const quantity = item.querySelector('[data-complete-system-quantity]');
                if (definition.quantity && quantity) quantity.hidden = false;

                const isAvailable = await resolveVariant(item, series, roofPitch);
                checkbox.disabled = !isAvailable;

                if (!isAvailable) {
                    item.classList.add('is-unavailable');
                    item.querySelector('[data-complete-system-price]').textContent = 'Unavailable';
                }

                resolve(item);
            },
        );
    });
}

function selectedItems(root) {
    return Array.prototype.slice.call(root.querySelectorAll('[data-complete-system-item]'))
        .filter(item => {
            const checkbox = item.querySelector('[data-complete-system-checkbox]');
            return checkbox && checkbox.checked && !checkbox.disabled;
        });
}

function availableAccessoryCount(root) {
    return Array.prototype.slice.call(root.querySelectorAll('[data-complete-system-item]'))
        .filter(item => {
            const checkbox = item.querySelector('[data-complete-system-checkbox]');

            return !item.hidden && checkbox && !checkbox.disabled;
        }).length;
}

function updateDisclosureLabel(root) {
    const toggle = root.querySelector('[data-complete-system-toggle]');
    const label = root.querySelector('[data-complete-system-toggle-label]');
    if (!toggle || !label) return;

    const count = availableAccessoryCount(root);
    const expanded = toggle.getAttribute('aria-expanded') === 'true';

    if (root.classList.contains('is-loading')) {
        label.textContent = 'Loading accessories…';
    } else if (!count) {
        label.textContent = 'Accessories unavailable';
    } else if (expanded) {
        label.textContent = 'Hide accessories';
    } else {
        label.textContent = `View ${count} optional ${count === 1 ? 'extra' : 'extras'}`;
    }
}

function setDisclosure(root, expanded) {
    const toggle = root.querySelector('[data-complete-system-toggle]');
    const panel = root.querySelector('[data-complete-system-panel]');
    if (!toggle || !panel) return;

    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    panel.hidden = !expanded;
    updateDisclosureLabel(root);
}

function installDisclosure(root) {
    const toggle = root.querySelector('[data-complete-system-toggle]');
    if (!toggle) return;

    setDisclosure(root, false);
    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') !== 'true';
        setDisclosure(root, expanded);
        trackAccessoryEvent('pdp_accessory_panel_toggle', root, null, { panel_state: expanded ? 'expanded' : 'collapsed' });
    });
}

function currencyFormatter(root) {
    const isUSA = marketFromRoot(root) === 'us';
    const currency = root.dataset.currencyCode || (isUSA ? 'USD' : 'CAD');

    try {
        return new Intl.NumberFormat(document.documentElement.lang || (isUSA ? 'en-US' : 'en-CA'), {
            style: 'currency',
            currency,
        });
    } catch (error) {
        return { format: value => `${currency} ${value.toFixed(2)}` };
    }
}

function updateSummary(root) {
    const items = selectedItems(root);
    const summary = root.querySelector('[data-complete-system-summary]');
    const totalNode = root.querySelector('[data-complete-system-total]');
    const addButton = document.querySelector('#form-action-addToCart');
    let total = 0;

    Array.prototype.slice.call(root.querySelectorAll('[data-complete-system-item]')).forEach(item => {
        const checkbox = item.querySelector('[data-complete-system-checkbox]');
        item.classList.toggle('is-selected', checkbox.checked && !checkbox.disabled);
    });

    items.forEach(item => {
        const price = parseFloat(item.querySelector('[data-complete-system-price]').dataset.priceValue || 0);
        const quantity = parseInt(item.querySelector('[data-complete-system-qty]')?.value || 1, 10);
        total += price * quantity;
    });

    if (!summary || !totalNode) return;

    summary.hidden = items.length === 0;
    totalNode.textContent = items.length ? `+${currencyFormatter(root).format(total)}` : '';

    if (addButton) {
        if (!addButton.dataset.completeSystemBaseLabel) {
            addButton.dataset.completeSystemBaseLabel = addButton.value;
        }

        addButton.value = items.length
            ? `ADD SYSTEM + ${items.length} ${items.length === 1 ? 'EXTRA' : 'EXTRAS'} TO CART`
            : addButton.dataset.completeSystemBaseLabel;
    }
}

function addForm(form) {
    return new Promise((resolve, reject) => {
        utils.api.cart.itemAdd(normalizeFormData(new FormData(form)), (err, response) => {
            const errorMessage = err || (response && response.data && response.data.error);

            if (errorMessage) {
                reject(errorMessage);
                return;
            }

            resolve(response);
        });
    });
}

function installCartBridge(root) {
    window.solatubeCompleteSystem = {
        hasSelected() {
            return selectedItems(root).length > 0;
        },

        addSelected(callback) {
            const items = selectedItems(root);
            const status = root.querySelector('[data-complete-system-status]');
            const selection = selectionAnalytics(items);
            let lastResponse = null;

            items.reduce((chain, item, index) => chain.then(() => {
                const quantity = item.querySelector('[data-complete-system-qty]');
                const formQuantity = item.querySelector('[data-complete-system-form-qty]');
                const form = item.querySelector('[data-complete-system-form]');

                formQuantity.value = quantity ? quantity.value : 1;
                status.textContent = `Adding accessory ${index + 1} of ${items.length}…`;

                return addForm(form).then(response => {
                    lastResponse = response;
                });
            }), Promise.resolve())
                .then(() => {
                    status.textContent = '';
                    trackAccessoryEvent('pdp_accessory_add_result', root, null, Object.assign({ result: 'success' }, selection));
                    callback(null, lastResponse);
                })
                .catch(error => {
                    status.textContent = '';
                    trackAccessoryEvent('pdp_accessory_add_result', root, null, Object.assign({ result: 'failure' }, selection));
                    callback(error, lastResponse);
                });
        },
    };
}

function installDetailsDialogs(root) {
    const lightbox = document.createElement('div');
    let activeItem = null;
    let activeTrigger = null;
    let activeImageTrigger = null;
    let lockedScrollY = 0;
    let previousPageStyles = null;

    const lockPageScroll = () => {
        if (previousPageStyles) return;

        const page = document.documentElement;
        const body = document.body;
        lockedScrollY = window.pageYOffset || page.scrollTop || 0;
        previousPageStyles = {
            htmlOverflow: page.style.overflow,
            bodyOverflow: body.style.overflow,
            bodyPosition: body.style.position,
            bodyTop: body.style.top,
            bodyLeft: body.style.left,
            bodyRight: body.style.right,
            bodyWidth: body.style.width,
        };

        // The theme scrolls the html element on desktop, while mobile browsers can
        // continue moving the viewport when only body overflow is hidden. Lock both
        // roots and pin the body so the PDP cannot move behind the accessory dialog.
        page.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${lockedScrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';
    };

    const unlockPageScroll = () => {
        if (!previousPageStyles) return;

        const page = document.documentElement;
        const body = document.body;
        page.style.overflow = previousPageStyles.htmlOverflow;
        body.style.overflow = previousPageStyles.bodyOverflow;
        body.style.position = previousPageStyles.bodyPosition;
        body.style.top = previousPageStyles.bodyTop;
        body.style.left = previousPageStyles.bodyLeft;
        body.style.right = previousPageStyles.bodyRight;
        body.style.width = previousPageStyles.bodyWidth;
        previousPageStyles = null;
        window.scrollTo(0, lockedScrollY);
    };

    lightbox.className = 'completeSystem-imageLightbox';
    lightbox.hidden = true;
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Full-screen accessory image');
    lightbox.innerHTML = [
        '<button class="completeSystem-imageLightboxClose" type="button" aria-label="Close full-screen accessory image">&times;</button>',
        '<img class="completeSystem-imageLightboxImage" alt="">',
    ].join('');
    document.body.appendChild(lightbox);

    const lightboxClose = lightbox.querySelector('.completeSystem-imageLightboxClose');
    const lightboxImage = lightbox.querySelector('.completeSystem-imageLightboxImage');

    const setExpanded = (item, expanded) => {
        Array.prototype.slice.call(item.querySelectorAll('[data-complete-system-details]')).forEach(trigger => {
            trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
    };

    const closeImageLightbox = restoreFocus => {
        if (lightbox.hidden) return;
        lightbox.hidden = true;
        lightboxImage.removeAttribute('src');
        if (restoreFocus !== false && activeImageTrigger && activeImageTrigger.focus) activeImageTrigger.focus();
        activeImageTrigger = null;
    };

    const closeDialog = restoreFocus => {
        if (!activeItem) return;
        closeImageLightbox(false);
        const dialog = activeItem.querySelector('[data-complete-system-description]');
        setExpanded(activeItem, false);
        dialog.hidden = true;
        unlockPageScroll();
        if (restoreFocus !== false && activeTrigger && activeTrigger.focus) activeTrigger.focus();
        activeItem = null;
        activeTrigger = null;
    };

    const openDialog = (item, trigger) => {
        if (activeItem) closeDialog(false);
        activeItem = item;
        activeTrigger = trigger;
        lockPageScroll();
        setExpanded(item, true);
        const dialog = item.querySelector('[data-complete-system-description]');
        dialog.hidden = false;
        dialog.querySelector('[data-complete-system-details-close]').focus();
        trackAccessoryEvent('pdp_accessory_details_open', root, item, {
            trigger_type: trigger.classList.contains('completeSystem-media') ? 'image' : 'details_link',
        });
    };

    const openImageLightbox = trigger => {
        const item = trigger.closest('[data-complete-system-item]');
        const dialogImage = item.querySelector('.completeSystem-dialogImage');
        const name = item.querySelector('[data-complete-system-detail-name]');
        const source = trigger.dataset.completeSystemFullImage
            || dialogImage.currentSrc
            || dialogImage.src;

        if (!source) return;
        activeImageTrigger = trigger;
        lightboxImage.src = source;
        lightboxImage.alt = name ? name.textContent : 'Accessory image';
        lightbox.hidden = false;
        lightboxClose.focus();
        trackAccessoryEvent('pdp_accessory_image_open', root, item);
    };

    root.addEventListener('click', event => {
        const closeButton = event.target.closest('[data-complete-system-details-close]');
        if (closeButton) {
            closeDialog();
            return;
        }

        const imageTrigger = event.target.closest('[data-complete-system-image-expand]');
        if (imageTrigger) {
            openImageLightbox(imageTrigger);
            return;
        }

        const trigger = event.target.closest('[data-complete-system-details]');
        if (trigger) {
            openDialog(trigger.closest('[data-complete-system-item]'), trigger);
            return;
        }

        const dialogOverlay = event.target.closest('[data-complete-system-description]');
        if (dialogOverlay && event.target === dialogOverlay) closeDialog();
    });

    lightboxClose.addEventListener('click', () => closeImageLightbox());
    lightbox.addEventListener('click', event => {
        if (event.target === lightbox) closeImageLightbox();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            if (!lightbox.hidden) closeImageLightbox();
            else closeDialog();
            return;
        }

        if (event.key === 'Tab' && !lightbox.hidden) {
            event.preventDefault();
            lightboxClose.focus();
            return;
        }

        if (event.key !== 'Tab' || !activeItem) return;
        const dialog = activeItem.querySelector('.completeSystem-dialog');
        const focusable = Array.prototype.slice.call(dialog.querySelectorAll('button:not([disabled])'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
}

export default function completeSystem() {
    const root = document.querySelector('[data-complete-system]');
    if (!root) return;

    const market = marketFromRoot(root);
    const series = systemSeries(root);
    const catalogDefinitions = market ? CATALOG[market] : null;

    if (!isSolatubeSkylight(root) || !series || !catalogDefinitions || !catalogDefinitions.length) return;

    const definitions = compatibleDefinitions(root, catalogDefinitions);
    let tileFlashingSelected = window.solatubeTileFlashingSelected === true;
    let tileRoofPitch = 'pitched';

    const selectedRoofField = document.querySelector('.productView-options [data-roof-type-option]');
    const selectedRoofInput = selectedRoofField && selectedRoofField.querySelector('input[type="radio"]:checked');
    const selectedRoofLabel = selectedRoofInput && selectedRoofField.querySelector(`label[for="${selectedRoofInput.id}"]`);
    if (selectedRoofLabel && /flat|little[\s-]*to[\s-]*no|no[\s-]*pitch/i.test(selectedRoofLabel.textContent)) {
        tileRoofPitch = 'little-to-no-pitch';
    }

    const list = root.querySelector('[data-complete-system-list]');
    const status = root.querySelector('[data-complete-system-status]');
    root.classList.add('is-loading');
    installDisclosure(root);
    root.hidden = false;
    status.textContent = 'Loading compatible accessories…';

    const applyTileFlashingChoice = async forceSelection => {
        const item = root.querySelector('[data-complete-system-type="tileFlashing"]');
        if (!item) return;

        const checkbox = item.querySelector('[data-complete-system-checkbox]');
        const wasChecked = checkbox.checked;
        const available = await resolveVariant(item, series, tileRoofPitch);

        item.hidden = !available;
        checkbox.disabled = !available;

        if (checkbox && available) checkbox.checked = forceSelection ? tileFlashingSelected : wasChecked;
        item.classList.toggle('is-roof-guide-required', tileFlashingSelected && available);
        updateSummary(root);
        updateDisclosureLabel(root);
    };

    document.addEventListener('solatube:tile-flashing-choice', event => {
        tileFlashingSelected = Boolean(event.detail && event.detail.selected);
        tileRoofPitch = (event.detail && event.detail.roofPitch) || tileRoofPitch;
        applyTileFlashingChoice(true);
    });

    if (selectedRoofField) {
        selectedRoofField.addEventListener('change', event => {
            if (!event.target.matches('input[type="radio"]')) return;

            const label = selectedRoofField.querySelector(`label[for="${event.target.id}"]`);
            tileRoofPitch = label && /flat|little[\s-]*to[\s-]*no|no[\s-]*pitch/i.test(label.textContent)
                ? 'little-to-no-pitch'
                : 'pitched';
            applyTileFlashingChoice(false);
        });
    }

    Promise.allSettled(definitions.map(definition => renderAccessory(definition, series, tileRoofPitch))).then(results => {
        if (!root.isConnected || !list.isConnected || !status.isConnected) return;

        results.forEach(result => {
            if (result.status === 'fulfilled') list.appendChild(result.value);
        });

        root.classList.remove('is-loading');
        status.textContent = list.children.length ? '' : 'Compatible accessories are temporarily unavailable.';
        updateDisclosureLabel(root);

        if (!list.children.length) return;

        applyTileFlashingChoice(false);

        list.addEventListener('change', event => {
            const item = event.target.closest('[data-complete-system-item]');
            if (event.target.matches('[data-complete-system-checkbox]')) {
                trackAccessoryEvent('pdp_accessory_toggle', root, item, { selected: event.target.checked });
                updateSummary(root);
            } else if (event.target.matches('[data-complete-system-qty]')) {
                trackAccessoryEvent('pdp_accessory_quantity_change', root, item);
                updateSummary(root);
            }
        });

        installCartBridge(root);
        installDetailsDialogs(root);
        updateSummary(root);
    });
}
