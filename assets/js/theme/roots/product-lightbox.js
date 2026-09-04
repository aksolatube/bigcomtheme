(function () {
    'use strict';

    function initProductLightbox() {
        var gallery = document.querySelector('.productView-images[data-image-gallery]');
        var mainImage = gallery && gallery.querySelector('[data-main-image]');

        if (!gallery || !mainImage || gallery.dataset.productLightboxReady === 'true') return;
        gallery.dataset.productLightboxReady = 'true';

        var mainFigure = gallery.querySelector('[data-image-gallery-main]');
        var imageContainer = gallery.querySelector('.productView-img-container');
        var posterMeta = gallery.querySelector('[data-product-gallery-video-poster]');
        var videoTriggers = gallery.querySelectorAll('[data-product-gallery-video-trigger]');
        var videoUrl = videoTriggers.length ? safeMediaUrl(videoTriggers[0].getAttribute('data-video-url')) : '';
        var posterUrl = safeMediaUrl(posterMeta && posterMeta.getAttribute('data-video-poster-url'));
        var mainVideoStage = null;
        var mainVideo = null;

        if (!imageContainer) return;

        function safeMediaUrl(value) {
            var parser;

            if (!value) return '';
            parser = document.createElement('a');
            parser.href = value;

            if (parser.protocol !== 'http:' && parser.protocol !== 'https:') return '';
            return parser.href;
        }

        function setMp4Source(video, url) {
            var source;

            if (!video) return;
            while (video.firstChild) video.removeChild(video.firstChild);
            video.removeAttribute('src');
            source = document.createElement('source');
            source.src = url;
            source.type = 'video/mp4';
            video.appendChild(source);
            video.load();
        }

        function productDetails() {
            var product = document.querySelector('.productView');
            var title = document.querySelector('.productView-title');

            return {
                product_id: product && product.getAttribute('data-entity-id') || '',
                product_name: product && product.getAttribute('data-name') || title && title.textContent.trim() || '',
                video_url: videoUrl
            };
        }

        function sendVideoEvent(eventName, context, progress) {
            var details;
            var eventData;

            window.dataLayer = window.dataLayer || [];
            details = productDetails();
            eventData = {
                event: eventName,
                product_id: details.product_id,
                product_name: details.product_name,
                video_url: details.video_url,
                media_context: context
            };

            if (typeof progress === 'number') eventData.video_percent = progress;
            window.dataLayer.push(eventData);
        }

        function trackVideo(video, context) {
            var state = {
                started: false,
                completed: false,
                milestones: {}
            };

            video.addEventListener('play', function () {
                if (state.started) return;
                state.started = true;
                sendVideoEvent('pdp_video_start', context);
            });

            video.addEventListener('timeupdate', function () {
                var percent;

                if (!video.duration || !isFinite(video.duration)) return;
                percent = Math.floor((video.currentTime / video.duration) * 100);

                [25, 50, 75].forEach(function (milestone) {
                    if (percent >= milestone && !state.milestones[milestone]) {
                        state.milestones[milestone] = true;
                        sendVideoEvent('pdp_video_progress', context, milestone);
                    }
                });
            });

            video.addEventListener('ended', function () {
                if (state.completed) return;
                state.completed = true;
                sendVideoEvent('pdp_video_complete', context, 100);
            });
        }

        function pauseAndReset(video) {
            if (!video) return;
            video.pause();
            try {
                video.currentTime = 0;
            } catch (error) {
                // Some browsers do not expose currentTime until metadata loads.
            }
        }

        function captureVideoState(video) {
            if (!video) return null;

            return {
                currentTime: isFinite(video.currentTime) ? video.currentTime : 0,
                muted: video.muted,
                volume: video.volume,
                playbackRate: video.playbackRate || 1,
                shouldPlay: !video.paused && !video.ended
            };
        }

        function restoreVideoState(video, state) {
            var restored = false;
            var restoreId;

            if (!video || !state) return;
            restoreId = (video.productGalleryRestoreId || 0) + 1;
            video.productGalleryRestoreId = restoreId;

            function restore() {
                var targetTime = state.currentTime;

                if (restored) return;
                restored = true;
                video.removeEventListener('loadedmetadata', restore);
                if (video.productGalleryRestoreId !== restoreId) return;
                video.muted = state.muted;
                video.volume = state.volume;
                video.playbackRate = state.playbackRate;

                if (isFinite(video.duration)) targetTime = Math.min(targetTime, video.duration);
                try {
                    video.currentTime = targetTime;
                } catch (error) {
                    // The browser will retain the source even if it cannot seek yet.
                }

                if (state.shouldPlay) {
                    playVideo(video);
                }
            }

            if (video.readyState >= 1) {
                restore();
            } else {
                video.addEventListener('loadedmetadata', restore);
            }
        }

        function playVideo(video) {
            var playAttempt;

            if (!video) return;
            playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === 'function') {
                playAttempt.catch(function () {
                    // Keep the native play control truthful when a physical
                    // mobile browser rejects or postpones playback.
                    video.pause();
                });
            }
        }

        function clearActiveThumbnails() {
            Array.prototype.forEach.call(gallery.querySelectorAll('.productView-thumbnail-link'), function (link) {
                link.classList.remove('is-active');
            });
        }

        function hideMainVideo() {
            if (!mainVideoStage || mainVideoStage.hidden) return;
            pauseAndReset(mainVideo);
            mainVideoStage.hidden = true;
            mainFigure.classList.remove('is-showing-video');
            gallery.setAttribute('data-active-media', 'image');
        }

        function showMainVideo(activeTrigger) {
            if (!mainVideoStage || !videoUrl) return;
            if (!mainVideo.querySelector('source')) {
                setMp4Source(mainVideo, videoUrl);
                if (posterUrl) mainVideo.poster = posterUrl;
            }
            clearActiveThumbnails();
            activeTrigger.classList.add('is-active');
            mainFigure.classList.add('is-showing-video');
            mainVideoStage.hidden = false;
            gallery.setAttribute('data-active-media', 'video');
            if (mainVideo.networkState === 0) mainVideo.load();
            playVideo(mainVideo);
        }

        if (videoTriggers.length && !videoUrl) {
            Array.prototype.forEach.call(videoTriggers, function (videoTrigger) {
                var item = videoTrigger.closest('[data-product-gallery-video]');
                if (item) item.hidden = true;
            });
        }

        if (videoUrl) {
            mainVideoStage = document.createElement('div');
            mainVideoStage.className = 'productView-video-stage';
            mainVideoStage.hidden = true;
            mainVideoStage.innerHTML = '<video class="productView-video" controls playsinline webkit-playsinline preload="none" aria-label="Product video"></video>';
            imageContainer.appendChild(mainVideoStage);
            mainVideo = mainVideoStage.querySelector('video');
            trackVideo(mainVideo, 'pdp_gallery');

            gallery.addEventListener('click', function (event) {
                var videoTrigger = event.target.closest('[data-product-gallery-video-trigger]');
                var imageTrigger = event.target.closest('[data-image-gallery-item]');

                if (videoTrigger) {
                    event.preventDefault();
                    event.stopPropagation();
                    showMainVideo(videoTrigger);
                    return;
                }

                if (imageTrigger) hideMainVideo();
            });

            if (window.MutationObserver) {
                new MutationObserver(function () {
                    if (gallery.getAttribute('data-active-media') === 'video') hideMainVideo();
                }).observe(mainImage, {
                    attributes: true,
                    attributeFilter: ['src', 'srcset']
                });
            }

            var thumbnailList = gallery.querySelector('.productView-thumbnails');
            if (thumbnailList) {
                thumbnailList.setAttribute('data-arrow-label', 'Product media ' + thumbnailList.children.length);
            }
        }

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'productLightbox-trigger';
        trigger.innerHTML = [
            '<svg class="productLightbox-triggerIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
                '<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>',
            '</svg>'
        ].join('');
        trigger.setAttribute('aria-label', 'View product media full screen');
        trigger.setAttribute('title', 'View full screen');

        // Keep the control anchored to the visible media stage. It is a sibling
        // of the image link, so its tap cannot trigger the product-image zoom.
        imageContainer.appendChild(trigger);

        var overlay = document.createElement('div');
        overlay.className = 'productLightbox';
        overlay.hidden = true;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Product media gallery');
        overlay.innerHTML = [
            '<button type="button" class="productLightbox-close" aria-label="Close full-screen product media">&times;</button>',
            '<button type="button" class="productLightbox-arrow productLightbox-prev" aria-label="Previous product media">&#8249;</button>',
            '<div class="productLightbox-stage">',
                '<img class="productLightbox-image" alt="">',
                '<video class="productLightbox-video" controls playsinline webkit-playsinline preload="none" aria-label="Product video" hidden></video>',
                '<span class="productLightbox-count" aria-live="polite"></span>',
            '</div>',
            '<button type="button" class="productLightbox-arrow productLightbox-next" aria-label="Next product media">&#8250;</button>'
        ].join('');
        document.body.appendChild(overlay);

        var lightboxImage = overlay.querySelector('.productLightbox-image');
        var lightboxVideo = overlay.querySelector('.productLightbox-video');
        var count = overlay.querySelector('.productLightbox-count');
        var closeButton = overlay.querySelector('.productLightbox-close');
        var previousButton = overlay.querySelector('.productLightbox-prev');
        var nextButton = overlay.querySelector('.productLightbox-next');
        var items = [];
        var index = 0;
        var previouslyFocused = null;
        var previousBodyOverflow = '';
        var previousScrollX = 0;
        var previousScrollY = 0;
        var touchStartX = null;
        var mainVideoIsInLightbox = false;

        if (videoUrl) trackVideo(lightboxVideo, 'pdp_lightbox');

        function addItem(type, url, alt, poster) {
            if (!url || url === '#' || /^javascript:/i.test(url)) return;
            if (items.some(function (item) { return item.type === type && item.url === url; })) return;
            items.push({
                type: type,
                url: url,
                alt: alt || (type === 'video' ? 'Product video' : 'Product image'),
                poster: poster || ''
            });
        }

        function imageUrl(image, link) {
            return (link && link.getAttribute('href')) ||
                image.getAttribute('data-zoom-image') ||
                image.getAttribute('data-src') ||
                image.currentSrc ||
                image.src;
        }

        function rebuildItems() {
            var currentMain = gallery.querySelector('[data-main-image]');
            var currentLink = currentMain && currentMain.closest('a');
            var currentUrl = currentMain && imageUrl(currentMain, currentLink);

            items = [];

            Array.prototype.forEach.call(gallery.querySelectorAll('.productView-thumbnail-link'), function (link) {
                var thumb;
                var item;

                if (link.closest('.slick-cloned')) return;

                if (link.hasAttribute('data-product-gallery-video-trigger')) {
                    addItem('video', safeMediaUrl(link.getAttribute('data-video-url')), 'Product video', posterUrl);
                    return;
                }

                if (!link.hasAttribute('data-image-gallery-item')) return;
                thumb = link.querySelector('img');
                addItem(
                    'image',
                    link.getAttribute('data-image-gallery-zoom-image-url') || link.getAttribute('href') || (thumb && imageUrl(thumb, link)),
                    thumb && thumb.alt
                );
            });

            // Thumbnail links are the authoritative gallery order. Their zoom
            // URLs can use a different BigCommerce image-size form than the
            // currently rendered main image, so URL equality can falsely make
            // the first image look unique and insert it twice. Only fall back
            // to the main image when the product has no image thumbnails.
            if (currentMain && !items.some(function (item) { return item.type === 'image'; })) {
                items.unshift({ type: 'image', url: currentUrl, alt: currentMain.alt || 'Product image', poster: '' });
            }
        }

        function preload(position) {
            var item;
            var preloadImage;

            if (!items.length) return;
            item = items[(position + items.length) % items.length];
            if (item.type !== 'image') return;
            preloadImage = new Image();
            preloadImage.src = item.url;
        }

        function stopLightboxVideo() {
            if (mainVideoIsInLightbox && mainVideo) {
                mainVideo.pause();
                mainVideo.classList.remove('productLightbox-video');
                mainVideoStage.appendChild(mainVideo);
                mainVideoIsInLightbox = false;
            }
            if (lightboxVideo.hidden) return;
            lightboxVideo.productGalleryRestoreId = (lightboxVideo.productGalleryRestoreId || 0) + 1;
            pauseAndReset(lightboxVideo);
            while (lightboxVideo.firstChild) lightboxVideo.removeChild(lightboxVideo.firstChild);
            lightboxVideo.removeAttribute('src');
            lightboxVideo.load();
            lightboxVideo.hidden = true;
        }

        function show(position, videoState) {
            var item;
            var hasMultipleItems;

            if (!items.length) return;
            index = (position + items.length) % items.length;
            item = items[index];
            stopLightboxVideo();
            lightboxImage.hidden = true;

            if (item.type === 'video') {
                if (mainVideo) {
                    if (!mainVideo.querySelector('source')) {
                        setMp4Source(mainVideo, item.url);
                        if (item.poster) mainVideo.poster = item.poster;
                    }
                    mainVideo.classList.add('productLightbox-video');
                    mainVideo.hidden = false;
                    overlay.querySelector('.productLightbox-stage').insertBefore(mainVideo, count);
                    mainVideoIsInLightbox = true;
                    if (videoState) restoreVideoState(mainVideo, videoState);
                    else playVideo(mainVideo);
                } else {
                    if (item.poster) lightboxVideo.poster = item.poster;
                    lightboxVideo.hidden = false;
                    setMp4Source(lightboxVideo, item.url);
                    if (videoState) restoreVideoState(lightboxVideo, videoState);
                    else playVideo(lightboxVideo);
                }
            } else {
                lightboxImage.src = item.url;
                lightboxImage.alt = item.alt;
                lightboxImage.hidden = false;
            }

            count.textContent = (index + 1) + ' / ' + items.length;
            hasMultipleItems = items.length > 1;
            previousButton.hidden = !hasMultipleItems;
            nextButton.hidden = !hasMultipleItems;
            preload(index - 1);
            preload(index + 1);
        }

        function activePosition() {
            var activeLink;
            var activeUrl;
            var foundIndex;

            if (gallery.getAttribute('data-active-media') === 'video') {
                foundIndex = items.findIndex(function (item) { return item.type === 'video' && item.url === videoUrl; });
                return foundIndex >= 0 ? foundIndex : 0;
            }

            activeLink = gallery.querySelector('[data-image-gallery-item].is-active');
            activeUrl = activeLink && (activeLink.getAttribute('data-image-gallery-zoom-image-url') || activeLink.getAttribute('href'));
            if (!activeUrl) activeUrl = imageUrl(mainImage, mainImage.closest('a'));
            foundIndex = items.findIndex(function (item) { return item.type === 'image' && item.url === activeUrl; });
            return foundIndex >= 0 ? foundIndex : 0;
        }

        function openLightbox() {
            var inlineVideoState = null;

            rebuildItems();
            if (!items.length) return;

            if (mainVideo && gallery.getAttribute('data-active-media') === 'video') {
                inlineVideoState = captureVideoState(mainVideo);
                mainVideo.pause();
            }
            previouslyFocused = document.activeElement;
            previousBodyOverflow = document.body.style.overflow;
            previousScrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
            previousScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
            document.body.style.overflow = 'hidden';
            overlay.hidden = false;
            show(activePosition(), inlineVideoState);
            closeButton.focus();
        }

        function openActiveVideoFullscreen() {
            var fullscreenAttempt;

            if (!mainVideo || gallery.getAttribute('data-active-media') !== 'video') return false;

            // On physical mobile devices the most reliable path is the custom
            // full-screen viewer reusing this exact video node. Returning false
            // opens that viewer without recreating or reloading the player.
            if (window.matchMedia && window.matchMedia('(max-width: 800px)').matches) return false;

            // iPhone and older iPad Safari expose native video full screen
            // through this video-specific method. It keeps the same element,
            // playback position, and controls instead of creating a new player.
            if (typeof mainVideo.webkitEnterFullscreen === 'function') {
                try {
                    mainVideo.webkitEnterFullscreen();
                    return true;
                } catch (error) {
                    // Continue to the standards-based API or custom viewer.
                }
            }

            if (typeof mainVideo.requestFullscreen === 'function') {
                try {
                    fullscreenAttempt = mainVideo.requestFullscreen();
                    if (fullscreenAttempt && typeof fullscreenAttempt.catch === 'function') {
                        fullscreenAttempt.catch(function () {});
                    }
                    return true;
                } catch (error) {
                    // Fall back to the mixed-media viewer below.
                }
            }

            return false;
        }

        function closeLightbox() {
            var lightboxVideoState = null;

            if (overlay.hidden) return;
            if (items[index] && items[index].type === 'video') {
                lightboxVideoState = captureVideoState(mainVideoIsInLightbox ? mainVideo : lightboxVideo);
            }
            overlay.hidden = true;
            document.body.style.overflow = previousBodyOverflow;
            lightboxImage.removeAttribute('src');
            stopLightboxVideo();
            if (lightboxVideoState && mainVideo && gallery.getAttribute('data-active-media') === 'video') {
                restoreVideoState(mainVideo, lightboxVideoState);
            }
            window.scrollTo(previousScrollX, previousScrollY);
            if (previouslyFocused && previouslyFocused.focus) {
                try {
                    previouslyFocused.focus({ preventScroll: true });
                } catch (error) {
                    previouslyFocused.focus();
                }
            }
            window.requestAnimationFrame(function () {
                window.scrollTo(previousScrollX, previousScrollY);
            });
        }

        var lastTouchActivation = 0;

        trigger.addEventListener('touchstart', function (event) {
            event.stopPropagation();
        }, { passive: true });

        trigger.addEventListener('touchend', function (event) {
            event.preventDefault();
            event.stopPropagation();
            lastTouchActivation = Date.now();
            if (!openActiveVideoFullscreen()) openLightbox();
        }, { passive: false });

        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (Date.now() - lastTouchActivation < 700) return;
            if (!openActiveVideoFullscreen()) openLightbox();
        });
        closeButton.addEventListener('click', closeLightbox);
        previousButton.addEventListener('click', function () { show(index - 1); });
        nextButton.addEventListener('click', function () { show(index + 1); });

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) closeLightbox();
        });

        overlay.addEventListener('touchstart', function (event) {
            if (event.target === lightboxVideo || event.target === mainVideo) {
                touchStartX = null;
                return;
            }
            touchStartX = event.changedTouches[0].clientX;
        }, { passive: true });

        overlay.addEventListener('touchend', function (event) {
            var distance;

            if (event.target === lightboxVideo || event.target === mainVideo || touchStartX === null || items.length < 2) return;
            distance = event.changedTouches[0].clientX - touchStartX;
            if (Math.abs(distance) > 50) show(index + (distance < 0 ? 1 : -1));
            touchStartX = null;
        }, { passive: true });

        document.addEventListener('keydown', function (event) {
            if (overlay.hidden) return;

            if (event.key === 'Escape') closeLightbox();
            if (event.target !== lightboxVideo && event.target !== mainVideo && event.key === 'ArrowLeft') show(index - 1);
            if (event.target !== lightboxVideo && event.target !== mainVideo && event.key === 'ArrowRight') show(index + 1);

            if (event.key === 'Tab') {
                var controls = Array.prototype.filter.call(
                    overlay.querySelectorAll('button:not([hidden]), video:not([hidden])'),
                    function (control) { return control.offsetParent !== null; }
                );
                if (!controls.length) return;
                var first = controls[0];
                var last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProductLightbox);
    } else {
        initProductLightbox();
    }
}());
