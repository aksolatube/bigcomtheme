const SURVEY_STOREFRONTS = {
    'shop.solatube.com': {
        country: 'US',
        currency: 'USD',
        formspreeId: 'xppzaagk',
        label: 'USA',
        surveyId: 'usa_purchase_blockers_v1',
    },
    'solatubeshop.ca': {
        country: 'CA',
        currency: 'CAD',
        formspreeId: 'xzeplzzk',
        label: 'Canada',
        surveyId: 'canada_purchase_blockers_v1',
    },
    'solatubeshop.be': {
        country: 'BE',
        currency: 'EUR',
        formspreeId: 'xwledpgz',
        label: 'Belgium',
        surveyId: 'belgium_purchase_blockers_v1',
    },
    'solatubedirect.co.uk': {
        country: 'GB',
        currency: 'GBP',
        formspreeId: 'xeajbeeg',
        label: 'UK',
        surveyId: 'uk_purchase_blockers_v1',
    },
};
const ELIGIBLE_PAGE_CLASSES = ['product', 'category', 'search'];
const DISMISS_KEY = 'solatubePurchaseSurveyDismissedUntil';
const COMPLETE_KEY = 'solatubePurchaseSurveyCompletedUntil';
const DAY = 24 * 60 * 60 * 1000;

const FOLLOW_UPS = {
    choosing_skylight: 'What would make choosing the right skylight easier?',
    roof_flashing: 'What roof or flashing information is unclear?',
    installation: 'What installation help would be most useful?',
    total_cost: 'Which part of the total cost concerns you?',
    shipping_delivery: 'What shipping or delivery information do you need?',
    researching: 'What information would be most useful while you research?',
    site_problem: 'Please tell us where you ran into a problem.',
    other: 'Anything else you would like us to know?',
};

function hostname() {
    return window.location.hostname.toLowerCase().replace(/^www\./, '');
}

function pageClass() {
    if (document.querySelector('.body--product .productView')) return 'product';
    if (document.querySelector('.body--category')) return 'category';
    if (/search\.php/i.test(window.location.pathname)) return 'search';
    return 'other';
}

function storageDate(key) {
    try {
        return Number(window.localStorage.getItem(key) || 0);
    } catch (error) {
        return 0;
    }
}

function storeDate(key, days) {
    try {
        window.localStorage.setItem(key, String(Date.now() + (days * DAY)));
    } catch (error) {
        // The in-session state still prevents the survey from reopening.
    }
}

function visible(element) {
    return Boolean(element && !element.hidden && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
}

function setHidden(element, shouldHide) {
    if (element && element.hidden !== shouldHide) element.hidden = shouldHide;
}

function anotherOverlayIsOpen() {
    return document.body.classList.contains('has-activeModal')
        || document.body.classList.contains('has-activeNavPages')
        || document.body.classList.contains('has-contactHubModal')
        || visible(document.querySelector('.quickSearchResults'))
        || visible(document.querySelector('.navPages-container.is-open'))
        || visible(document.querySelector('.featuredMega.is-open'))
        || visible(document.querySelector('.completeSystem-dialog:not([hidden])'))
        || visible(document.querySelector('.completeSystem-imageLightbox:not([hidden])'))
        || visible(document.querySelector('.productLightbox:not([hidden])'))
        || visible(document.querySelector('.modal.is-open, .modal[aria-hidden="false"]'));
}

function productContext() {
    const form = document.querySelector('form[data-cart-item-add]');
    const productId = form && form.querySelector('input[name="product_id"]');
    const title = document.querySelector('.productView-title');
    const sku = document.querySelector('.productView [data-product-sku]');

    return {
        id: productId ? productId.value : '',
        name: title ? title.textContent.trim() : '',
        sku: sku ? sku.textContent.trim() : '',
    };
}

function track(eventName, values, storefront) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({
        event: eventName,
        survey_id: storefront.surveyId,
        survey_version: '1',
        country: storefront.country,
        page_type: pageClass(),
    }, values || {}));
}

export default function purchaseSurvey() {
    const survey = document.querySelector('[data-purchase-survey]');
    const opener = document.querySelector('[data-purchase-survey-open]');
    const pageType = pageClass();
    const storefront = SURVEY_STOREFRONTS[hostname()];
    const suppressed = storageDate(DISMISS_KEY) > Date.now() || storageDate(COMPLETE_KEY) > Date.now();

    if (!survey || !opener || !storefront || ELIGIBLE_PAGE_CLASSES.indexOf(pageType) === -1 || suppressed) return;

    const form = survey.querySelector('[data-purchase-survey-form]');
    const stepOne = survey.querySelector('[data-purchase-survey-step="1"]');
    const stepTwo = survey.querySelector('[data-purchase-survey-step="2"]');
    const success = survey.querySelector('[data-purchase-survey-success]');
    const answerError = survey.querySelector('[data-purchase-survey-choice-error]');
    const followUp = survey.querySelector('[data-purchase-survey-follow-up]');
    const status = survey.querySelector('[data-purchase-survey-status]');
    const submit = survey.querySelector('[data-purchase-survey-submit]');
    const contactToggle = survey.querySelector('[data-purchase-survey-contact-toggle]');
    const contactFields = survey.querySelector('[data-purchase-survey-contact-fields]');
    const contactName = form.querySelector('[name="contact_name"]');
    const contactEmail = form.querySelector('[name="contact_email"]');
    const contactPhone = form.querySelector('[name="contact_phone"]');
    const emailField = survey.querySelector('[data-purchase-survey-email-field]');
    const phoneField = survey.querySelector('[data-purchase-survey-phone-field]');
    const resultCopy = survey.querySelector('[data-purchase-survey-result-copy]');
    const product = productContext();
    let eligible = true;
    let opened = false;
    let visibilityFrame = null;
    const secondaryOpeners = Array.from(document.querySelectorAll('[data-pdp-survey-open]'));
    let lastOpener = opener;

    function selectedReason() {
        return form.querySelector('input[name="primary_reason"]:checked');
    }

    function selectedContactMethod() {
        return form.querySelector('input[name="preferred_contact_method"]:checked');
    }

    function syncContactMethod() {
        const requested = Boolean(contactToggle && contactToggle.checked);
        const method = selectedContactMethod();
        const wantsPhone = requested && method && method.value === 'phone';

        emailField.hidden = wantsPhone;
        phoneField.hidden = !wantsPhone;
        contactEmail.disabled = !requested || wantsPhone;
        contactEmail.required = requested && !wantsPhone;
        contactPhone.disabled = !wantsPhone;
        contactPhone.required = wantsPhone;
    }

    function syncContactFields(focusFirstField = false) {
        const requested = Boolean(contactToggle && contactToggle.checked);
        contactFields.hidden = !requested;
        contactToggle.setAttribute('aria-expanded', requested ? 'true' : 'false');
        contactName.disabled = !requested;
        contactName.required = requested;
        Array.from(form.querySelectorAll('[name="preferred_contact_method"]')).forEach(input => {
            input.disabled = !requested;
        });
        syncContactMethod();
        submit.textContent = requested ? 'Submit & request help' : 'Send feedback';
        if (requested && focusFirstField) contactName.focus();
    }

    function close() {
        const restoreFocus = opened;
        opened = false;
        setHidden(survey, true);
        survey.classList.remove('is-open');
        setHidden(opener, !eligible || anotherOverlayIsOpen());
        opener.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('has-purchaseSurveyPanel');
        secondaryOpeners.forEach(button => {
            setHidden(button, !eligible);
            button.setAttribute('aria-expanded', 'false');
        });
        if (restoreFocus && !lastOpener.hidden) lastOpener.focus({ preventScroll: true });
    }

    function open(event) {
        if (!eligible || anotherOverlayIsOpen()) return;
        lastOpener = event && event.currentTarget ? event.currentTarget : opener;
        lastOpener.setAttribute('aria-expanded', 'true');
        opened = true;
        setHidden(opener, true);
        opener.setAttribute('aria-expanded', 'true');
        setHidden(survey, false);
        survey.classList.add('is-open');
        document.body.classList.add('has-purchaseSurveyPanel');
        track('purchase_survey_open', { trigger_type: 'user_opened' }, storefront);
        const firstChoice = form.querySelector('input[name="primary_reason"]');
        if (firstChoice) firstChoice.focus();
    }

    function dismiss() {
        eligible = false;
        storeDate(DISMISS_KEY, 14);
        track('purchase_survey_dismiss', { survey_step: stepTwo.hidden ? 1 : 2 }, storefront);
        close();
        setHidden(opener, true);
    }

    function showStepOne() {
        stepOne.hidden = false;
        stepTwo.hidden = true;
        answerError.hidden = true;
        const answer = selectedReason();
        if (answer) answer.focus();
    }

    function showStepTwo() {
        const answer = selectedReason();
        if (!answer) {
            answerError.hidden = false;
            return;
        }

        answerError.hidden = true;
        followUp.textContent = FOLLOW_UPS[answer.value] || FOLLOW_UPS.other;
        stepOne.hidden = true;
        stepTwo.hidden = false;
        track('purchase_survey_answer', {
            question_id: 'purchase_blocker',
            answer_code: answer.value,
        }, storefront);
        stepTwo.querySelector('textarea').focus();
    }

    function syncVisibility() {
        if (visibilityFrame !== null) return;

        visibilityFrame = window.requestAnimationFrame(() => {
            visibilityFrame = null;
            const blocked = anotherOverlayIsOpen();

            if (blocked && !survey.hidden) {
                close();
                return;
            }

            setHidden(opener, !eligible || blocked || !survey.hidden);
            secondaryOpeners.forEach(button => setHidden(button, !eligible));
        });
    }

    opener.addEventListener('click', open);
    secondaryOpeners.forEach(button => {
        button.hidden = false;
        button.addEventListener('click', open);
    });
    survey.querySelector('[data-purchase-survey-close]').addEventListener('click', close);
    survey.querySelector('[data-purchase-survey-dismiss]').addEventListener('click', dismiss);
    survey.querySelector('[data-purchase-survey-next]').addEventListener('click', showStepTwo);
    survey.querySelector('[data-purchase-survey-back]').addEventListener('click', showStepOne);
    survey.querySelector('[data-purchase-survey-finish]').addEventListener('click', close);

    form.addEventListener('change', event => {
        if (event.target.name === 'primary_reason') answerError.hidden = true;
        if (event.target === contactToggle) {
            syncContactFields(event.target.checked);
            if (event.target.checked) {
                track('purchase_survey_contact_requested', {
                    question_id: 'purchase_blocker',
                    answer_code: selectedReason() ? selectedReason().value : '',
                    product_id: product.id,
                }, storefront);
            }
        }
        if (event.target.name === 'preferred_contact_method') syncContactMethod();
    });

    survey.addEventListener('keydown', event => {
        if (event.key === 'Escape') close();
    });

    form.addEventListener('submit', event => {
        event.preventDefault();
        const answer = selectedReason();
        if (!answer) {
            showStepOne();
            answerError.hidden = false;
            return;
        }

        if (contactToggle.checked && !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!storefront.formspreeId) {
            status.textContent = 'The survey inbox still needs its Formspree form ID.';
            return;
        }

        status.textContent = '';
        submit.disabled = true;
        submit.textContent = 'Sending…';

        const data = new FormData(form);
        const answerLabel = answer.parentNode.querySelector('span');
        const contactRequested = contactToggle.checked;
        const contactMethod = selectedContactMethod();
        data.set('_subject', `${storefront.label} website — ${contactRequested ? 'Survey contact request' : 'Purchase survey'}`);
        data.set('survey_id', storefront.surveyId);
        data.set('survey_version', '1');
        data.set('storefront', storefront.label);
        data.set('country', storefront.country);
        data.set('currency', storefront.currency);
        data.set('primary_reason_label', answerLabel ? answerLabel.textContent.trim() : answer.value);
        data.set('page_type', pageType);
        data.set('page_title', document.title);
        data.set('page_url', window.location.href);
        data.set('product_id', product.id);
        data.set('product_name', product.name);
        data.set('product_sku', product.sku);
        data.set('search_query', new URLSearchParams(window.location.search).get('search_query') || '');
        data.set('device_type', window.matchMedia('(max-width: 800px)').matches ? 'mobile' : 'desktop');
        data.set('contact_requested', contactRequested ? 'yes' : 'no');
        data.set('preferred_contact_method', contactRequested && contactMethod ? contactMethod.value : '');

        window.fetch(`https://formspree.io/f/${storefront.formspreeId}`, {
            method: 'POST',
            body: data,
            headers: { Accept: 'application/json' },
        }).then(response => {
            if (!response.ok) throw new Error(`Formspree returned ${response.status}`);
            track('purchase_survey_complete', {
                question_id: 'purchase_blocker',
                answer_code: answer.value,
                product_id: product.id,
                contact_requested: contactRequested,
            }, storefront);
            if (contactRequested) {
                track('purchase_survey_contact_submitted', {
                    question_id: 'purchase_blocker',
                    answer_code: answer.value,
                    product_id: product.id,
                    preferred_contact_method: contactMethod ? contactMethod.value : '',
                }, storefront);
            }
            storeDate(COMPLETE_KEY, 60);
            eligible = false;
            form.hidden = true;
            success.hidden = false;
            resultCopy.textContent = contactRequested
                ? 'Thanks. A member of our team can now follow up about your project.'
                : 'Your feedback will help us improve the Solatube shopping experience.';
            success.querySelector('button').focus();
        }).catch(() => {
            submit.disabled = false;
            submit.textContent = contactToggle.checked ? 'Submit & request help' : 'Send feedback';
            status.textContent = 'We could not send your feedback. Please try again.';
        });
    });

    syncContactFields();

    const observer = new MutationObserver(syncVisibility);
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['aria-hidden', 'class', 'hidden'],
        subtree: true,
    });

    window.setTimeout(() => {
        if (!eligible || anotherOverlayIsOpen()) return;
        setHidden(opener, false);
        track('purchase_survey_impression', { trigger_type: 'passive_tab' }, storefront);
    }, 15000);
}
