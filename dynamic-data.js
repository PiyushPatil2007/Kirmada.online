import { db } from './firebase-config.js';
import { doc, getDoc, collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

window.db = db;
window.firebaseFirestore = { collection, addDoc, serverTimestamp };

window.initOffer = async () => {
  try {
    const docSnap = await getDoc(doc(db, "offers", "current"));
    if (docSnap.exists() && docSnap.data().active) {
      const data = docSnap.data();
      const endTime = new Date(data.endTime).getTime();
      const now = new Date().getTime();
      
      if (endTime > now) {
        const headlineEl = document.getElementById('offer-headline');
        const descEl = document.getElementById('offer-desc');
        const discountEl = document.getElementById('offer-discount');
        const spotsEl = document.getElementById('offer-spots');
        const section = document.getElementById('dynamic-offer-section');
        
        if (!section) return; // Not on home page
        
        if (headlineEl) headlineEl.textContent = data.headline;
        if (descEl) descEl.textContent = data.description;
        if (discountEl) discountEl.textContent = data.discount + '%';
        if (spotsEl) spotsEl.textContent = data.spots;
        
        // Handle Key Benefits
        const benefitsContainer = document.getElementById('offer-benefits-container');
        const benefitsGrid = document.getElementById('offer-benefits-grid');
        
        if (benefitsContainer && benefitsGrid && data.benefits && data.benefits.length > 0) {
          benefitsGrid.innerHTML = '';
          data.benefits.forEach(benefit => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '8px';
            div.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span class="body-sm" style="color: white; font-weight: 500; font-size: 13px;">${benefit}</span>
            `;
            benefitsGrid.appendChild(div);
          });
          benefitsContainer.style.display = 'block';
        } else if (benefitsContainer) {
          benefitsContainer.style.display = 'none';
        }
        
        section.style.display = 'block';
        
        // The layout just changed height, so we must tell GSAP's ScrollTrigger to recalculate
        if (window.ScrollTrigger) {
          setTimeout(() => ScrollTrigger.refresh(), 100);
        }

        const tl = anime.timeline({ easing: 'easeOutExpo', duration: 1000 });
        tl.add({
          targets: section,
          opacity: [0, 1],
          translateY: [50, 0]
        }).add({
          targets: '#dynamic-offer-section .display-lg, #dynamic-offer-section .body-lg',
          translateY: [20, 0],
          opacity: [0, 1],
          delay: anime.stagger(100)
        }, '-=600');

        const daysEl = document.querySelector('.countdown-days');
        const hoursEl = document.querySelector('.countdown-hours');
        const minutesEl = document.querySelector('.countdown-minutes');
        const secondsEl = document.querySelector('.countdown-seconds');

        if (window.offerTimerInterval) clearInterval(window.offerTimerInterval);

        window.offerTimerInterval = setInterval(() => {
          const currentNow = new Date().getTime();
          const distance = endTime - currentNow;

          if (!document.body.contains(section)) {
            clearInterval(window.offerTimerInterval);
            return;
          }

          if (distance < 0) {
            clearInterval(window.offerTimerInterval);
            anime({
              targets: section,
              opacity: 0,
              translateY: -20,
              duration: 800,
              easing: 'easeInQuad',
              complete: () => { 
                section.style.display = 'none';
                if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 100);
              }
            });
            return;
          }

          if(daysEl) daysEl.textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
          if(hoursEl) hoursEl.textContent = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
          if(minutesEl) minutesEl.textContent = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
          if(secondsEl) secondsEl.textContent = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');

          if (secondsEl) {
            anime({
              targets: secondsEl,
              translateY: [-10, 0],
              opacity: [0.3, 1],
              color: ['#ea2804', '#ffffff'],
              duration: 500,
              easing: 'easeOutBack'
            });
          }
        }, 1000);
      }
    }
  } catch (error) {
    console.error("Error fetching offer:", error);
  }
};

window.initGallery = async () => {
  const title = document.getElementById('gallery-title');
  if (title) {
    anime({
      targets: title,
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1200,
      ease: 'easeOutExpo'
    });
  }

  const grid = document.getElementById('gallery-grid');
  const loading = document.getElementById('loading');
  const filters = document.querySelectorAll('.sub-nav-pill');
  const layoutBtns = document.querySelectorAll('.layout-switcher .btn-icon');
  if (!grid) return; // Not on gallery page

  let allItems = [];
  let currentLayout = 'masonry'; // default layout

  // Setup cursor follower for List View
  let cursorFollower = document.getElementById('hover-reveal-cursor');
  if (!cursorFollower) {
    cursorFollower = document.createElement('div');
    cursorFollower.id = 'hover-reveal-cursor';
    document.body.appendChild(cursorFollower);
    
    document.addEventListener('mousemove', (e) => {
      if(currentLayout === 'list' && cursorFollower.classList.contains('active')) {
        // smooth follow
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
      }
    });
  }

  try {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    snapshot.forEach(doc => {
      allItems.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort so pinned items are always at the top
    allItems.sort((a, b) => (b.isPinned === true) - (a.isPinned === true));
    
    if (loading) loading.style.display = 'none';
    renderGrid(allItems);

  } catch (error) {
    console.error("Error loading gallery:", error);
    if (loading) loading.textContent = "Error loading gallery. Ensure Firebase is configured.";
  }

  filters.forEach(btn => {
    // Prevent multiple bindings
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      document.querySelectorAll('.sub-nav-pill').forEach(f => f.classList.remove('active'));
      e.target.classList.add('active');
      
      const filterType = e.target.getAttribute('data-filter');
      
      const currentCards = document.querySelectorAll('.gallery-card');
      if(currentCards.length > 0) {
        anime({
          targets: currentCards,
          opacity: 0,
          scale: 0.9,
          duration: 300,
          easing: 'easeInQuad',
          complete: () => {
            const filtered = filterType === 'all' ? allItems : allItems.filter(item => item.type === filterType);
            renderGrid(filtered);
          }
        });
      } else {
        const filtered = filterType === 'all' ? allItems : allItems.filter(item => item.type === filterType);
        renderGrid(filtered);
      }
    });
  });

  // Layout Switcher Logic
  layoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget;
      layoutBtns.forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'var(--hairline-strong)';
        b.style.color = 'var(--charcoal)';
      });
      targetBtn.classList.add('active');
      targetBtn.style.borderColor = 'var(--primary)';
      targetBtn.style.color = 'var(--primary)';
      
      const newLayout = targetBtn.getAttribute('data-layout');
      if (newLayout === currentLayout) return;
      
      currentLayout = newLayout;
      
      // Animate transition
      anime({
        targets: grid,
        opacity: [1, 0],
        translateY: [0, 10],
        duration: 200,
        easing: 'easeInQuad',
        complete: () => {
          // Remove old view classes
          grid.classList.remove('view-bento', 'view-masonry', 'view-filmstrip', 'view-list');
          grid.classList.add('view-' + currentLayout);
          
          // Re-render items to apply specific classes (like bento spanning)
          const activeFilterBtn = document.querySelector('.sub-nav-pill.active');
          const filterType = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
          const filtered = filterType === 'all' ? allItems : allItems.filter(item => item.type === filterType);
          
          renderGrid(filtered);
          
          anime({
            targets: grid,
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 300,
            easing: 'easeOutQuad'
          });
        }
      });
    });
  });

  // Default initialize with masonry class
  grid.classList.add('view-masonry');

  function renderGrid(items) {
    if (!grid) return;
    grid.innerHTML = '';
    
    if (items.length === 0) {
      grid.innerHTML = '<p class="body-md" style="grid-column: 1/-1; text-align: center; color: var(--charcoal);">No items found in this category.</p>';
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';

      if(item.type !== 'image' && item.url) {
        if (item.type === 'video') {
          card.onclick = () => openVideoModal(item.url);
        } else {
          card.onclick = () => window.open(item.url, '_blank');
        }
      }

      let metricHtml = item.metric ? `<div class="gallery-metric">${item.metric}</div>` : '';
      let playIcon = item.type === 'video' ? `<div class="video-play-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>` : '';
      let pinBadgeHtml = item.isPinned ? `<div class="gallery-pin-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> Pinned</div>` : '';
      
      let imgHtml = item.imageUrl 
        ? `<img src="${item.imageUrl}" class="gallery-thumb" alt="${item.title}">` 
        : `<div class="gallery-thumb" style="background: linear-gradient(45deg, var(--surface-dark), var(--primary)); display: flex; align-items:center; justify-content:center; color:white;">${item.type.toUpperCase()}</div>`;
        
      if (item.type === 'video' && item.url) {
        // Embed silent background video if URL is present (for filmstrip/bento)
        let embedUrl = item.url;
        if (embedUrl.includes('youtube.com/watch?v=')) embedUrl = embedUrl.replace('watch?v=', 'embed/');
        else if (embedUrl.includes('youtu.be/')) embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
        // We do not actually load the iframe in the grid for performance unless in Bento or Filmstrip? 
        // Actually, just showing the thumbnail is better for performance. The user liked the glassmorphism modal.
      }

      card.innerHTML = `
        ${pinBadgeHtml}
        ${imgHtml}
        ${metricHtml}
        ${playIcon}
        <div style="position: relative; z-index: 3;">
          <h3 class="heading-sm">${item.title}</h3>
          <p class="body-sm" style="color: var(--charcoal); margin-top: 4px; text-transform: capitalize;">${item.type}</p>
        </div>
      `;

      // Animations and interactions based on layout
      if (currentLayout !== 'list') {
        card.addEventListener('mouseenter', () => {
          anime({
            targets: card,
            scale: currentLayout === 'filmstrip' ? 1.05 : 1.03,
            translateY: currentLayout === 'filmstrip' ? 0 : -5,
            boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
            duration: 800,
            elasticity: 400 
          });
        });
        card.addEventListener('mouseleave', () => {
          anime({
            targets: card,
            scale: 1,
            translateY: 0,
            boxShadow: '0 0px 0px rgba(0,0,0,0)',
            duration: 600,
            elasticity: 300
          });
        });
      } else {
        // List view hover cursor logic
        card.addEventListener('mouseenter', (e) => {
          if (cursorFollower) {
            cursorFollower.innerHTML = imgHtml;
            cursorFollower.classList.add('active');
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
          }
        });
        card.addEventListener('mouseleave', () => {
          if (cursorFollower) {
            cursorFollower.classList.remove('active');
          }
        });
      }

      grid.appendChild(card);
    });

    if (currentLayout !== 'list') {
      anime({
        targets: '.gallery-card',
        translateY: [40, 0],
        opacity: [0, 1],
        delay: anime.stagger(50), 
        duration: 800,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      anime({
        targets: '.gallery-card',
        translateX: [-40, 0],
        opacity: [0, 1],
        delay: anime.stagger(30), 
        duration: 600,
        easing: 'easeOutExpo'
      });
    }
  }

  // --- Glassmorphism Video Modal ---
  function openVideoModal(url) {
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
    }

    const overlay = document.createElement('div');
    overlay.className = 'video-modal-overlay';
    
    const content = document.createElement('div');
    content.className = 'video-modal-content';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'video-modal-close btn-icon';
    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl + (embedUrl.includes('?') ? '&autoplay=1' : '?autoplay=1');
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    
    content.appendChild(closeBtn);
    content.appendChild(iframe);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    anime({
      targets: overlay,
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutSine'
    });

    anime({
      targets: content,
      scale: [0.8, 1],
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 800,
      elasticity: 400
    });

    const close = () => {
      anime({
        targets: overlay,
        opacity: 0,
        duration: 300,
        easing: 'easeInSine',
        complete: () => overlay.remove()
      });
      anime({
        targets: content,
        scale: 0.9,
        translateY: 20,
        duration: 300,
        easing: 'easeInQuad'
      });
    };

    closeBtn.onclick = close;
    overlay.onclick = (e) => {
      if(e.target === overlay) close();
    };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dynamic-offer-section')) window.initOffer();
  if (document.getElementById('gallery-grid')) window.initGallery();
});
