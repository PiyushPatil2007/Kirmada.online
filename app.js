window.initAppAnimations = function() {
  // Ensure GSAP and AnimeJS are loaded
  if (typeof gsap === 'undefined' || typeof anime === 'undefined') {
    console.error("Animation libraries failed to load.");
    document.querySelectorAll('.animate-hero, .text-reveal, .stagger-card, .process-step, .methodology-phase').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Register GSAP Plugins
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 0. Hamburger Menu Logic
  const hamburger = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav-links');
  
  if (hamburger && mobileNav) {
    // Remove old listeners to prevent duplicates on swup transition
    const newHamburger = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);
    
    newHamburger.addEventListener('click', () => {
      newHamburger.classList.toggle('active');
      mobileNav.classList.toggle('mobile-active');
    });

    // Close nav when clicking a link
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        newHamburger.classList.remove('active');
        mobileNav.classList.remove('mobile-active');
      });
    });
  }

  // 1.5 Staggered Text Setup (Apple Style)
  const applyStaggeredSlideUp = (selector) => {
    document.querySelectorAll(selector).forEach(el => {
      if (el.classList.contains('split-text-applied')) return;
      el.classList.add('split-text-applied');
      
      // Remove generic fade animations to prevent conflicts
      el.classList.remove('text-reveal', 'animate-hero');

      const processNode = (node) => {
        if (node.nodeType === 3) { // Text node
          const text = node.nodeValue;
          const words = text.split(/(\s+)/); // Split keeping whitespace
          const fragment = document.createDocumentFragment();
          
          words.forEach(word => {
            if (word.trim() === '') {
              fragment.appendChild(document.createTextNode(word));
            } else {
              const outer = document.createElement('span');
              outer.style.display = 'inline-block';
              outer.style.overflow = 'hidden';
              outer.style.verticalAlign = 'top';
              outer.style.paddingBottom = '0.1em'; // Accommodate descending letters
              outer.style.marginBottom = '-0.1em';

              const inner = document.createElement('span');
              inner.style.display = 'inline-block';
              inner.className = 'stagger-word-inner';
              inner.innerText = word;

              outer.appendChild(inner);
              fragment.appendChild(outer);
            }
          });
          return fragment;
        } else if (node.nodeType === 1) { // Element node
          const clone = node.cloneNode(false);
          Array.from(node.childNodes).forEach(child => {
            clone.appendChild(processNode(child));
          });
          return clone;
        }
        return node.cloneNode(true);
      };

      const fragment = document.createDocumentFragment();
      Array.from(el.childNodes).forEach(child => {
        fragment.appendChild(processNode(child));
      });
      
      el.innerHTML = '';
      el.appendChild(fragment);
    });
  };

  // Apply to all major typography displays across the entire site
  applyStaggeredSlideUp('.display-xxl, .display-xl, .display-lg');

  // 1. Initial Page Load Animations (Navbar and Hero)
  anime({
    targets: '.navbar .nav-logo, .navbar .nav-links a',
    translateY: [-30, 0],
    opacity: [0, 1],
    duration: 1000,
    delay: anime.stagger(150),
    easing: 'easeOutElastic(1, .8)'
  });

  const heroElements = document.querySelectorAll('.animate-hero');
  if (heroElements.length > 0) {
    gsap.fromTo(heroElements, 
      { y: 80, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.5, stagger: 0.3, ease: "power4.out", delay: 0.3 }
    );
  }

  const largeLogo = document.querySelector('.hero-logo-large');
  if (largeLogo) {
    anime({
      targets: largeLogo,
      translateY: [-10, 10],
      direction: 'alternate',
      loop: true,
      duration: 3000,
      easing: 'easeInOutSine'
    });
  }

  // 2. Cinematic Pinning Sections (The Apple-Style Scroll Effect)

  // A. Process Section (index.html)
  const processSection = document.getElementById('process-section');
  if (processSection && typeof ScrollTrigger !== 'undefined') {
    const steps = gsap.utils.toArray('.process-step');
    
    // Make sure first step is visible initially
    gsap.set(steps[0], { opacity: 1 });
    for(let i=1; i<steps.length; i++) gsap.set(steps[i], { opacity: 0, y: 50 });

    const tlProcess = gsap.timeline({
      scrollTrigger: {
        trigger: processSection,
        start: "center center", // Pin when section reaches center of viewport
        end: "+=2000", // Amount of scrolling required to see all steps
        scrub: 1, // Smooth scrubbing effect
        pin: true, // Lock screen in place
      }
    });

    // Animate steps fading in and out based on scroll position
    steps.forEach((step, i) => {
      if (i > 0) {
        tlProcess.to(steps[i-1], { opacity: 0, y: -50, duration: 1 })
                 .to(step, { opacity: 1, y: 0, duration: 1 }, "<");
      }
    });
    // Add a tiny pause at the end so the last slide holds before unpinning
    tlProcess.to({}, {duration: 0.5});
  }

  // B. Methodology Section (services.html)
  const methodologySection = document.getElementById('methodology-section');
  if (methodologySection && typeof ScrollTrigger !== 'undefined') {
    const phases = gsap.utils.toArray('.methodology-phase');
    
    gsap.set(phases[0], { opacity: 1 });
    for(let i=1; i<phases.length; i++) gsap.set(phases[i], { opacity: 0, x: 50 });

    const tlMethodology = gsap.timeline({
      scrollTrigger: {
        trigger: methodologySection,
        start: "center center",
        end: "+=2000",
        scrub: 1,
        pin: true,
      }
    });

    phases.forEach((phase, i) => {
      if (i > 0) {
        tlMethodology.to(phases[i-1], { opacity: 0, x: -50, duration: 1 })
                     .to(phase, { opacity: 1, x: 0, duration: 1 }, "<");
      }
    });
    tlMethodology.to({}, {duration: 0.5});
  }

  // 3. Smooth Scroll-Triggered Parallax / Reveals for all other elements
  
  if (typeof ScrollTrigger !== 'undefined') {
    
    // Staggered Slide-Up Animation (Apple Style) for the split text
    gsap.utils.toArray('.split-text-applied').forEach(el => {
      const words = el.querySelectorAll('.stagger-word-inner');
      const isHero = el.closest('.hero-band') !== null;
      
      gsap.fromTo(words, 
        { y: '120%' },
        {
          y: '0%',
          duration: 1.2,
          stagger: 0.08,
          ease: "power4.out",
          delay: isHero ? 0.3 : 0, // Delay hero text to sync with navbar
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Text Reveals: Fade and slide up as they enter viewport
    gsap.utils.toArray('.text-reveal').forEach(el => {
      gsap.fromTo(el, 
        { y: 50, opacity: 0 },
        {
          y: 0, 
          opacity: 1, 
          duration: 1.2, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%", // Trigger when top of element hits 85% down viewport
            toggleActions: "play none none reverse" // Reverses animation if you scroll up!
          }
        }
      );
    });

    // Staggered Cards: Animate cards in sections simultaneously with elastic effect
    const staggerGroups = document.querySelectorAll('.grid-3, .service-grid, section .container');
    staggerGroups.forEach(group => {
      const cards = group.querySelectorAll('.stagger-card');
      if (cards.length > 0) {
        gsap.fromTo(cards, 
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.15, ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: group,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });

  }

  // 4. Hover Micro-interactions (AnimeJS)
  document.querySelectorAll('.stagger-card, .service-card, .collection-tile').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.service-icon, .display-lg');
      if (icon) {
        anime({
          targets: icon,
          scale: 1.15,
          rotate: '15deg',
          duration: 400,
          easing: 'easeOutBack'
        });
      }
    });
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.service-icon, .display-lg');
      if (icon) {
        anime({
          targets: icon,
          scale: 1,
          rotate: '0deg',
          duration: 400,
          easing: 'easeOutBack'
        });
      }
    });
  });

  // 5. FAQ Accordion Logic
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      // Close other open items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      // Toggle current item
      item.classList.toggle('active');
    });
  });

  // 6. Orange Dot Aesthetic
  // This turns all full stops (.) into the brand's primary orange color for a high-end aesthetic look
  const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .subtitle, .display-xxl, .display-xl, .display-lg, .heading-lg, .heading-md, .heading-sm');
  
  textElements.forEach(el => {
    // Create a TreeWalker to only grab pure text nodes, preventing us from breaking HTML tags
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];
    let node;
    while (node = walker.nextNode()) {
      // If the text node contains a dot, queue it for replacement
      if (node.nodeValue.includes('.')) {
        nodesToReplace.push(node);
      }
    }
    
    nodesToReplace.forEach(n => {
      // Create a wrapper span and replace the dots with an orange-styled span
      const wrapper = document.createElement('span');
      wrapper.innerHTML = n.nodeValue.replace(/\./g, '<span style="color: var(--primary);">.</span>');
      n.parentNode.replaceChild(wrapper, n);
    });
  });

  // 8. Service Spotlight Carousel Logic
  const spotlightContainer = document.querySelector('.service-spotlight');
  if (spotlightContainer) {
    const texts = document.querySelectorAll('.spotlight-text');
    const progressBar = document.getElementById('spotlight-progress');
    const counter = document.getElementById('spotlight-counter');
    const btnNext = document.getElementById('spotlight-next');
    const btnPrev = document.getElementById('spotlight-prev');
    
    let currentIndex = 0;
    const totalSlides = texts.length;
    let slideInterval;
    let progressAnim;

    const updateSlide = (index) => {
      // Hide all texts
      texts.forEach(txt => {
        txt.classList.remove('active');
        Array.from(txt.children).forEach(child => {
          child.style.opacity = '0';
          child.style.transform = 'translateY(30px)';
        });
      });

      // Show and animate active text
      const activeText = texts[index];
      activeText.classList.add('active');

      // AnimeJS staggered animation for the text content
      const elementsToAnimate = Array.from(activeText.children);
      
      anime({
        targets: elementsToAnimate,
        translateY: [30, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 1200,
        delay: anime.stagger(150)
      });

      // Update counter
      if (counter) counter.innerText = `${(index + 1).toString().padStart(2, '0')} / ${totalSlides}`;

      // Reset and animate progress bar
      if (progressAnim) progressAnim.pause();
      if (progressBar) {
        progressBar.style.width = '0%';
        progressAnim = anime({
          targets: progressBar,
          width: '100%',
          duration: 5000,
          easing: 'linear'
        });
      }
    };

    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateSlide(currentIndex);
    };

    const prevSlide = () => {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateSlide(currentIndex);
    };

    const resetInterval = () => {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 5000);
    };

    // Event Listeners
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        nextSlide();
        resetInterval();
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        prevSlide();
        resetInterval();
      });
    }

    // Initialize
    updateSlide(0);
    resetInterval();
  }

};

// === Admin Access Triggers ===

// 1. Keyboard Shortcuts
let secretBuffer = '';
document.addEventListener('keydown', (e) => {

  // Option B: Typing "admin" on the keyboard anywhere
  if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
    secretBuffer += e.key.toLowerCase();
    if (secretBuffer.includes('admin')) {
      window.location.href = 'admin.html';
      secretBuffer = '';
    }
    if (secretBuffer.length > 10) secretBuffer = secretBuffer.slice(-10);
  }
});

// 2. 5 Clicks on the Main Logo
let logoClickCount = 0;
let logoClickTimer;

document.addEventListener('click', (e) => {
  const logo = e.target.closest('.nav-logo') || e.target.closest('.footer-logo') || e.target.closest('.hero-logo-large');
  
  if (logo) {
    // Prevent immediate navigation so we can count clicks
    e.preventDefault();
    e.stopPropagation();
    
    logoClickCount++;
    
    // If reached 5 clicks
    if (logoClickCount >= 5) {
      clearTimeout(logoClickTimer);
      logoClickCount = 0;
      window.location.href = 'admin.html';
      return;
    }
    
    // Reset timer for clicks (Wait 400ms to see if they click again)
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => {
      if (logoClickCount > 0 && logoClickCount < 5) {
        logoClickCount = 0; // Reset count
        // Perform the normal navigation since they didn't reach 5 clicks
        if (window.swup) {
          window.swup.loadPage({ url: logo.href });
        } else {
          window.location.href = logo.href;
        }
      }
    }, 400); // 400ms window between clicks
  }
});
