---
layout: default
title: Home
---

<header class="header" id="home">
    <div class="video-overlay">
        <iframe id="youtube-iframe" src="https://www.youtube.com/embed/RPGg_y2FHNs?autoplay=1&mute=1&loop=1&playlist=RPGg_y2FHNs" title="Welcome Video" aria-label="Welcome Video"></iframe>
    </div>
    <div class="header-content">
        <div class="header-overlay">
            <h1 class="header-title">Welcome to iMOB Racing</h1>
            <p class="header-subtitle">Feel the Thrill of Racing</p>
            <a href="#about" class="cta-button" aria-label="Learn more about iMOB Racing">Learn More</a>
            <a href="login.html" class="cta-button subscribe-button" aria-label="Login">Login</a>
            <div class="social-proof">
                <p><i class="fas fa-users"></i> 10k followers on Instagram</p>
                <p><i class="fas fa-trophy"></i> Featured in Top Gear</p>
            </div>
        </div>
    </div>
</header>

<section id="about" class="about-section parallax" data-aos="fade-up">
    <h2>About Us</h2>
    <div class="about-content">
        <div class="about-icon">
            <i class="fas fa-car"></i>
        </div>
        <p>At iMOB Racing, our ambition is to become the premier team in the racing industry. Comprising dedicated racecar modders and enthusiasts, we specialize in time attack racing while also participating in 4x4, rally, drifting, off-road, street bikes, dirt bikes, and crosskarts. We pride ourselves on being 100% built, not bought, with a commitment to modifying and customizing any vehicle.</p>
    </div>
    <div class="about-content">
        <div class="about-icon">
            <i class="fas fa-users"></i>
        </div>
        <p>Our co-founders, Anthony Yorba and Tony Langston, drive the team with their technical expertise and artistic vision. Leading the charge on the track, our top driver, Chris Statler, epitomizes our racing spirit, while our youngest member, Daniel Bertholf, stands out in the drifting scene.</p>
    </div>
    <div class="about-content">
        <div class="about-icon">
            <i class="fas fa-video"></i>
        </div>
        <p>We are dedicated to expanding our brand through dynamic race footage, informative repair videos, and exclusive behind-the-scenes content. Additionally, we offer engaging giveaways and forums for discussions, event updates, and buy/sell opportunities.</p>
    </div>
</section>

<section id="events" class="events-section parallax" data-aos="fade-up">
    <h2>Upcoming Events</h2>
    <div class="events-container">
        <ul class="events-list">
            <li>
                <h3>TT Event 3</h3>
                <p>Date: June 22, 2024</p>
                <p>Location: Thunderhill, Willows, Ca</p>
            </li>
            <li>
                <h3>TT Event 4</h3>
                <p>Date: September 20, 2024</p>
                <p>Location: Thunderhill, Willows, Ca</p>
            </li>
        </ul>
        <div class="calendar-container">
            <iframe id="google-calendar" src="" width="100%" height="300" frameborder="0" scrolling="no"></iframe>
        </div>
    </div>
</section>

<section id="contact" class="contact-section" data-aos="fade-up">
    <h2>Contact Us</h2>
    <form name="contact" method="POST" data-netlify="true">
        <p>
            <label>Name: <input type="text" id="name" name="name" required></label>
        </p>
        <p>
            <label>Email: <input type="email" id="email" name="email" required></label>
        </p>
        <p>
            <label>Message: <textarea id="message" name="message" required></textarea></label>
        </p>
        <p>
            <button type="submit">Send Message</button>
        </p>
    </form>
    <p>Phone: (530) 420-5850</p>
    <p>Email: info@imobracingonline.com</p>
</section>
