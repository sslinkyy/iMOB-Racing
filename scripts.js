// scripts.js
//   const API_KEY = 'AIzaSyDaCJQhs3fz-k7hg-j0NQWj0S1r7ZEvThs';
//   const CHANNEL_ID = 'UCbvXNK-13KBK_yZuZ5YeLZw';

ddocument.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.navbar a');
    const sections = document.querySelectorAll('section');

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            window.scrollTo({
                top: targetSection.offsetTop - document.querySelector('.navbar').offsetHeight,
                behavior: 'smooth'
            });
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

    // YouTube Data API Key and Channel ID from config.js
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

    // Initialize YouTube background
    $('#youtube-background').youtube_background();

    // Load Facebook page
    const facebookPageUrl = CONFIG.FACEBOOK_PAGE_URL;
    $('.fb-page').attr('data-href', facebookPageUrl);

    // Load Google Form URL
    const googleFormUrl = CONFIG.GOOGLE_FORM_URL;
    $('.poll-integration iframe').attr('src', googleFormUrl);

    // Load Google Calendar
    const googleCalendarId = CONFIG.GOOGLE_CALENDAR_ID;
    $('#google-calendar').attr('src', `https://calendar.google.com/calendar/embed?src=${googleCalendarId}&ctz=America%2FLos_Angeles`);

    // Load Disqus
    const disqusShortname = CONFIG.DISQUS_SHORTNAME;
    const disqusPageUrl = CONFIG.DISQUS_PAGE_URL;
    const disqusPageIdentifier = CONFIG.DISQUS_PAGE_IDENTIFIER;

    window.disqus_config = function () {
        this.page.url = disqusPageUrl;
        this.page.identifier = disqusPageIdentifier;
    };

    (function() {
        var d = document, s = d.createElement('script');
        s.src = 'https://' + disqusShortname + '.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();

    fetchYouTubeVideos();
});
