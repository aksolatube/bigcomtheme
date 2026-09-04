/*
 Import all product specific js
 */
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import rootsLoaded from './roots/product';
import { classifyForm } from './common/utils/form-utils';
import modalFactory from './global/modal';
import completeSystem from './roots/complete-system';
import pdpLayout from './roots/pdp-layout';
import pdpPurchaseBar from './roots/pdp-purchase-bar';
import pdpLongForm from './roots/pdp-long-form';
import trackKlaviyoViewedProduct from './roots/klaviyo-viewed-product';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
        this.reviewModal = modalFactory('#modal-review-form')[0];
    }

    onReady() {
        trackKlaviyoViewedProduct({
            ProductName: this.context.klaviyoProductName,
            ProductID: this.context.klaviyoProductId,
            SKU: this.context.klaviyoProductSku,
            Categories: this.context.klaviyoProductCategories,
            ImageURL: this.context.klaviyoProductImageUrl,
            URL: window.location.href,
            Brand: this.context.klaviyoProductBrand,
            Price: this.context.klaviyoProductPrice,
            CompareAtPrice: this.context.klaviyoProductCompareAtPrice,
        });

        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        this.productDetails.setProductVariant();

        completeSystem();
        pdpPurchaseBar(this.productDetails, window.BCData.product_attributes);
        pdpLayout();
        pdpLongForm();

        videoGallery();

        this.bulkPricingHandler();

        const $reviewForm = classifyForm('.writeReview-form');

        if ($reviewForm.length === 0) return;

        const review = new Review({ $reviewForm });

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            this.loadReviewRecaptcha();
            validator = review.registerValidation(this.context);
            this.ariaDescribeReviewInputs($reviewForm);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });
        rootsLoaded();

        this.productReviewHandler();
    }

    loadReviewRecaptcha() {
        const template = document.querySelector('[data-review-recaptcha-template]');
        const mount = document.querySelector('[data-review-recaptcha-mount]');

        if (!template || !mount || mount.getAttribute('data-recaptcha-loaded') === 'true') return;

        const content = template.content.cloneNode(true);
        const captchaScript = content.querySelector('script[src*="recaptcha"]');
        const scriptUrl = captchaScript && captchaScript.getAttribute('src');

        Array.prototype.forEach.call(content.querySelectorAll('script'), script => script.remove());
        mount.appendChild(content);
        mount.setAttribute('data-recaptcha-loaded', 'true');
        template.remove();

        const widget = mount.querySelector('.g-recaptcha');

        if (!widget) return;

        const renderCaptcha = () => {
            if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function' || widget.children.length) return;

            const render = () => {
                if (widget.children.length) return;
                window.grecaptcha.render(widget, {
                    sitekey: widget.getAttribute('data-sitekey'),
                });
            };

            if (typeof window.grecaptcha.ready === 'function') window.grecaptcha.ready(render);
            else render();
        };

        if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
            renderCaptcha();
            return;
        }

        if (!scriptUrl) return;

        const existingScript = document.querySelector('script[src*="google.com/recaptcha/api.js"]');

        if (existingScript) {
            existingScript.addEventListener('load', renderCaptcha, { once: true });
            return;
        }

        const script = document.createElement('script');
        const nonceScript = document.querySelector('script[nonce]');
        script.src = `${scriptUrl}${scriptUrl.indexOf('?') === -1 ? '?' : '&'}render=explicit`;
        script.async = true;
        script.defer = true;
        if (nonceScript && nonceScript.nonce) script.nonce = nonceScript.nonce;
        script.addEventListener('load', renderCaptcha, { once: true });
        document.head.appendChild(script);
    }

    ariaDescribeReviewInputs($form) {
        $form.find('[data-input]').each((_, input) => {
            const $input = $(input);
            const msgSpanId = `${$input.attr('name')}-msg`;

            $input.siblings('span').attr('id', msgSpanId);
            $input.attr('aria-describedby', msgSpanId);
        });
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }

    bulkPricingHandler() {
        if (this.url.indexOf('#bulk_pricing') !== -1) {
            this.$bulkPricingLink.trigger('click');
        }
    }
}
