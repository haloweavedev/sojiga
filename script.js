/* ==========================================
   SŌJIGA BAKEHOUSE — SCRIPTS
   ========================================== */

(function () {
    'use strict';

    // --- PRELOADER ---
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        setTimeout(() => preloader.classList.add('hidden'), 800);
        setTimeout(() => { preloader.style.display = 'none'; }, 1400);
    });

    // --- NAVBAR SCROLL EFFECT ---
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    function handleNavScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link highlight
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // --- MOBILE MENU ---
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // --- SCROLL ANIMATIONS ---
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger siblings
                const parent = entry.target.parentElement;
                const siblings = parent.querySelectorAll('.animate-on-scroll');
                let delay = 0;
                siblings.forEach(sib => {
                    if (sib === entry.target) {
                        entry.target.style.transitionDelay = delay + 'ms';
                    }
                });
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 50);
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach((el, i) => {
        // Set staggered delays within each section
        const section = el.closest('.section');
        if (section) {
            const sectionEls = section.querySelectorAll('.animate-on-scroll');
            const index = Array.from(sectionEls).indexOf(el);
            el.style.transitionDelay = (index * 80) + 'ms';
        }
        scrollObserver.observe(el);
    });

    // --- MENU TABS ---
    const menuTabs = document.querySelectorAll('.menu-tab');
    const menuCards = document.querySelectorAll('.menu-card');

    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;

            menuTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            menuCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeInUp 0.4s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // --- ORDER SYSTEM ---
    const cart = {};
    const orderItemsEl = document.getElementById('orderItems');
    const orderTotalEl = document.getElementById('orderTotal');
    const subtotalEl = document.getElementById('subtotal');
    const totalAmountEl = document.getElementById('totalAmount');

    function updateCart() {
        const items = Object.values(cart);
        if (items.length === 0) {
            orderItemsEl.innerHTML = `
                <div class="order-empty">
                    <p>Your order is empty</p>
                    <a href="#menu" class="btn btn-secondary btn-sm">Browse Menu</a>
                </div>`;
            orderTotalEl.style.display = 'none';
            return;
        }

        let html = '';
        let subtotal = 0;
        items.forEach(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            html += `
                <div class="order-item">
                    <div class="order-item-info">
                        <span class="order-item-name">${item.name}</span>
                        <div class="order-item-qty">
                            <button class="qty-btn" data-action="decrease" data-name="${item.name}">&minus;</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" data-action="increase" data-name="${item.name}">+</button>
                        </div>
                    </div>
                    <span class="order-item-price">&#8377;${itemTotal.toLocaleString('en-IN')}</span>
                </div>`;
        });

        orderItemsEl.innerHTML = html;
        orderTotalEl.style.display = 'block';
        subtotalEl.textContent = '\u20B9' + subtotal.toLocaleString('en-IN');
        totalAmountEl.textContent = '\u20B9' + (subtotal + 50).toLocaleString('en-IN');

        // Attach qty button listeners
        orderItemsEl.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                if (btn.dataset.action === 'increase') {
                    cart[name].qty++;
                } else {
                    cart[name].qty--;
                    if (cart[name].qty <= 0) delete cart[name];
                }
                updateCart();
            });
        });
    }

    // Add to cart buttons
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price);
            if (!name) return;

            if (cart[name]) {
                cart[name].qty++;
            } else {
                cart[name] = { name, price, qty: 1 };
            }

            // Visual feedback
            btn.classList.add('added');
            btn.textContent = '\u2713';
            setTimeout(() => {
                btn.classList.remove('added');
                btn.textContent = '+';
            }, 800);

            updateCart();
        });
    });

    // Checkout via WhatsApp
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const items = Object.values(cart);
            if (items.length === 0) return;

            let message = 'Hi! I\'d like to place an order from Sōjiga Bakehouse:\n\n';
            let subtotal = 0;
            items.forEach(item => {
                const total = item.price * item.qty;
                subtotal += total;
                message += `• ${item.name} x${item.qty} — ₹${total.toLocaleString('en-IN')}\n`;
            });
            message += `\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}`;
            message += `\nDelivery: ₹50`;
            message += `\nTotal: ₹${(subtotal + 50).toLocaleString('en-IN')}`;
            message += '\n\nPlease confirm availability. Thank you!';

            const encoded = encodeURIComponent(message);
            window.open('https://wa.me/91XXXXXXXXXX?text=' + encoded, '_blank');
        });
    }

    // --- CONTACT FORM → WHATSAPP ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const message = document.getElementById('message').value.trim();
            if (!name || !message) return;

            const text = encodeURIComponent(
                `Hi, I'm ${name}.\n\n${message}\n\n(Sent from Sōjiga website)`
            );
            window.open('https://wa.me/91XXXXXXXXXX?text=' + text, '_blank');
            contactForm.reset();
        });
    }

    // --- GALLERY LIGHTBOX ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentLightboxIndex = 0;

    function openLightbox(index) {
        currentLightboxIndex = index;
        const item = galleryItems[index];
        const img = item.querySelector('.gallery-img');
        const caption = item.dataset.caption;

        lightboxImg.style.background = img.style.background;
        lightboxCaption.textContent = caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function navigateLightbox(direction) {
        currentLightboxIndex += direction;
        if (currentLightboxIndex < 0) currentLightboxIndex = galleryItems.length - 1;
        if (currentLightboxIndex >= galleryItems.length) currentLightboxIndex = 0;
        openLightbox(currentLightboxIndex);
    }

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-prev').addEventListener('click', () => navigateLightbox(-1));
    document.querySelector('.lightbox-next').addEventListener('click', () => navigateLightbox(1));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // --- SMOOTH SCROLL FOR ALL ANCHOR LINKS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

})();
