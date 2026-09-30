/* Shared enhancements: public content remains visible when services fail. */
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('js-menu');
    const toggle = document.getElementById('js-navbar-toggle');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const expanded = menu.classList.toggle('active');
            toggle.setAttribute('aria-expanded', String(expanded));
        });
        menu.addEventListener('click', event => {
            if (event.target.closest('a')) {
                menu.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.remove();
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
    if (typeof AOS !== 'undefined') AOS.init();

    // Only load videos on a page with a destination. External failures leave
    // the permanent channel link and featured footage available.
    const videoList = document.getElementById('video-list');
    if (videoList && typeof CONFIG !== 'undefined' && CONFIG.YOUTUBE_API_KEY) {
        const params = new URLSearchParams({
            key: CONFIG.YOUTUBE_API_KEY, channelId: CONFIG.YOUTUBE_CHANNEL_ID,
            part: 'snippet', order: 'date', maxResults: '3', type: 'video'
        });
        fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
            signal: AbortSignal.timeout(8000)
        }).then(response => {
            if (!response.ok) throw new Error('Video service unavailable');
            return response.json();
        }).then(data => {
            for (const item of data.items || []) {
                if (!/^[\w-]{11}$/.test(item.id?.videoId || '')) continue;
                const link = document.createElement('a');
                link.href = `https://www.youtube.com/watch?v=${item.id.videoId}`;
                link.target = '_blank'; link.rel = 'noopener';
                const date = new Date(item.snippet?.publishedAt);
                if (!Number.isNaN(date.getTime())) {
                    const time = document.createElement('time');
                    time.dateTime = date.toISOString();
                    time.textContent = date.toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                    });
                    link.append(time);
                }
                const title = document.createElement('h4');
                title.textContent = item.snippet?.title || 'Watch the video';
                link.append(title); videoList.append(link);
            }
            if (videoList.children.length) document.getElementById('latest-videos').hidden = false;
        }).catch(() => { /* Keep permanent fallback links visible. */ });
    }
    // Discussion is optional and loads only when explicitly opened.
    const thread = document.getElementById('disqus_thread');
    const discussion = thread?.closest('details');
    if (discussion && typeof CONFIG !== 'undefined') {
        discussion.addEventListener('toggle', () => {
            if (!discussion.open || thread.dataset.loaded) return;
            thread.dataset.loaded = 'true';
            window.disqus_config = function () {
                this.page.url = CONFIG.DISQUS_PAGE_URL;
                this.page.identifier = CONFIG.DISQUS_PAGE_IDENTIFIER;
            };
            const script = document.createElement('script');
            script.src = `https://${CONFIG.DISQUS_SHORTNAME}.disqus.com/embed.js`;
            script.async = true; document.body.append(script);
        });
    }
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) window.addEventListener('scroll', () => {
        backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
    }, { passive: true });
    const snipcart = document.getElementById('snipcart');
    if (snipcart && typeof CONFIG !== 'undefined') snipcart.dataset.apiKey = CONFIG.SNIPCART_API_KEY;
});
