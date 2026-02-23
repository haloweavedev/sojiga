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
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target.closest('.section');
                if (section) {
                    const sectionEls = section.querySelectorAll('.animate-on-scroll');
                    const index = Array.from(sectionEls).indexOf(entry.target);
                    entry.target.style.transitionDelay = (index * 80) + 'ms';
                }
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 50);
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
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

    // --- CART STATE ---
    const cart = {};

    // Cart DOM references
    const cartToggleBtn = document.getElementById('cartToggle');
    const cartBadge = document.getElementById('cartBadge');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartDrawerClose = document.getElementById('cartDrawerClose');
    const cartDrawerBody = document.getElementById('cartDrawerBody');
    const cartDrawerFooter = document.getElementById('cartDrawerFooter');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');

    // Checkout DOM references
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const checkoutStep1 = document.getElementById('checkoutStep1');
    const checkoutStep2 = document.getElementById('checkoutStep2');
    const checkoutBrief = document.getElementById('checkoutBrief');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutBack1 = document.getElementById('checkoutBack1');
    const payBtn = document.getElementById('payBtn');
    const cardFields = document.getElementById('cardFields');
    const successClose = document.getElementById('successClose');
    const successSummary = document.getElementById('successSummary');

    // Payment section (old) references
    const orderItemsEl = document.getElementById('orderItems');
    const orderTotalEl = document.getElementById('orderTotal');
    const subtotalEl = document.getElementById('subtotal');
    const totalAmountEl = document.getElementById('totalAmount');
    const checkoutBtnOld = document.getElementById('checkoutBtn');

    // --- CART DRAWER OPEN/CLOSE ---
    function openCartDrawer() {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartDrawer() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartToggleBtn.addEventListener('click', openCartDrawer);
    cartDrawerClose.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);

    // Browse Menu button inside empty cart
    cartDrawerBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('cart-browse-btn')) {
            closeCartDrawer();
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    // --- UPDATE CART BADGE ---
    function updateBadge() {
        const totalQty = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
        cartBadge.textContent = totalQty;
        if (totalQty === 0) {
            cartBadge.classList.add('empty');
        } else {
            cartBadge.classList.remove('empty');
            // Pop animation
            cartBadge.classList.remove('pop');
            void cartBadge.offsetWidth; // reflow
            cartBadge.classList.add('pop');
        }
    }

    // --- RENDER CART DRAWER ---
    function renderCartDrawer() {
        const items = Object.values(cart);

        if (items.length === 0) {
            cartDrawerBody.innerHTML = `
                <div class="cart-empty-state">
                    <div class="cart-empty-icon">&#128722;</div>
                    <p>Your cart is empty</p>
                    <button class="btn btn-secondary btn-sm cart-browse-btn">Browse Menu</button>
                </div>`;
            cartDrawerFooter.style.display = 'none';
            return;
        }

        let html = '';
        let subtotal = 0;

        items.forEach(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            html += `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">\u20B9${itemTotal.toLocaleString('en-IN')}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="cart-qty-btn" data-action="decrease" data-name="${item.name}">&minus;</button>
                        <span class="cart-qty-num">${item.qty}</span>
                        <button class="cart-qty-btn" data-action="increase" data-name="${item.name}">+</button>
                    </div>
                    <button class="cart-item-remove" data-name="${item.name}" title="Remove">&times;</button>
                </div>`;
        });

        cartDrawerBody.innerHTML = html;
        cartDrawerFooter.style.display = 'block';
        cartSubtotalEl.textContent = '\u20B9' + subtotal.toLocaleString('en-IN');
        cartTotalEl.textContent = '\u20B9' + (subtotal + 50).toLocaleString('en-IN');

        // Attach qty button listeners
        cartDrawerBody.querySelectorAll('.cart-qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                if (btn.dataset.action === 'increase') {
                    cart[name].qty++;
                } else {
                    cart[name].qty--;
                    if (cart[name].qty <= 0) delete cart[name];
                }
                renderCartDrawer();
                updatePaymentSection();
                updateBadge();
            });
        });

        // Attach remove button listeners
        cartDrawerBody.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                delete cart[btn.dataset.name];
                renderCartDrawer();
                updatePaymentSection();
                updateBadge();
            });
        });
    }

    // --- UPDATE OLD PAYMENT SECTION ---
    function updatePaymentSection() {
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

        // Attach qty button listeners in payment section
        orderItemsEl.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                if (btn.dataset.action === 'increase') {
                    cart[name].qty++;
                } else {
                    cart[name].qty--;
                    if (cart[name].qty <= 0) delete cart[name];
                }
                renderCartDrawer();
                updatePaymentSection();
                updateBadge();
            });
        });
    }

    // --- ADD TO CART ---
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price);
            if (!name || price === 0) return;

            if (cart[name]) {
                cart[name].qty++;
            } else {
                cart[name] = { name, price, qty: 1 };
            }

            // Visual feedback on button
            btn.classList.add('added');
            btn.textContent = '\u2713';
            setTimeout(() => {
                btn.classList.remove('added');
                btn.textContent = '+';
            }, 800);

            updateBadge();
            renderCartDrawer();
            updatePaymentSection();

            // Open cart drawer briefly on first add
            if (Object.keys(cart).length === 1 && cart[name].qty === 1) {
                openCartDrawer();
            }
        });
    });

    // --- CHECKOUT MODAL ---
    function openCheckout() {
        const items = Object.values(cart);
        if (items.length === 0) return;

        closeCartDrawer();

        // Build order brief
        let subtotal = 0;
        let briefHTML = '';
        items.forEach(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            briefHTML += `<div class="brief-item"><span>${item.name} &times; ${item.qty}</span><span>\u20B9${itemTotal.toLocaleString('en-IN')}</span></div>`;
        });
        briefHTML += `<div class="brief-item"><span>Delivery</span><span>\u20B950</span></div>`;
        briefHTML += `<div class="brief-total"><span>Total</span><span>\u20B9${(subtotal + 50).toLocaleString('en-IN')}</span></div>`;
        checkoutBrief.innerHTML = briefHTML;

        // Reset to step 1
        checkoutStep1.style.display = 'block';
        checkoutStep2.style.display = 'none';

        // Reset form states
        payBtn.disabled = false;
        payBtn.querySelector('.pay-btn-text').style.display = 'inline';
        payBtn.querySelector('.pay-btn-spinner').style.display = 'none';

        // Show modal
        checkoutOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCheckout() {
        checkoutOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartCheckoutBtn.addEventListener('click', openCheckout);

    checkoutBack1.addEventListener('click', () => {
        closeCheckout();
        setTimeout(openCartDrawer, 100);
    });

    checkoutOverlay.addEventListener('click', (e) => {
        if (e.target === checkoutOverlay) closeCheckout();
    });

    // --- PAYMENT METHOD SWITCHING ---
    document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'card') {
                cardFields.style.display = 'block';
            } else {
                cardFields.style.display = 'none';
            }
        });
    });

    // --- CARD NUMBER FORMATTING ---
    const cardNumInput = document.getElementById('cardNum');
    if (cardNumInput) {
        cardNumInput.addEventListener('input', () => {
            let val = cardNumInput.value.replace(/\D/g, '');
            val = val.substring(0, 16);
            let formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
            cardNumInput.value = formatted;
        });
    }

    // --- CARD EXPIRY FORMATTING ---
    const cardExpInput = document.getElementById('cardExp');
    if (cardExpInput) {
        cardExpInput.addEventListener('input', () => {
            let val = cardExpInput.value.replace(/\D/g, '');
            val = val.substring(0, 4);
            if (val.length >= 2) {
                val = val.substring(0, 2) + ' / ' + val.substring(2);
            }
            cardExpInput.value = val;
        });
    }

    // --- CHECKOUT FORM SUBMIT ---
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('coName').value.trim();
        const phone = document.getElementById('coPhone').value.trim();
        const address = document.getElementById('coAddress').value.trim();

        if (!name || !phone || !address) return;

        const payMethod = document.querySelector('input[name="payMethod"]:checked').value;

        // Validate card fields if card payment
        if (payMethod === 'card') {
            const cardNum = document.getElementById('cardNum').value.trim();
            const cardExp = document.getElementById('cardExp').value.trim();
            const cardCvc = document.getElementById('cardCvc').value.trim();
            if (!cardNum || !cardExp || !cardCvc) return;
        }

        // Show spinner
        payBtn.disabled = true;
        payBtn.querySelector('.pay-btn-text').style.display = 'none';
        payBtn.querySelector('.pay-btn-spinner').style.display = 'inline-block';

        // Simulate processing
        setTimeout(() => {
            showSuccess(name, payMethod);
        }, 1800);
    });

    // --- SUCCESS SCREEN ---
    function showSuccess(customerName, payMethod) {
        const items = Object.values(cart);
        let subtotal = 0;
        let summaryHTML = '';

        items.forEach(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            summaryHTML += `<div class="brief-item"><span>${item.name} &times; ${item.qty}</span><span>\u20B9${itemTotal.toLocaleString('en-IN')}</span></div>`;
        });
        summaryHTML += `<div class="brief-item"><span>Delivery</span><span>\u20B950</span></div>`;
        summaryHTML += `<div class="brief-total"><span>Total Paid</span><span>\u20B9${(subtotal + 50).toLocaleString('en-IN')}</span></div>`;

        successSummary.innerHTML = summaryHTML;

        // Generate fake order ID
        const orderId = 'SJG-' + Date.now().toString(36).toUpperCase().slice(-6);
        checkoutStep2.querySelector('.success-order-id').textContent = 'Order #' + orderId;

        const methodLabels = { upi: 'UPI', card: 'Card', cod: 'Cash on Delivery' };
        checkoutStep2.querySelector('.success-msg').textContent =
            `Thank you, ${customerName}! Your order has been placed via ${methodLabels[payMethod]}. We'll send confirmation on WhatsApp shortly.`;

        // Switch to step 2
        checkoutStep1.style.display = 'none';
        checkoutStep2.style.display = 'block';

        // Also send WhatsApp message with order details
        sendWhatsAppOrder(customerName, orderId, payMethod);
    }

    // --- WHATSAPP ORDER MESSAGE ---
    function sendWhatsAppOrder(customerName, orderId, payMethod) {
        const items = Object.values(cart);
        const phone = document.getElementById('coPhone').value.trim();
        const address = document.getElementById('coAddress').value.trim();
        const methodLabels = { upi: 'UPI', card: 'Card', cod: 'Cash on Delivery' };

        let message = `Hi! New order from Sōjiga Bakehouse website\n\n`;
        message += `Order: ${orderId}\n`;
        message += `Customer: ${customerName}\n`;
        message += `Phone: ${phone}\n`;
        message += `Address: ${address}\n`;
        message += `Payment: ${methodLabels[payMethod]}\n\n`;
        message += `Items:\n`;

        let subtotal = 0;
        items.forEach(item => {
            const total = item.price * item.qty;
            subtotal += total;
            message += `• ${item.name} x${item.qty} — ₹${total.toLocaleString('en-IN')}\n`;
        });
        message += `\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}`;
        message += `\nDelivery: ₹50`;
        message += `\nTotal: ₹${(subtotal + 50).toLocaleString('en-IN')}`;

        const encoded = encodeURIComponent(message);
        // Auto-open WhatsApp with order in background
        window.open('https://wa.me/917483870687?text=' + encoded, '_blank');
    }

    // --- SUCCESS CLOSE ---
    successClose.addEventListener('click', () => {
        // Clear cart
        Object.keys(cart).forEach(key => delete cart[key]);
        updateBadge();
        renderCartDrawer();
        updatePaymentSection();

        // Reset checkout form
        checkoutForm.reset();
        cardFields.style.display = 'none';

        // Close modal
        closeCheckout();
    });

    // --- OLD CHECKOUT BUTTON (PAYMENT SECTION) → WHATSAPP ---
    if (checkoutBtnOld) {
        checkoutBtnOld.addEventListener('click', () => {
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
            window.open('https://wa.me/917483870687?text=' + encoded, '_blank');
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
            window.open('https://wa.me/917483870687?text=' + text, '_blank');
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
        const imgEl = item.querySelector('.gallery-img');
        const caption = item.dataset.caption;

        // Check if it has a real photo
        const realImg = imgEl.querySelector('img');
        if (realImg) {
            lightboxImg.style.background = `url(${realImg.src}) center/cover no-repeat`;
        } else {
            lightboxImg.style.background = imgEl.style.background;
        }

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

    // --- KEYBOARD SHORTCUTS ---
    document.addEventListener('keydown', (e) => {
        // Lightbox controls
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
            return;
        }
        // Close checkout on Escape
        if (checkoutOverlay.classList.contains('active')) {
            if (e.key === 'Escape') closeCheckout();
            return;
        }
        // Close cart drawer on Escape
        if (cartDrawer.classList.contains('active')) {
            if (e.key === 'Escape') closeCartDrawer();
            return;
        }
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

    // --- INITIALIZE ---
    updateBadge();

})();
