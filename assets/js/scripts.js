document.addEventListener('DOMContentLoaded', () => {
    const loadingSpinner = document.getElementById('loading-spinner');
    window.addEventListener('load', () => {
        loadingSpinner.classList.add('hidden');
    });

    const navToggle = document.getElementById('js-navbar-toggle');
    const menu = document.getElementById('js-menu');

    navToggle.addEventListener('click', () => {
        menu.classList.toggle('active');
    });

    const navLinks = document.querySelectorAll('.navbar a');
    const sections = document.querySelectorAll('section');

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                window.scrollTo({
                    top: targetSection.offsetTop - document.querySelector('.navbar').offsetHeight,
                    behavior: 'smooth'
                });

                // Close the menu on mobile after clicking a link
                if (menu.classList.contains('active')) {
                    menu.classList.remove('active');
                }
            }
        });
    });

    // Intersection Observer for fading in sections
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity = 0;
        observer.observe(section);
    });

    // YouTube Data API Key
    const API_KEY = CONFIG.YOUTUBE_API_KEY;
    const CHANNEL_ID = CONFIG.YOUTUBE_CHANNEL_ID;
    const MAX_RESULTS = 10;

    // Fetch YouTube videos
    function fetchYouTubeVideos() {
        $.get(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}`, function(data) {
            let videoItems = '';
            data.items.forEach(item => {
                if (item.id.kind === "youtube#video") {
                    videoItems += `
                        <div class="carousel-item">
                            <iframe src="https://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    `;
                }
            });
            $('.media-carousel').html(videoItems);
            initializeCarousel();
        });
    }

    // Initialize Slick carousel
    function initializeCarousel() {
        $('.media-carousel').slick({
            infinite: true,
            slidesToShow: 5,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            arrows: true,
            dots: true,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    // Initialize Spotlight carousel
    function initializeSpotlightCarousel() {
        $('.spotlight-carousel').slick({
            infinite: true,
            slidesToShow: 2,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            arrows: true,
            dots: true,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        centerMode: true,
                        centerPadding: '20px'
                    }
                }
            ]
        });
    }

    // Disqus configuration
    const disqus_config = function () {
        this.page.url = CONFIG.DISQUS_PAGE_URL;
        this.page.identifier = CONFIG.DISQUS_PAGE_IDENTIFIER;
    };

    (function() {
        const d = document, s = d.createElement('script');
        s.src = `https://${CONFIG.DISQUS_SHORTNAME}.disqus.com/embed.js`;
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();

    // Load Google Calendar
    const googleCalendarSrc = `https://calendar.google.com/calendar/embed?src=${CONFIG.GOOGLE_CALENDAR_ID}&ctz=America%2FLos_Angeles`;
    document.getElementById('google-calendar').src = googleCalendarSrc;

    // Initialize AOS
    AOS.init();

    // Initialize the media carousel
    fetchYouTubeVideos();
    initializeCarousel();

    // Initialize Spotlight carousel
    initializeSpotlightCarousel();

    // Initialize testimonials carousel
    initializeTestimonialsCarousel();

    // Lazy load images
    const lazyImages = document.querySelectorAll('img.lazy');
    const lazyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                lazyObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => {
        lazyObserver.observe(img);
    });

    const backToTop = document.querySelector('.back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    });

    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

function initializeTestimonialsCarousel() {
    $('.testimonials-carousel').slick({
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        dots: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });
}
