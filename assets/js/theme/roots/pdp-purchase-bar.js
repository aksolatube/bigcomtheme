export default function pdpPurchaseBar(details, initialAttributes = {}) {
    const product = document.querySelector('.productPage-main > .productView');
    const bar = document.querySelector('[data-pdp-purchase-bar]');
    const form = product && product.querySelector('form[data-cart-item-add]');
    const original = form && form.querySelector('#form-action-addToCart');
    if (!bar || !original || !details || bar.dataset.ready) return;
    bar.dataset.ready = 'true';

    const buy = bar.querySelector('[data-pdp-bar-buy]');
    const edit = bar.querySelector('[data-pdp-bar-edit]');
    const summary = bar.querySelector('[data-pdp-bar-selection]');
    const price = bar.querySelector('[data-pdp-bar-price]');
    const priceLabel = bar.querySelector('[data-pdp-bar-price-label]');
    const quantity = form.querySelector('[name="qty[]"]');
    const header = document.querySelector('header.header[role="banner"]');
    const spacer = document.querySelector('[data-pdp-bar-spacer]');
    let unitPrice = Number(bar.dataset.unitPrice);
    let priceRange = bar.dataset.priceRange === 'true';
    let pending = 0;
    let optionError = false;
    let busy = false;
    let frame = null;
    let barPurchase = false;
    let restoreTarget = null;
    let wasBlocked = false;
    let shown = false;
    let viewTracked = false;
    let visibilityTimer = null;
    let height = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const visibilityBuffer = 12;
    const exitDelay = reducedMotion ? 0 : 220;
    let formatter;
    try { formatter = new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency: bar.dataset.currencyCode }); } catch (error) { /* Fall back to the native displayed price. */ }
    if (bar.dataset.unitPrice === '') unitPrice = NaN;

    // Escape any page-builder transformed ancestors; keep footer links reachable.
    document.body.appendChild(bar);
    if (spacer) document.body.appendChild(spacer);
    bar.hidden = false;
    bar.setAttribute('aria-hidden', 'true');

    function text(node, value) {
        if (node.textContent !== value) node.textContent = value;
    }

    function analyticsContext() {
        const itemQuantity = validQuantity() ? Number(quantity ? quantity.value : 1) : 0;
        const accessories = Array.from(product.querySelectorAll('[data-complete-system-item]')).filter(item => {
            const checkbox = item.querySelector('[data-complete-system-checkbox]');
            return checkbox && checkbox.checked && !checkbox.disabled;
        });
        let accessoryCount = 0;
        let accessoryValue = 0;

        accessories.forEach(item => {
            const count = Number(item.querySelector('[data-complete-system-qty]')?.value || 1);
            const amount = Number(item.querySelector('[data-complete-system-price]')?.dataset.priceValue);
            accessoryCount += Number.isFinite(count) ? count : 1;
            if (Number.isFinite(amount)) accessoryValue += amount * (Number.isFinite(count) ? count : 1);
        });

        return {
            item_id: form.querySelector('[name="product_id"]')?.value || '',
            item_name: bar.querySelector('.pdpPurchaseBar-title')?.textContent.trim() || '',
            currency: bar.dataset.currencyCode || 'USD',
            quantity: itemQuantity,
            accessory_count: accessoryCount,
            accessory_value: accessoryValue,
            device_type: window.innerWidth <= 800 ? 'mobile' : 'desktop',
            page_path: window.location.pathname,
        };
    }

    function trackPurchaseBarEvent(eventName, details = {}) {
        window.dataLayer = window.dataLayer || [];
        const parameters = Object.assign(analyticsContext(), details);

        function queueGtagCommand() {
            window.dataLayer.push(arguments);
        }

        queueGtagCommand('event', eventName, parameters);
    }

    function visible(node) {
        return Boolean(node && !node.hidden && node.getClientRects().length && window.getComputedStyle(node).visibility !== 'hidden');
    }

    function headerBottom() {
        const position = header && window.getComputedStyle(header).position;
        return header && (position === 'fixed' || position === 'sticky') ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    }

    function blocked() {
        return /(?:^|\s)has-(?:activeModal|activeNavPages|contactHubModal|purchaseSurveyPanel)(?:\s|$)/.test(document.body.className)
            || Array.from(document.querySelectorAll('.quickSearchResults, .navPages-container.is-open, .featuredMega.is-open, .completeSystem-dialog:not([hidden]), .completeSystem-imageLightbox:not([hidden]), .productLightbox:not([hidden]), .modal.is-open, .modal[aria-hidden="false"]')).some(visible)
            || (window.innerWidth <= 800 && document.activeElement && document.activeElement.matches('input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]), textarea, select, [contenteditable="true"]'));
    }

    function invalidChoice() {
        return Array.from(form.querySelectorAll('[data-product-attribute] input[required], [data-product-attribute] select[required], [data-product-attribute] textarea[required]')).find(input => {
            if (input.disabled) return false;
            if (input.type === 'radio' || input.type === 'checkbox') {
                return !Array.from(form.elements).some(other => other.name === input.name && other.checked && !other.disabled);
            }
            return input.type === 'file' ? !input.files.length : !input.value.trim();
        });
    }

    function validQuantity() {
        if (!quantity) return true;
        const value = Number(quantity.value);
        const min = Number(quantity.dataset.quantityMin || quantity.min || 1);
        const max = Number(quantity.dataset.quantityMax || quantity.max || 0);
        return /^\d+$/.test(quantity.value) && value >= Math.max(1, min) && (!max || value <= max);
    }

    function focusSelection(target) {
        const input = target || invalidChoice() || form.querySelector('[data-product-attribute] select, [data-product-attribute] input:not([type="hidden"]), [data-product-attribute] textarea') || quantity || original;
        const field = input.closest('.form-field') || input;
        input.focus({ preventScroll: true });
        window.scrollTo({ top: Math.max(0, field.getBoundingClientRect().top + window.scrollY - headerBottom() - 24), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }

    function syncContent() {
        const qty = validQuantity() ? Number(quantity ? quantity.value : 1) : 0;
        const items = Array.from(product.querySelectorAll('[data-complete-system-item]')).filter(item => {
            const checkbox = item.querySelector('[data-complete-system-checkbox]');
            return checkbox && checkbox.checked && !checkbox.disabled;
        });
        let extras = 0;
        let subtotal = unitPrice * qty;
        items.forEach(item => {
            const count = Number(item.querySelector('[data-complete-system-qty]')?.value || 1);
            const amount = item.querySelector('[data-complete-system-price]')?.dataset.priceValue;
            extras += count;
            subtotal += amount === undefined || amount === '' ? NaN : Number(amount) * count;
        });
        const selections = Array.from(form.querySelectorAll('[data-product-attribute] select, [data-product-attribute] input:checked')).map(input => {
            if (input.tagName === 'SELECT') return input.value && input.options[input.selectedIndex]?.text.trim();
            const label = Array.from(form.querySelectorAll('label')).find(node => node.htmlFor === input.id);
            return label ? label.textContent.trim() || label.getAttribute('aria-label') : '';
        }).filter(Boolean);
        const selection = [`Qty ${qty || '—'}`, ...selections, ...(extras ? [`${extras} extra${extras === 1 ? '' : 's'}`] : [])].join(' · ');
        text(summary, selection);
        if (summary.title !== selection) summary.title = selection;
        const exact = formatter && Number.isFinite(subtotal) && qty && !priceRange && !pending && !optionError;
        const nativePrice = product.querySelector('[data-product-price-with-tax], [data-product-price-without-tax]');
        text(price, exact ? formatter.format(subtotal) : (pending ? 'Updating…' : nativePrice?.textContent.trim() || 'See selection'));
        text(priceLabel, exact ? 'Selection subtotal' : 'Product price');
        const missing = invalidChoice();
        const unavailable = original.disabled && !busy && !missing;
        buy.disabled = busy || pending > 0 || unavailable;
        text(buy, busy ? (/ACCESSOR/i.test(original.value) ? 'Adding extras…' : 'Adding…') : pending ? 'Updating…' : missing ? 'Choose options' : !qty ? 'Edit quantity' : optionError ? 'Review selection' : unavailable ? 'Unavailable' : (/pre.?order/i.test(original.value) ? 'Pre-order' : extras ? `Add to cart + ${extras} extra${extras === 1 ? '' : 's'}` : 'Add to cart'));
        edit.disabled = busy;
    }

    function update() {
        frame = null;
        syncContent();
        const isBlocked = blocked();
        const trigger = headerBottom();
        const originalBottom = original.getBoundingClientRect().bottom;
        const show = visible(original)
            && originalBottom <= trigger + (shown ? visibilityBuffer : -visibilityBuffer)
            && !isBlocked;

        if (show !== shown) {
            shown = show;
            window.clearTimeout(visibilityTimer);
            visibilityTimer = null;
            bar.classList.toggle('is-visible', show);
            bar.setAttribute('aria-hidden', show ? 'false' : 'true');

            if (show) {
                document.body.classList.add('has-pdpPurchaseBar');
                if (!viewTracked) {
                    viewTracked = true;
                    trackPurchaseBarEvent('pdp_purchase_bar_view');
                }
            } else {
                visibilityTimer = window.setTimeout(() => {
                    visibilityTimer = null;
                    if (!shown) document.body.classList.remove('has-pdpPurchaseBar');
                    schedule();
                }, exitDelay);
            }
        }
        // Retain footer clearance while a dialog/keyboard is open, preventing
        // the document shrinking and clamping the shopper's bottom scroll position.
        const nextHeight = show
            ? Math.ceil(bar.getBoundingClientRect().height)
            : (isBlocked || visibilityTimer) ? height : 0;
        if (height !== nextHeight) {
            height = nextHeight;
            document.documentElement.style.setProperty('--pdp-purchase-bar-height', `${height}px`);
            window.dispatchEvent(new CustomEvent('solatube:pdp-purchase-bar-resize', { detail: { height } }));
        }
        if (wasBlocked && !isBlocked && restoreTarget) {
            if (show) restoreTarget.focus({ preventScroll: true });
            restoreTarget = null;
        }
        wasBlocked = isBlocked;
    }

    function schedule() {
        if (frame === null) frame = window.requestAnimationFrame(update);
    }

    details.onPdpAttributes = data => {
        if (data.price) {
            const active = data.price.with_tax || data.price.without_tax;
            unitPrice = active && active.value !== undefined ? Number(active.value) : NaN;
            priceRange = Boolean(data.price.price_range);
        }
        schedule();
    };
    details.onPdpOptionRequest = (started, failed = false) => {
        pending = Math.max(0, pending + (started ? 1 : -1));
        optionError = failed;
        schedule();
    };
    details.onPdpCartState = adding => { busy = adding; schedule(); };
    details.pdpPurchaseFocusTarget = () => {
        if (!barPurchase) return original;
        restoreTarget = buy;
        return buy;
    };
    details.onPdpAttributes(initialAttributes || {});

    buy.addEventListener('click', () => {
        if (busy || pending || buy.disabled) return;
        const selectionValid = !invalidChoice() && validQuantity() && !optionError && Boolean(form.requestSubmit);
        trackPurchaseBarEvent('pdp_purchase_bar_add_to_cart', { selection_valid: selectionValid });
        if (!selectionValid) {
            focusSelection(!validQuantity() ? quantity : null);
            return;
        }
        barPurchase = true;
        // Submit the ORIGINAL form, including its existing capture validation,
        // nod validation, option data, fast cart and sequential accessory adds.
        // Do not click the original button: its click handler scrolls to the form.
        form.requestSubmit(original);
        if (!busy) {
            const error = form.querySelector('[aria-invalid="true"], .form-field--error input, .form-field--optionError input');
            if (error) focusSelection(error);
            barPurchase = false;
        }
        schedule();
    });
    original.addEventListener('click', () => { barPurchase = false; });
    form.addEventListener('submit', event => {
        if (busy || pending) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
    edit.addEventListener('click', () => {
        trackPurchaseBarEvent('pdp_purchase_bar_click', { action: 'edit_selection' });
        focusSelection();
    });
    bar.querySelector('[data-contact-hub-open]')?.addEventListener('click', event => {
        trackPurchaseBarEvent('pdp_purchase_bar_click', { action: 'need_help' });
        restoreTarget = event.currentTarget;
    });
    document.addEventListener('solatube:pdp-restore-focus', update);
    ['input', 'change', 'click'].forEach(name => product.addEventListener(name, schedule));
    ['scroll', 'resize'].forEach(name => window.addEventListener(name, schedule, { passive: true }));
    ['focusin', 'focusout'].forEach(name => document.addEventListener(name, schedule));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', schedule, { passive: true });
    if (window.ResizeObserver) {
        const sizes = new window.ResizeObserver(schedule);
        sizes.observe(bar);
        if (header) sizes.observe(header);
    }
    if (window.MutationObserver) {
        const content = new window.MutationObserver(schedule);
        content.observe(product, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'hidden', 'data-price-value', 'value', 'class', 'style'] });
        const overlays = new window.MutationObserver(schedule);
        overlays.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'aria-hidden'] });
    }
    update();
}
