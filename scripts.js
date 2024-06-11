// scripts.js
//   const API_KEY = 'AIzaSyDaCJQhs3fz-k7hg-j0NQWj0S1r7ZEvThs';
//   const CHANNEL_ID = 'UCbvXNK-13KBK_yZuZ5YeLZw';

// scripts.js

document.addEventListener('DOMContentLoaded', () => {
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

    // Fetch YouTube videos
    function fetchYouTubeVideos() {
        $.get(`https://www.googleapis.com/youtube/v3/search?key=${CONFIG.YOUTUBE_API_KEY}&channelId=${CONFIG.CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`, function(data) {
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
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('YouTube API Error: ', textStatus, errorThrown);
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

    // Load Disqus
    function loadDisqus() {
        var d = document, s = d.createElement('script');
        s.src = `https://${CONFIG.DISQUS_SHORTNAME}.disqus.com/embed.js`;
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    }

    // Initialize Disqus configuration
    window.disqus_config = function () {
        this.page.url = CONFIG.DISQUS_PAGE_URL;
        this.page.identifier = CONFIG.DISQUS_PAGE_IDENTIFIER;
    };

    // Initialize Google Calendar
    function initializeCalendar() {
        const calendarIframe = document.getElementById('google-calendar');
        calendarIframe.src = `https://calendar.google.com/calendar/embed?src=${CONFIG.GOOGLE_CALENDAR_ID}&ctz=America%2FLos_Angeles`;
    }

    fetchYouTubeVideos();
    loadDisqus();
    initializeCalendar();
});
