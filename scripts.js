// scripts.js
//   const API_KEY = 'AIzaSyDaCJQhs3fz-k7hg-j0NQWj0S1r7ZEvThs';
//   const CHANNEL_ID = 'UCbvXNK-13KBK_yZuZ5YeLZw';

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
        $.get(`https://www.googleapis.com/youtube/v3/search?key=${CONFIG.YOUTUBE_API_KEY}&channelId=${CONFIG.YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`, function(data) {
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
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            arrows: true,
            dots: true,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    // Initialize YouTube background
    $('#youtube-background').youtube_background();

    // Initialize Facebook integration
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Initialize Disqus
    var disqus_config = function () {
        this.page.url = CONFIG.DISQUS_PAGE_URL;
        this.page.identifier = CONFIG.DISQUS_PAGE_IDENTIFIER;
    };

    (function() {
        var d = document, s = d.createElement('script');
        s.src = 'https://' + CONFIG.DISQUS_SHORTNAME + '.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();

    // Initialize Google Calendar
    $('#google-calendar').attr('src', `https://calendar.google.com/calendar/embed?src=${CONFIG.GOOGLE_CALENDAR_ID}&ctz=America%2FLos_Angeles`);

    fetchYouTubeVideos();
});
