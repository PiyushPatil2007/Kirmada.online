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
  if (lensCursor) {
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

    // Hover states for links and buttons to expand the lens
    const interactiveElements = document.querySelectorAll('a, button, .bento-flex-card, .service-card, .stagger-card, .arch-card, .nav-btn, input, select, textarea');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Click state
    window.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    window.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
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

};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Load
  if (typeof window.initAppAnimations === 'function') window.initAppAnimations();
  if (typeof window.initAdvancedInteractions === 'function') window.initAdvancedInteractions();

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
      if (curtain && typeof gsap !== 'undefined') {
        // Wave surges up from the bottom
        await gsap.fromTo(curtain, 
          { top: '100vh', borderRadius: '50% 50% 0 0' },
          { top: '-25vh', borderRadius: '0% 0% 0 0', duration: 0.8, ease: "power3.inOut" }
        );
      }
    });

    // Custom Liquid In Animation (Revealing the new page)
    swup.hooks.replace('animation:in:await', async (visit) => {
      const curtain = document.getElementById('liquid-curtain');
      if (curtain && typeof gsap !== 'undefined') {
        // Wave continues moving up off the screen
        await gsap.fromTo(curtain, 
          { top: '-25vh', borderRadius: '0% 0% 0 0' },
          { top: '-150vh', borderRadius: '0 0 50% 50%', duration: 0.8, ease: "power3.inOut" }
        );
        // Reset it silently below the screen for next time
        gsap.set(curtain, { top: '100vh', borderRadius: '50% 50% 0 0' });
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
      
      // Update active nav link
      updateActiveNavLink();
      
      // Scroll to top instantly before the new page reveals
      window.scrollTo(0, 0);
    });
  }
});
