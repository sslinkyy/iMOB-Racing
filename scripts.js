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

    // YouTube Data API Key
    const API_KEY = 'AIzaSyDaCJQhs3fz-k7hg-j0NQWj0S1r7ZEvThs';
    const CHANNEL_ID = 'UCbvXNK-13KBK_yZuZ5YeLZw';
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
$(document).ready(function(){
    // Initialize the media carousel
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

    // Initialize YouTube background
    $('#youtube-background').youtube_background();
});

    fetchYouTubeVideos();
});
