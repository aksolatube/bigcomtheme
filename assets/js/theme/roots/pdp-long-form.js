function installVideoCarousel(root) {
    root.querySelectorAll('.pdpLongForm-videoGrid').forEach((grid, index) => {
        const buttons = Array.from(grid.querySelectorAll('[data-pdp-video-id]'));
        if (buttons.length < 2) return;
        grid.classList.add('pdpLongForm-videoCarousel');
        grid.id = grid.id || `pdp-video-carousel-${index}`;
        grid.setAttribute('tabindex', '0');
        grid.setAttribute('role', 'region');
        grid.setAttribute('aria-label', 'Product videos');
        buttons.forEach(button => {
            const slide = document.createElement('div');
            slide.className = 'pdpLongForm-videoSlide';
            button.before(slide);
            slide.appendChild(button);
            slide.videoPoster = button.cloneNode(true);
        });
        const controls = document.createElement('div');
        controls.className = 'pdpLongForm-videoControls';
        controls.innerHTML = `<button type="button" aria-label="Previous videos" aria-controls="${grid.id}">\u2190</button><span>Browse videos</span><button type="button" aria-label="Next videos" aria-controls="${grid.id}">\u2192</button>`;
        grid.after(controls);
        const [previous, next] = controls.querySelectorAll('button');
        const update = () => {
            const overflow = grid.scrollWidth > grid.clientWidth + 2;
            controls.hidden = !overflow;
            previous.disabled = grid.scrollLeft <= 2;
            next.disabled = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 2;
            const bounds = grid.getBoundingClientRect();
            grid.querySelectorAll('.pdpLongForm-videoSlide').forEach(slide => {
                const rect = slide.getBoundingClientRect();
                const frame = slide.querySelector('iframe');
                if (frame && (rect.right <= bounds.left || rect.left >= bounds.right)) {
                    frame.replaceWith(slide.videoPoster.cloneNode(true));
                }
            });
        };
        const move = direction => {
            const slide = grid.firstElementChild;
            const distance = slide.getBoundingClientRect().width + 20;
            grid.scrollBy({ left: direction * distance, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        };
        previous.addEventListener('click', () => move(-1));
        next.addEventListener('click', () => move(1));
        grid.addEventListener('scroll', update, { passive: true });
        grid.addEventListener('keydown', event => {
            if (event.target !== grid || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
            event.preventDefault();
            move(event.key === 'ArrowLeft' ? -1 : 1);
        });
        if (window.ResizeObserver) new ResizeObserver(update).observe(grid);
        else window.addEventListener('resize', update);
        update();
    });
}

function track(eventName, details) {
    window.dataLayer = window.dataLayer || [];

    function queueGtagCommand() {
        window.dataLayer.push(arguments);
    }

    queueGtagCommand('event', eventName, Object.assign({
        page_path: window.location.pathname,
        device_type: window.innerWidth <= 800 ? 'mobile' : 'desktop',
    }, details));
}

function revealStoryTarget(target, focusTarget = target) {
    document.querySelectorAll('.pdpStory-highlight').forEach(item => item.classList.remove('pdpStory-highlight'));
    if (!focusTarget.hasAttribute('tabindex') && !focusTarget.matches('button, summary, input, a')) {
        focusTarget.setAttribute('tabindex', '-1');
    }
    focusTarget.focus({ preventScroll: true });
    const header = document.querySelector('header.header');
    const offset = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    window.scrollTo({
        top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset - 16),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
    clearTimeout(target.pdpHighlightTimer);
    target.classList.add('pdpStory-highlight');
    target.pdpHighlightTimer = setTimeout(() => target.classList.remove('pdpStory-highlight'), 3500);
}

export default function pdpLongForm() {
    const root = document.querySelector('[data-pdp-long-form]');
    if (!root) return;
    installVideoCarousel(root);
    root.querySelectorAll('.pdpLongForm-installVideo .pdpLongForm-videoSlide').forEach(slide => {
        slide.videoPoster = slide.querySelector('[data-pdp-video-id]').cloneNode(true);
    });

    const warning = root.querySelector('#pdp-prop-65');
    const warranty = document.querySelector('.productWarrantyAccordion');
    if (warning && warranty) warranty.after(warning);

    root.addEventListener('click', event => {
        const navLink = event.target.closest('[data-pdp-story-nav]');
        const videoButton = event.target.closest('[data-pdp-video-id]');
        const accessoryLink = event.target.closest('a[href="#complete-your-system"]');
        if (accessoryLink) {
            const selector = document.querySelector('[data-complete-system]');
            const toggle = selector && selector.querySelector('[data-complete-system-toggle]');
            if (selector && !selector.hidden && toggle) {
                event.preventDefault();
                if (toggle.getAttribute('aria-expanded') !== 'true') toggle.click();
                // Keep existing pasted descriptions working; new markup uses explicit types.
                const legacyTypes = {
                    'extension tubes': 'extensionTube',
                    'electric light add-on': 'electricLight',
                    'daylight dimmer': 'dimmer',
                };
                const type = accessoryLink.dataset.pdpAccessory || legacyTypes[accessoryLink.textContent.trim().toLowerCase()];
                const item = Array.from(selector.querySelectorAll('[data-complete-system-type]'))
                    .find(candidate => candidate.dataset.completeSystemType === type && !candidate.hidden);
                revealStoryTarget(item || selector, item || toggle);
                track('pdp_story_accessories_open', {});
            }
        }

        const specsLink = event.target.closest('a[href="#accordion--custom-fields"]');
        if (specsLink) {
            const specs = document.getElementById('accordion--custom-fields');
            if (specs && specs.matches('details')) {
                event.preventDefault();
                specs.open = true;
                revealStoryTarget(specs, specs.querySelector('summary') || specs);
                track('pdp_story_specifications_open', {});
            }
        }

        if (navLink) {
            track('pdp_story_navigation', {
                section_name: navLink.dataset.pdpStoryNav || '',
            });
        }

        if (!videoButton) return;

        const videoId = videoButton.dataset.pdpVideoId || '';
        if (!/^[A-Za-z0-9_-]{6,}$/.test(videoId)) return;

        root.querySelectorAll('.pdpLongForm-videoSlide').forEach(slide => {
            const playing = slide.querySelector('iframe');
            if (playing) playing.replaceWith(slide.videoPoster.cloneNode(true));
        });
        const iframe = document.createElement('iframe');
        iframe.className = 'pdpLongForm-videoFrame';
        iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
        iframe.title = videoButton.dataset.pdpVideoTitle || 'Product video';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        videoButton.replaceWith(iframe);

        track('pdp_story_video_start', {
            video_id: videoId,
            video_title: iframe.title,
        });
    });
}
