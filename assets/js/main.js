document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. DYNAMIC TYPEWRITER EFFECT (Hero Section)
    // ==========================================================================
    const words = [
        "Designing experiences with empathy & playfulness.",
        "Crafting premium, digital products.",
        "UX Design mixed with modern creative aesthetics.",
        "Interactive storytelling & human-centered design."
    ];
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const typeSpeed = 80;
    const deleteSpeed = 40;
    const delayBetweenWords = 2000;
    const typewriterElement = document.querySelector('.typewriter-text');
    
    function type() {
        if (!typewriterElement) return;
        const currentWord = words[wordIdx];
        
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIdx - 1);
            charIdx--;
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIdx + 1);
            charIdx++;
        }
        
        let dynamicSpeed = isDeleting ? deleteSpeed : typeSpeed;
        
        if (!isDeleting && charIdx === currentWord.length) {
            isDeleting = true;
            dynamicSpeed = delayBetweenWords; // Pause at full word
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            dynamicSpeed = 500; // Pause before typing next word
        }
        
        setTimeout(type, dynamicSpeed);
    }
    
    // Start typewriter
    type();

    // ==========================================================================
    // 2. PLAYFUL TRAILING CUSTOM CURSOR
    // ==========================================================================
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    
    if (cursor && follower) {
        // Show cursor elements (hidden initially to prevent flash on top-left)
        cursor.style.display = 'block';
        follower.style.display = 'block';
        
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Inner dot follows mouse position immediately
            follower.style.left = mouseX + 'px';
            follower.style.top = mouseY + 'px';
        });
        
        // Outer ring trails with ease (LERP)
        function animateCursor() {
            let lerpFactor = 0.15;
            cursorX += (mouseX - cursorX) * lerpFactor;
            cursorY += (mouseY - cursorY) * lerpFactor;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
        
        // Hover state triggers
        const hoverables = document.querySelectorAll('a, button, .btn, .filter-btn, .bento-card, .polaroid-card, .social-badge, .interest-chip, input, textarea');
        hoverables.forEach(item => {
            item.addEventListener('mouseenter', () => {
                cursor.classList.add('hovered');
            });
            item.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovered');
            });
        });
    }

    // ==========================================================================
    // 3. 3D TILT EFFECT ON CARDS
    // ==========================================================================
    const tiltElements = document.querySelectorAll('.polaroid-card, .bento-card, .stat-card, .test-card');
    
    tiltElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within element
            const y = e.clientY - rect.top;  // y position within element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Max degrees to tilt
            const maxTilt = 8;
            
            // Calculate tilt angle based on mouse distance from center
            const tiltX = ((centerY - y) / centerY) * maxTilt;
            const tiltY = ((x - centerX) / centerX) * maxTilt;
            
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    });

    // ==========================================================================
    // 4. BENTO GRID PROJECT FILTERING
    // ==========================================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.bento-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active state on buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    // Show matching cards with transition effect
                    card.classList.remove('hide');
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    // Hide non-matching cards smoothly
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.classList.add('hide');
                    }, 350); // matches transition time
                }
            });
        });
    });

    // ==========================================================================
    // 5. VIEWPORT DETECTION & ANIMATED COUNT-UP
    // ==========================================================================
    const statsSection = document.querySelector('.stats-grid');
    const statNumbers = document.querySelectorAll('.stat-num');
    let hasCounted = false;
    
    function startCountUp(el) {
        const target = parseFloat(el.getAttribute('data-target'));
        const isDecimal = target % 1 !== 0;
        const duration = 2000; // 2 seconds duration
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeProgress * target;
            
            if (isDecimal) {
                el.textContent = currentVal.toFixed(1) + '+';
            } else {
                el.textContent = Math.floor(currentVal) + '+';
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                if (isDecimal) {
                    el.textContent = target.toFixed(1) + '+';
                } else {
                    el.textContent = target + '+';
                }
            }
        }
        
        requestAnimationFrame(update);
    }
    
    // Intersection Observer to fire count up
    if (statsSection && statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasCounted) {
                    hasCounted = true;
                    statNumbers.forEach(num => startCountUp(num));
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(statsSection);
    }

    // ==========================================================================
    // 6. VIEWPORT PROGRESS BAR FILLING (Skills Section)
    // ==========================================================================
    const skillsGrid = document.querySelector('.skills-grid');
    const progressFills = document.querySelectorAll('.progress-bar-fill');
    
    if (skillsGrid && progressFills.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    progressFills.forEach(fill => {
                        const targetPercent = fill.getAttribute('data-percent');
                        fill.style.width = targetPercent + '%';
                    });
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(skillsGrid);
    }

    // ==========================================================================
    // 7. STICKY GLASS HEADER & SCROLL SPY
    // ==========================================================================
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        // Sticky Header Transition
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Scroll Spy active navigation state
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // ==========================================================================
    // 8. MOBILE MENU HAMBURGER NAVIGATION
    // ==========================================================================
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
        
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileNav.classList.remove('active');
            });
        });
    }

    // ==========================================================================
    // 9. SECURE AJAX FORM SUBMISSION HANDLER
    // ==========================================================================
    const contactForm = document.querySelector('.contact-form');
    const formResponse = document.querySelector('.form-response');
    
    if (contactForm && formResponse) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Intercept browser submission
            
            // Change button state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending... 🚀</span>`;
            
            // Gather form data
            const formData = new FormData(contactForm);
            
            // Submit data to formspree endpoint to send email
            fetch('https://formspree.io/f/xwvzdard', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(text || 'Server responded with an error');
                    });
                }
                // Read as text first to avoid JSON parse errors bubbling unintentionally
                return res.text().then(txt => {
                    try {
                        return JSON.parse(txt);
                    } catch (e) {
                        throw new Error('Invalid JSON response from server');
                    }
                });
            })
            .then(data => {
                // Clear response formatting
                formResponse.classList.remove('success', 'error');
                formResponse.textContent = data.message || 'Response received.';

                if (data.success) {
                    formResponse.classList.add('success');
                    contactForm.reset(); // clear inputs
                } else {
                    formResponse.classList.add('error');
                }

                // Show toast container
                formResponse.style.display = 'block';
            })
            .catch(err => {
                formResponse.classList.remove('success', 'error');
                formResponse.classList.add('error');
                formResponse.textContent = "Oops! Something went wrong while sending. Please try again or reach out directly. (" + err.message + ")";
                formResponse.style.display = 'block';
            })
            .finally(() => {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;

                // Scroll to message feedback
                formResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        });
    }

    // ==========================================================================
    // 10. SCROLL REVEAL TIMING (Intersection Observer progressive entrance)
    // ==========================================================================
    const revealElements = document.querySelectorAll('.skill-card, .bento-card, .journey-card, .test-card, .reveal-up');
    
    // Add CSS initial state classes programmatically to avoid layouts breaking if JS is off
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add a small sequential stagger effect
                const target = entry.target;
                setTimeout(() => {
                    target.style.opacity = '1';
                    target.style.transform = 'translateY(0px)';
                }, 100);
                revealObserver.unobserve(target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    revealElements.forEach(el => revealObserver.observe(el));
});
