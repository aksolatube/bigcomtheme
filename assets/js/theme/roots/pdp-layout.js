const DESKTOP_WIDTH = 1025;
const GALLERY_GAP = 16;
const MIN_IMAGE_HEIGHT = 220;

export default function pdpLayout() {
    // Never change quick view or the cart preview's shared product markup.
    const product = document.querySelector('.productPage-main > .productView');
    const gallery = product && product.querySelector('[data-image-gallery]');
    const stage = gallery && gallery.querySelector('.productView-img-container');
    if (!gallery || !stage || gallery.dataset.pdpLayoutReady === 'true') return;
    gallery.dataset.pdpLayoutReady = 'true';

    const header = document.querySelector('header.header[role="banner"]');
    let frame = null;
    let purchaseBarHeight = parseFloat(document.documentElement.style.getPropertyValue('--pdp-purchase-bar-height')) || 0;

    function setPixelProperty(name, value) {
        const next = `${value}px`;
        if (gallery.style.getPropertyValue(name) !== next) gallery.style.setProperty(name, next);
    }

    function resetGallery() {
        gallery.classList.remove('productView-images--sticky');
        gallery.style.removeProperty('--pdp-gallery-top');
        gallery.style.removeProperty('--pdp-gallery-stage-max');
    }

    function update() {
        frame = null;
        if (window.innerWidth < DESKTOP_WIDTH) {
            resetGallery();
            return;
        }

        const headerPosition = header && window.getComputedStyle(header).position;
        const headerBottom = header && (headerPosition === 'fixed' || headerPosition === 'sticky')
            ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
        // The actual bottom includes the Script Manager sale-bar offset and
        // follows the theme's expanding/compressing header without hardcoding it.
        const top = Math.ceil(headerBottom) + GALLERY_GAP;
        const availableHeight = window.innerHeight - top - GALLERY_GAP - purchaseBarHeight;
        const galleryHeight = gallery.getBoundingClientRect().height;
        const stageHeight = stage.getBoundingClientRect().height;
        const thumbnailSpace = Math.max(0, galleryHeight - stageHeight);
        const maxStage = Math.floor(availableHeight - thumbnailSpace);

        if (galleryHeight <= 0 || stageHeight <= 0 || maxStage < MIN_IMAGE_HEIGHT) {
            resetGallery();
            return;
        }

        setPixelProperty('--pdp-gallery-top', top);
        setPixelProperty('--pdp-gallery-stage-max', maxStage);
        // If store-specific styles prevent the stage shrinking, prefer normal
        // scrolling over pinning inaccessible thumbnails below the viewport.
        gallery.classList.toggle('productView-images--sticky',
            gallery.getBoundingClientRect().height <= availableHeight + 1);
    }

    function schedule() {
        if (frame === null) frame = window.requestAnimationFrame(update);
    }

    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('solatube:pdp-purchase-bar-resize', event => {
        purchaseBarHeight = event.detail.height || 0;
        schedule();
    });
    gallery.addEventListener('load', schedule, true);

    if (window.ResizeObserver) {
        const sizes = new window.ResizeObserver(schedule);
        sizes.observe(gallery);
        if (header) sizes.observe(header);
    }

    if (window.MutationObserver) {
        const offsets = new window.MutationObserver(schedule);
        if (header) offsets.observe(header, { attributes: true, attributeFilter: ['class', 'style'] });
        // Sale announcement dismissal can change header top without its size.
        offsets.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    update();
}
