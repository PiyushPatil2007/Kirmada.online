window.initAdvancedInteractions = function() {
  // ----------------------------------------------------
  // ADVANCED INTERACTIONS (Apple Reveal, Lens, Kinetic)
  // ----------------------------------------------------

  // 1. Apple-Style Staggered Text Reveal
  // Animate the .stagger-word-inner elements that were created in applyStaggeredSlideUp
  const staggeredContainers = document.querySelectorAll('.split-text-applied');
  staggeredContainers.forEach(container => {
    const words = container.querySelectorAll('.stagger-word-inner');
    if (words.length > 0 && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.fromTo(words, 
        { y: '110%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: container,
            start: "top 90%", // Triggers when top of element hits 90% of viewport
            toggleActions: "play none none none"
          }
        }
      );
    }
  });

  // 2. Lens Refraction Cursor (Glassmorphism 2.0)
  const lensCursor = document.getElementById('lens-cursor');
  
  // Strictly disable custom cursor logic on mobile and tablet (< 1024px)
  if (lensCursor && window.innerWidth >= 1024) {
    if (!window.cursorInitialized) {
      window.cursorInitialized = true;
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let cursorX = mouseX;
      let cursorY = mouseY;

      // Listen to mouse movement
      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!document.body.classList.contains('cursor-active')) {
          document.body.classList.add('cursor-active');
        }
      });

      // Spring physics loop for the cursor
      const renderCursor = () => {
        // Lerp (Linear Interpolation) for smooth trailing
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        lensCursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        requestAnimationFrame(renderCursor);
      };
      requestAnimationFrame(renderCursor);

      // Click state
      window.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
      window.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
    }

    // Hover states for links and buttons to expand the lens (Run every time for new elements)
    const interactiveElements = document.querySelectorAll('a, button, .bento-flex-card, .service-card, .stagger-card, .arch-card, .nav-btn, input, select, textarea');
    interactiveElements.forEach(el => {
      // Avoid duplicate bindings if already bound
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = "true";
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // 3. Kinetic Typography
  // Add class to the large displays so they get the CSS transition
  const kineticTexts = document.querySelectorAll('.display-xxl, .display-xl, .display-lg');
  kineticTexts.forEach(el => el.classList.add('kinetic-text'));

  window.addEventListener('mousemove', (e) => {
    // Normalize X from -1 (left) to 1 (right)
    const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
    
    kineticTexts.forEach(text => {
      // Calculate skew (up to 4deg) and letter spacing (up to 2px extra)
      const skew = normalizedX * -4; 
      const extraSpacing = Math.abs(normalizedX) * 2;
      
      text.style.transform = `skewX(${skew}deg)`;
      // Check if text already has custom tight tracking
      if (text.classList.contains('display-xl') || text.classList.contains('display-xxl')) {
        text.style.letterSpacing = `calc(-2px + ${extraSpacing}px)`;
      } else {
        text.style.letterSpacing = `${extraSpacing}px`;
      }
    });
  });

  // 4. Floating WhatsApp Premium Button Animation
  const waBtn = document.querySelector('.wa-premium-btn');
  if (waBtn && typeof anime !== 'undefined') {
    // Subtle continuous float
    anime({
      targets: waBtn,
      translateY: [0, -6],
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      duration: 2500
    });

    // Icon subtle rotation bounce
    const waIcon = document.querySelector('.wa-icon-wrapper svg');
    if (waIcon) {
      anime({
        targets: waIcon,
        rotate: [0, 15, -10, 5, 0],
        duration: 1000,
        delay: 4000,
        loop: true,
        easing: 'easeInOutQuad'
      });
    }
  }

  // 5. Scroll-Triggered Native SVG Animations (Premium Replacement for Lottie)
  const svgIcons = document.querySelectorAll('.animate-svg-icon');
  if (svgIcons.length > 0 && typeof anime !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    svgIcons.forEach(svg => {
      // Get all drawable child elements inside the SVG
      const paths = svg.querySelectorAll('path, rect, line, polyline, circle, polygon');
      
      // Pre-set dash offsets so they are hidden initially
      anime.set(paths, {
        strokeDashoffset: [anime.setDashoffset, 0]
      });

      // Create an Anime timeline but pause it immediately
      const animItem = anime({
        targets: paths,
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInOutSine',
        duration: 1500,
        delay: anime.stagger(150),
        direction: 'alternate',
        loop: true,
        autoplay: false
      });

      ScrollTrigger.create({
        trigger: svg,
        start: "top 90%",
        onEnter: () => animItem.play(),
        onLeave: () => animItem.pause(),
        onEnterBack: () => animItem.play(),
        onLeaveBack: () => animItem.pause(),
      });
    });
  }

};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Preloader & Initial Load
  const preloader = document.getElementById('preloader');
  const runInitialLoad = () => {
    if (typeof window.initAppAnimations === 'function') window.initAppAnimations();
    if (typeof window.initAdvancedInteractions === 'function') window.initAdvancedInteractions();
  };

  if (preloader && typeof anime !== 'undefined' && !sessionStorage.getItem('preloader_shown')) {
    // Disable scrolling while preloading
    document.body.style.overflow = 'hidden';
    
    // Create a timeline for cinematic preloader
    const tl = anime.timeline({
      easing: 'easeInOutSine'
    });

    tl.add({
      targets: '.preloader-bar',
      width: ['0%', '100%'],
      duration: 1000,
      delay: 200,
      easing: 'easeInOutExpo'
    })
    .add({
      targets: '.preloader-track',
      opacity: [1, 0],
      duration: 400,
      easing: 'linear'
    }, '-=200')
    .add({
      targets: '.preloader-text',
      opacity: [0, 1],
      translateY: ['100%', '0%'],
      duration: 800,
      easing: 'easeOutQuint'
    }, '-=200')
    .add({
      targets: '.preloader-text',
      opacity: [1, 0],
      scale: [1, 1.1],
      duration: 600,
      delay: 400,
      easing: 'easeInQuad',
      complete: function() {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
        sessionStorage.setItem('preloader_shown', 'true');
        setTimeout(() => {
          preloader.style.display = 'none';
          runInitialLoad();
        }, 1000); // Wait for CSS transform to slide the screen up
      }
    });
  } else {
    if (preloader) preloader.style.display = 'none';
    runInitialLoad();
  }

  const updateActiveNavLink = () => {
    let currentPath = window.location.pathname;
    if (currentPath.endsWith('/')) currentPath += 'index.html';
    
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      link.style.color = ''; // Reset color
      if (link.classList.contains('btn-primary')) return;
      
      let linkPath = new URL(link.href).pathname;
      if (linkPath.endsWith('/')) linkPath += 'index.html';
      
      if (linkPath === currentPath) {
        link.classList.add('active');
        link.style.color = 'var(--primary)'; // Force inline color to guarantee visibility immediately
      }
    });
  };
  updateActiveNavLink();

  // 2. Initialize Swup Page Transitions with Custom Liquid Animation
  if (typeof Swup !== 'undefined') {
    const swup = new Swup({
      containers: ['#swup'],
      animationSelector: '[class*="transition-"]' // Default fallback
    });

    // Custom Liquid Out Animation (Covering the screen)
    swup.hooks.replace('animation:out:await', async (visit) => {
      const curtain = document.getElementById('liquid-curtain');
      const chatWidget = document.getElementById('ai-chat-widget');
      
      if (chatWidget && typeof gsap !== 'undefined') {
        gsap.to(chatWidget, { opacity: 0, scale: 0.8, y: 20, duration: 0.4, ease: "power2.in" });
      }

      if (curtain && typeof gsap !== 'undefined') {
        // Wave surges up from the bottom
        await gsap.fromTo(curtain, 
          { top: '150vh', borderRadius: '50% 50% 0 0' },
          { top: '-25vh', borderRadius: '0% 0% 0 0', duration: 0.8, ease: "power3.inOut" }
        );
      }
    });

    // Custom Liquid In Animation (Revealing the new page)
    swup.hooks.replace('animation:in:await', async (visit) => {
      const curtain = document.getElementById('liquid-curtain');
      const chatWidget = document.getElementById('ai-chat-widget');

      if (chatWidget && typeof gsap !== 'undefined') {
        gsap.to(chatWidget, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.5)", delay: 0.2 });
      }

      if (curtain && typeof gsap !== 'undefined') {
        // Wave continues moving up off the screen
        await gsap.fromTo(curtain, 
          { top: '-25vh', borderRadius: '0% 0% 0 0' },
          { top: '-150vh', borderRadius: '0 0 50% 50%', duration: 0.8, ease: "power3.inOut" }
        );
        // Reset it silently below the screen for next time
        gsap.set(curtain, { top: '150vh', borderRadius: '50% 50% 0 0' });
      }
    });

    // 3. Re-initialize everything on page transition
    swup.hooks.on('content:replace', () => {
      // Clean up previous GSAP ScrollTriggers to prevent memory leaks
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(t => t.kill());
      }
      // Clean up AnimeJS instances
      if (typeof anime !== 'undefined') {
        anime.remove('*');
      }

      // Re-run animation logic for the new DOM
      if (typeof window.initAppAnimations === 'function') window.initAppAnimations();
      if (typeof window.initAdvancedInteractions === 'function') window.initAdvancedInteractions();
      if (typeof window.initCustomDropdowns === 'function') window.initCustomDropdowns();
      
      // Re-run dynamic page-specific data scripts
      if (document.getElementById('gallery-grid') && typeof window.initGallery === 'function') {
        window.initGallery();
      }
      if (document.getElementById('dynamic-offer-section') && typeof window.initOffer === 'function') {
        window.initOffer();
      }
      
      // Update active nav link
      updateActiveNavLink();
      
      // Scroll to top instantly before the new page reveals
      window.scrollTo(0, 0);
    });
  }
});
