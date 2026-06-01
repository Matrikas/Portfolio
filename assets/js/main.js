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
    // 8.5 REAL-TIME FORM VALIDATION WITH REGEX & ERROR MESSAGES
    // ==========================================================================
    const contactForm = document.querySelector('.contact-form');
    const formResponse = document.querySelector('.form-response');
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const messageInput = document.getElementById('form-message');
    const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

    // Email regex pattern for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validation state object
    const formState = {
        name: false,
        email: false,
        message: false
    };

    // Function to create or get error message element for a field
    function getOrCreateErrorElement(inputElement) {
        let errorEl = inputElement.nextElementSibling;
        if (!errorEl || !errorEl.classList.contains('field-error')) {
            errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            errorEl.style.cssText = 'color: #FF4A5A; font-size: 0.85rem; margin-top: 0.4rem; display: none;';
            inputElement.parentNode.insertBefore(errorEl, inputElement.nextSibling);
        }
        return errorEl;
    }

    // Function to show/hide error message
    function setFieldError(inputElement, message) {
        const errorEl = getOrCreateErrorElement(inputElement);
        if (message) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            inputElement.style.borderColor = '#FF4A5A';
        } else {
            errorEl.style.display = 'none';
            inputElement.style.borderColor = '';
        }
    }

    // Validation functions
    function validateName(name) {
        if (!name || name.trim().length === 0) {
            return 'Name is required.';
        }
        if (name.trim().length < 2) {
            return 'Name must be at least 2 characters.';
        }
        if (name.length > 100) {
            return 'Name must not exceed 100 characters.';
        }
        return '';
    }

    function validateEmail(email) {
        if (!email || email.trim().length === 0) {
            return 'Email is required.';
        }
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address (e.g., jane@example.com).';
        }
        return '';
    }

    function validateMessage(message) {
        if (!message || message.trim().length === 0) {
            return 'Message is required.';
        }
        if (message.trim().length < 10) {
            return 'Message must be at least 10 characters.';
        }
        if (message.length > 5000) {
            return 'Message must not exceed 5000 characters.';
        }
        return '';
    }

    // Update button disabled state based on form validity
    function updateSubmitButton() {
        if (submitBtn) {
            const isFormValid = formState.name && formState.email && formState.message;
            submitBtn.disabled = !isFormValid;
            submitBtn.style.opacity = isFormValid ? '1' : '0.5';
            submitBtn.style.cursor = isFormValid ? 'pointer' : 'not-allowed';
        }
    }

    // Add validation listeners to form inputs
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            const error = validateName(e.target.value);
            formState.name = error === '';
            setFieldError(nameInput, error);
            updateSubmitButton();
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', (e) => {
            const error = validateEmail(e.target.value);
            formState.email = error === '';
            setFieldError(emailInput, error);
            updateSubmitButton();
        });
    }

    if (messageInput) {
        messageInput.addEventListener('input', (e) => {
            const error = validateMessage(e.target.value);
            formState.message = error === '';
            setFieldError(messageInput, error);
            updateSubmitButton();
        });
    }

    // Initialize button state on page load
    updateSubmitButton();

    // ==========================================================================
    // 9. SECURE AJAX FORM SUBMISSION HANDLER
    // ==========================================================================
    
    if (contactForm && formResponse) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Intercept browser submission
            
            // Change button state
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
                    // Clear error messages and reset validation state
                    formState.name = false;
                    formState.email = false;
                    formState.message = false;
                    [nameInput, emailInput, messageInput].forEach(input => {
                        if (input) {
                            setFieldError(input, '');
                            input.style.borderColor = '';
                        }
                    });
                    updateSubmitButton();
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
