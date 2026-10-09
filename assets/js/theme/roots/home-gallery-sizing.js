(function homeGallerySizing() {
    'use strict';

    function sizeImage(img) {
        if (!img.matches('.st-gallery .lightbox [data-lightbox-img], .st-gallery-lightbox [data-lightbox-img]')) return;
        if (!img.naturalWidth || !img.naturalHeight) return;

        if (window.innerWidth <= 1024) {
            img.style.removeProperty('width');
            img.style.removeProperty('height');
            return;
        }

        var scale = Math.min(1.3, window.innerWidth * 0.9 / img.naturalWidth, window.innerHeight * 0.84 / img.naturalHeight);
        img.style.width = (img.naturalWidth * scale) + 'px';
        img.style.height = (img.naturalHeight * scale) + 'px';
    }

    document.addEventListener('load', function imageLoaded(event) {
        if (event.target.tagName === 'IMG') sizeImage(event.target);
    }, true);

    window.addEventListener('resize', function resizeGallery() {
        document.querySelectorAll('.st-gallery .lightbox [data-lightbox-img], .st-gallery-lightbox [data-lightbox-img]').forEach(sizeImage);
    });

    document.querySelectorAll('.st-gallery .lightbox [data-lightbox-img], .st-gallery-lightbox [data-lightbox-img]').forEach(sizeImage);
}());
