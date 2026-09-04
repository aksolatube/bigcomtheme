const STOREFRONTS = {
    'shop.solatube.com': {
        country: 'US',
        currency: 'USD',
        label: 'USA',
        formspreeId: 'xeaqjjbl',
    },
    'solatubeshop.ca': {
        country: 'CA',
        currency: 'CAD',
        label: 'Canada',
        formspreeId: 'meorkqrk',
    },
    'solatubeshop.be': {
        country: 'BE',
        currency: 'EUR',
        label: 'Belgium',
        formspreeId: 'xppagwvo',
    },
    'solatubedirect.co.uk': {
        country: 'GB',
        currency: 'GBP',
        label: 'UK',
        formspreeId: 'xzepldde',
    },
};

const EXCLUDED_PATHS = ['/cart', '/checkout', '/order-confirmation', '/orderconfirmation'];
const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function normalizedHostname() {
    return window.location.hostname.toLowerCase().replace(/^www\./, '');
}

function getStorefront() {
    return STOREFRONTS[normalizedHostname()] || null;
}

function pageIsExcluded() {
    const path = window.location.pathname.toLowerCase();
    return EXCLUDED_PATHS.some(excludedPath => path.indexOf(excludedPath) !== -1);
}

function getProductContext() {
    const product = document.querySelector('.productView');
    const form = document.querySelector('form[data-cart-item-add]');
    const title = document.querySelector('.productView-title');
    const sku = document.querySelector('.productView [data-product-sku]');
    const productId = form && form.querySelector('input[name="product_id"]');

    return {
        category: product ? product.getAttribute('data-product-category') || '' : '',
        id: productId ? productId.value : '',
        name: title ? title.textContent.trim() : '',
        sku: sku ? sku.textContent.trim() : '',
    };
}

function getSelectedOptions() {
    const optionFields = document.querySelectorAll('.productView-options-inner .form-field');
    const selections = [];

    Array.prototype.forEach.call(optionFields, field => {
        const label = field.querySelector('.form-label, legend');
        const checked = field.querySelector('input:checked');
        const select = field.querySelector('select');
        let value = '';

        if (checked) {
            const choiceLabel = field.querySelector(`label[for="${checked.id}"]`);
            value = choiceLabel ? choiceLabel.textContent.trim() : checked.value;
        } else if (select && select.selectedIndex >= 0) {
            value = select.options[select.selectedIndex].text.trim();
        }

        if (label && value) {
            selections.push(`${label.textContent.replace('*', '').trim()}: ${value}`);
        }
    });

    return selections.join(' | ');
}

function getPageType(product) {
    if (product.name) return 'product';
    if (/search\.php/i.test(window.location.pathname)) return 'search';
    if (document.querySelector('.page-category, [data-category-id]')) return 'category';
    if (window.location.pathname === '/' || window.location.pathname === '') return 'home';
    return 'content';
}

function visible(element) {
    return Boolean(element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
}

function normalizePhone(phone, country) {
    const raw = phone.trim();
    if (!raw) return '';

    if (raw.indexOf('+') === 0) return `+${raw.replace(/\D/g, '')}`;
    if (raw.indexOf('00') === 0) return `+${raw.slice(2).replace(/\D/g, '')}`;

    const digits = raw.replace(/\D/g, '');
    if ((country === 'CA' || country === 'US') && digits.length === 10) return `+1${digits}`;
    if (country === 'GB' && digits.indexOf('0') === 0) return `+44${digits.slice(1)}`;
    if (country === 'BE' && digits.indexOf('0') === 0) return `+32${digits.slice(1)}`;

    return digits ? `+${digits}` : '';
}

export default function contactHub() {
    const storefront = getStorefront();
    const hub = document.querySelector('[data-contact-hub]');
    const fab = document.querySelector('.contactHub-fab');
    const launchers = document.querySelectorAll('[data-contact-hub-open]');

    if (!storefront || !storefront.formspreeId || !hub || pageIsExcluded()) return;

    const dialog = hub.querySelector('.contactHub-dialog');
    const form = hub.querySelector('[data-contact-hub-form]');
    const content = hub.querySelector('[data-contact-hub-content]');
    const success = hub.querySelector('[data-contact-hub-success]');
    const title = hub.querySelector('[data-contact-hub-title]');
    const intro = hub.querySelector('[data-contact-hub-intro]');
    const productContext = hub.querySelector('[data-contact-hub-product-context]');
    const postalLabel = hub.querySelector('[data-contact-hub-postal-label]');
    const status = hub.querySelector('[data-contact-hub-status]');
    const submit = hub.querySelector('[data-contact-hub-submit]');
    const product = getProductContext();
    let opener = null;
    let mode = 'general';
    let scrollPosition = 0;
    let priorBodyStyles = null;

    if (postalLabel) {
        postalLabel.textContent = {
            US: 'ZIP code',
            CA: 'Postal code',
            GB: 'Postcode',
            BE: 'Postal code',
        }[storefront.country] || 'ZIP / postal code';
    }

    function setPageLock(locked) {
        if (locked) {
            scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            priorBodyStyles = {
                left: document.body.style.left,
                overflow: document.body.style.overflow,
                position: document.body.style.position,
                right: document.body.style.right,
                top: document.body.style.top,
                width: document.body.style.width,
            };
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPosition}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            document.body.classList.add('has-contactHubModal');
            return;
        }

        if (!priorBodyStyles) return;
        document.body.style.position = priorBodyStyles.position;
        document.body.style.top = priorBodyStyles.top;
        document.body.style.left = priorBodyStyles.left;
        document.body.style.right = priorBodyStyles.right;
        document.body.style.width = priorBodyStyles.width;
        document.body.style.overflow = priorBodyStyles.overflow;
        document.body.classList.remove('has-contactHubModal');
        window.scrollTo(0, scrollPosition);
        priorBodyStyles = null;
    }

    function resetResult() {
        content.hidden = false;
        success.hidden = true;
        status.textContent = '';
        status.classList.remove('is-error');
        submit.disabled = false;
        submit.textContent = 'Send to Solatube';
    }

    function close() {
        if (hub.hidden) return;
        hub.hidden = true;
        hub.classList.remove('is-open');
        setPageLock(false);
        resetResult();
        if (opener && opener.closest('[data-pdp-purchase-bar]')) {
            document.dispatchEvent(new CustomEvent('solatube:pdp-restore-focus'));
            opener.focus({ preventScroll: true });
            return;
        }
        if (opener) opener.focus();
    }

    function open(trigger) {
        opener = trigger;
        mode = trigger.getAttribute('data-contact-hub-open') || 'general';
        resetResult();

        if (mode === 'product' && product.name) {
            title.textContent = 'Question about this product?';
            intro.textContent = 'Send us your question and a Solatube product specialist will get back to you.';
            productContext.textContent = product.name;
            productContext.hidden = false;
        } else {
            title.textContent = 'How can we help?';
            intro.textContent = 'Tell us about your project or question and a Solatube specialist will get back to you.';
            productContext.hidden = true;
        }

        hub.hidden = false;
        setPageLock(true);
        window.requestAnimationFrame(() => {
            hub.classList.add('is-open');
            const firstInput = form.querySelector('input');
            (firstInput || dialog).focus();
        });
    }

    function syncFab() {
        const anotherModalOpen = document.body.classList.contains('has-activeModal')
            || document.body.classList.contains('has-activeNavPages')
            || document.body.classList.contains('has-purchaseSurveyPanel')
            || visible(document.querySelector('.quickSearchResults.is-open'))
            || visible(document.querySelector('.navPages-container.is-open'))
            || visible(document.querySelector('.completeSystem-dialog:not([hidden])'))
            || visible(document.querySelector('.completeSystem-imageLightbox:not([hidden])'))
            || visible(document.querySelector('.productLightbox:not([hidden])'))
            || visible(document.querySelector('.modal.is-open, .modal[aria-hidden="false"]'));
        const shouldHideFab = anotherModalOpen || !hub.hidden;

        if (fab.hidden !== shouldHideFab) fab.hidden = shouldHideFab;
    }

    function appendContext(formData) {
        const options = getSelectedOptions();
        const pageType = getPageType(product);
        const search = new URLSearchParams(window.location.search).get('search_query') || '';

        formData.set('_subject', `${storefront.label} website — ${mode === 'product' ? 'Product question' : 'General enquiry'}`);
        formData.set('storefront', storefront.label);
        formData.set('country', storefront.country);
        formData.set('currency', storefront.currency);
        formData.set('form_context', mode === 'product' ? 'product_question' : 'contact_fab');
        formData.set('page_type', pageType);
        formData.set('page_title', document.title);
        formData.set('page_url', window.location.href);
        formData.set('lead_source', 'Web Site');
        formData.set('lead_status', 'Open');
        formData.set('Source_Detail__c', normalizedHostname());
        formData.set('product_name', product.name);
        formData.set('product_id', product.id);
        formData.set('product_sku', product.sku);
        formData.set('product_category', product.category);
        formData.set('selected_options', options);
        formData.set('search_query', search);
    }

    function trackSuccess() {
        const email = form.querySelector('[name="email"]').value.trim().toLowerCase();
        const phone = normalizePhone(form.querySelector('[name="phone"]').value, storefront.country);
        const zip = form.querySelector('[name="zip"]').value.trim().toUpperCase();
        const firstName = form.querySelector('[name="firstname"]').value.trim();
        const lastName = form.querySelector('[name="lastname"]').value.trim();
        const leadValue = mode === 'product' ? 25 : 100;

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'generate_lead',
            form_id: 'solatube_contact_hub',
            form_name: `${storefront.label} ${mode === 'product' ? 'Product Question' : 'Contact FAB'}`,
            lead_type: mode === 'product' ? 'product_question' : 'general_enquiry',
            lead_value: leadValue,
            value: leadValue,
            currency: storefront.currency,
            country: storefront.country,
            page_type: getPageType(product),
            page_url: window.location.href,
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            email,
            phone_number: phone,
            zip,
            first_name: firstName,
            last_name: lastName,
            leadsUserData: {
                email,
                phone_number: phone,
            },
        });

        // GTM consumes the values synchronously with generate_lead. Clear the
        // temporary data-layer state afterward so it cannot leak into a later
        // unrelated event when Version 2 data-layer variables are used.
        window.setTimeout(() => {
            window.dataLayer.push({
                email: undefined,
                phone_number: undefined,
                zip: undefined,
                first_name: undefined,
                last_name: undefined,
                leadsUserData: undefined,
            });
        }, 0);
    }

    Array.prototype.forEach.call(launchers, launcher => {
        launcher.hidden = false;
        launcher.addEventListener('click', event => {
            event.preventDefault();
            open(launcher);
        });
    });

    Array.prototype.forEach.call(hub.querySelectorAll('[data-contact-hub-close]'), closer => {
        closer.addEventListener('click', close);
    });

    hub.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            close();
            return;
        }

        if (event.key !== 'Tab') return;
        const focusable = Array.prototype.filter.call(dialog.querySelectorAll(FOCUSABLE_SELECTOR), visible);
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

    form.addEventListener('submit', event => {
        event.preventDefault();
        status.textContent = '';
        status.classList.remove('is-error');

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        submit.disabled = true;
        submit.textContent = 'Sending…';
        const formData = new FormData(form);
        appendContext(formData);

        window.fetch(`https://formspree.io/f/${storefront.formspreeId}`, {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' },
        }).then(response => {
            if (!response.ok) throw new Error(`Formspree returned ${response.status}`);
            trackSuccess();
            form.reset();
            content.hidden = true;
            success.hidden = false;
            success.querySelector('button').focus();
        }).catch(() => {
            submit.disabled = false;
            submit.textContent = 'Send to Solatube';
            status.textContent = 'We could not send your message. Please try again.';
            status.classList.add('is-error');
        });
    });

    const observer = new MutationObserver(syncFab);
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['aria-hidden', 'class', 'hidden'],
        subtree: true,
    });
    if (fab.hidden) fab.hidden = false;
    syncFab();
}
