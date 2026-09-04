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

export default function pdpLongForm() {
    const root = document.querySelector('[data-pdp-long-form]');
    if (!root) return;

    root.addEventListener('click', event => {
        const navLink = event.target.closest('[data-pdp-story-nav]');
        const videoButton = event.target.closest('[data-pdp-video-id]');

        if (navLink) {
            track('pdp_story_navigation', {
                section_name: navLink.dataset.pdpStoryNav || '',
            });
        }

        if (!videoButton) return;

        const videoId = videoButton.dataset.pdpVideoId || '';
        if (!/^[A-Za-z0-9_-]{6,}$/.test(videoId)) return;

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
