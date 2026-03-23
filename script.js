// ============================================
// I Can — Landing Page Scripts
// ============================================

// --- Countdown Timer ---
function updateCountdown() {
    const launch = new Date('2026-04-05T00:00:00').getTime();
    const now = new Date().getTime();
    const diff = launch - now;

    if (diff <= 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// --- Navbar Scroll Effect ---
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- Mobile Menu ---
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
    });
});

// --- Scroll Animations (lightweight AOS replacement) ---
function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-aos]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

initScrollAnimations();

// --- Animated Counter ---
function animateCounters() {
    const counters = document.querySelectorAll('.proof-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                const duration = 1500;
                const start = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(eased * target);

                    entry.target.textContent = current;

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        entry.target.textContent = target;
                    }
                }

                requestAnimationFrame(update);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

animateCounters();

// --- Smooth Scroll for CTA buttons ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Use a larger offset for the waitlist so the full card is visible
            const isWaitlist = this.getAttribute('href') === '#waitlist';
            const offset = isWaitlist ? 20 : 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// --- Waitlist Form (FreeWaitlists API) ---
const WAITLIST_API = 'https://api.freewaitlists.com/waitlists/cmmm4zm8700kc01pnlrna6kbg';
const waitlistBtn = document.getElementById('waitlistBtn');
const waitlistEmail = document.getElementById('waitlistEmail');

waitlistBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = waitlistEmail.value.trim();

    if (!email || !email.includes('@')) {
        waitlistEmail.style.borderColor = '#ef4444';
        waitlistEmail.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        setTimeout(() => {
            waitlistEmail.style.borderColor = '';
            waitlistEmail.style.boxShadow = '';
        }, 2000);
        return;
    }

    // Disable while submitting
    waitlistBtn.disabled = true;
    waitlistEmail.disabled = true;
    waitlistBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><circle cx="12" cy="12" r="10" stroke-dasharray="50" stroke-dashoffset="20"/></svg>
        Joining...
    `;

    try {
        const res = await fetch(WAITLIST_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (res.ok) {
            waitlistBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/></svg>
                You're on the list!
            `;
            waitlistBtn.style.background = 'linear-gradient(135deg, #059669, #14b8a6)';
            waitlistEmail.value = '';
        } else {
            const data = await res.json().catch(() => null);
            const msg = data?.message || 'Something went wrong';

            if (msg.toLowerCase().includes('already')) {
                waitlistBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/></svg>
                    Already on the list!
                `;
                waitlistBtn.style.background = 'linear-gradient(135deg, #059669, #14b8a6)';
                waitlistEmail.value = '';
            } else {
                throw new Error(msg);
            }
        }
    } catch (err) {
        waitlistBtn.innerHTML = `Try Again`;
        waitlistBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        waitlistEmail.disabled = false;

        setTimeout(() => {
            waitlistBtn.innerHTML = `
                Join Waitlist
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            `;
            waitlistBtn.style.background = '';
            waitlistBtn.disabled = false;
        }, 2500);
        return;
    }

    // Reset after success (keep success state for 4s)
    setTimeout(() => {
        waitlistBtn.innerHTML = `
            Join Waitlist
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        `;
        waitlistBtn.style.background = '';
        waitlistEmail.disabled = false;
        waitlistBtn.disabled = false;
    }, 4000);
});
