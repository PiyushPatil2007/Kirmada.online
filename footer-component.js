class KirmadaFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="footer-premium">
        <div class="footer-premium-glow"></div>
        
        <div class="container footer-premium-top">
          <div class="footer-brand-col">
            <a href="index.html" class="footer-logo">
              <img src="large-logo.png" alt="Kirmada Logo" style="filter: hue-rotate(-115deg) saturate(1.5); width: 140px; margin-bottom: 24px;">
            </a>
            <p class="footer-mission">
              Commanding the digital frontier. We build, scale, and automate digital empires with elite precision.
            </p>
            <div class="footer-status">
              <span class="status-dot pulse-dot"></span>
              <span>Accepting New Clients</span>
            </div>
            <a href="mailto:kirmada.online@gmail.com" class="footer-email">kirmada.online@gmail.com</a>
          </div>

          <div class="footer-links-col">
            <div class="footer-nav-group">
              <h4 class="footer-heading">Navigation</h4>
              <a href="index.html" class="footer-link">Home</a>
              <a href="services.html" class="footer-link">Services</a>
              <a href="gallery.html" class="footer-link">Gallery</a>
              <a href="about.html" class="footer-link">About Us</a>
              <a href="contact.html" class="footer-link">Contact</a>
            </div>
            
            <div class="footer-nav-group">
              <h4 class="footer-heading">Social</h4>
              <a href="https://wa.me/9028551638" target="_blank" class="footer-link">WhatsApp</a>
              <a href="https://www.instagram.com/kirmada.online/" target="_blank" class="footer-link">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61590268064411" target="_blank" class="footer-link">Facebook</a>
              <a href="https://x.com/kirmadaonline" target="_blank" class="footer-link">X (Twitter)</a>
            </div>

            <div class="footer-nav-group">
              <h4 class="footer-heading">Legal</h4>
              <a href="#" class="footer-link">Privacy Policy</a>
              <a href="#" class="footer-link">Terms of Service</a>
              <a href="admin.html" class="footer-link">Agency Login</a>
            </div>
          </div>
        </div>
        
        <div class="footer-premium-bottom">
          <div class="container flex justify-between items-center bottom-text-row">
            <p>&copy; 2026 Kirmada.Online. All rights reserved.</p>
            <p>Engineered for Dominance.</p>
          </div>
          
          <!-- MASSIVE KINETIC TEXT -->
          <div class="footer-massive-text">
            KIRMADA.ONLINE
          </div>
        </div>
      </footer>
    `;
  }
}

// Define the custom element
customElements.define('kirmada-footer', KirmadaFooter);
