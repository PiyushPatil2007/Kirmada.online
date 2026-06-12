import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// ==========================================================================
// Cloudinary Configuration (Free Tier — 25 GB storage, 25 GB bandwidth)
// Uses unsigned upload preset for client-side uploads.
// ==========================================================================
const CLOUDINARY_CLOUD_NAME = 'dtegya7v8';
const CLOUDINARY_UPLOAD_PRESET = 'kirmada_unsigned';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// === UI Elements ===
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const userEmailDisplay = document.getElementById('user-email');
const btnLogout = document.getElementById('btn-logout');
const statusBanner = document.getElementById('global-status');

// Status Banner Logic
function showStatus(message, isError = false) {
  statusBanner.textContent = message;
  statusBanner.style.display = 'block';
  statusBanner.className = 'status-banner'; // reset
  statusBanner.classList.add(isError ? 'status-error' : 'status-success');
  
  // Animate in
  anime({
    targets: statusBanner,
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 400,
    easing: 'easeOutQuad'
  });

  setTimeout(() => {
    anime({
      targets: statusBanner,
      opacity: 0,
      duration: 400,
      easing: 'easeInQuad',
      complete: () => { statusBanner.style.display = 'none'; }
    });
  }, 4000);
}

// === Authentication ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Logged in
    authScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    userEmailDisplay.style.display = 'inline-block';
    userEmailDisplay.textContent = user.email;
    btnLogout.style.display = 'inline-block';
    
    // Animate dashboard in
    anime({
      targets: dashboardScreen,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      easing: 'easeOutQuart'
    });

    // Load existing offer data into the form
    loadExistingOffer();
    loadGalleryItems();
    loadLeads();
  } else {
    // Logged out
    authScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
    userEmailDisplay.style.display = 'none';
    btnLogout.style.display = 'none';
  }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const btn = e.target.querySelector('button');
    btn.textContent = 'Authenticating...';
    btn.disabled = true;
    
    await signInWithEmailAndPassword(auth, email, password);
    showStatus('Login successful');
  } catch (error) {
    showStatus(error.message, true);
    const btn = e.target.querySelector('button');
    btn.textContent = 'Access Dashboard';
    btn.disabled = false;
  }
});

btnLogout.addEventListener('click', () => {
  signOut(auth).then(() => {
    showStatus('Logged out successfully');
  });
});

// === Load Existing Offer into Form ===
async function loadExistingOffer() {
  try {
    const offerDoc = await getDoc(doc(db, "offers", "current"));
    if (offerDoc.exists()) {
      const data = offerDoc.data();
      document.getElementById('offer-active').value = data.active ? 'true' : 'false';
      document.getElementById('offer-headline').value = data.headline || '';
      document.getElementById('offer-desc').value = data.description || '';
      document.getElementById('offer-discount').value = data.discount || '';
      document.getElementById('offer-spots').value = data.spots || '';
      document.getElementById('offer-end').value = data.endTime || '';
      
      const container = document.getElementById('benefits-container');
      container.innerHTML = ''; // Clear existing
      if (data.benefits && Array.isArray(data.benefits)) {
        data.benefits.forEach(benefit => addBenefitInput(benefit));
      }
    }
  } catch (err) {
    console.log('No existing offer found or error loading:', err.message);
  }
}

// === Tabs Logic ===
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Remove active from all
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active to clicked
    const targetId = e.target.getAttribute('data-target');
    e.target.classList.add('active');
    const targetContent = document.getElementById(targetId);
    targetContent.classList.add('active');
    
    // Animate tab content
    anime({
      targets: targetContent,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
      easing: 'easeOutQuad'
    });
  });
});

// === Instagram-Style Dropzone Logic ===
const dropzone = document.getElementById('ig-dropzone');
const fileInput = document.getElementById('gallery-file');
const previewImg = document.getElementById('ig-preview');
const typeSelect = document.getElementById('gallery-type');
const urlGroup = document.getElementById('url-group');
let selectedFile = null;

// Handle Type Change
typeSelect.addEventListener('change', (e) => {
  if (e.target.value === 'image') {
    urlGroup.style.display = 'none';
    document.querySelector('.ig-dropzone p.body-md').textContent = 'Drag photos here';
  } else if (e.target.value === 'video') {
    urlGroup.style.display = 'block';
    document.querySelector('.ig-dropzone p.body-md').textContent = 'Drag optional thumbnail here';
  } else {
    urlGroup.style.display = 'block';
    document.querySelector('.ig-dropzone p.body-md').textContent = 'Drag optional thumbnail here';
  }
});

// Click to open file dialog
dropzone.addEventListener('click', () => fileInput.click());

// Drag and Drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
});
['dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
});

dropzone.addEventListener('drop', (e) => {
  let dt = e.dataTransfer;
  let files = dt.files;
  handleFiles(files);
});
fileInput.addEventListener('change', function() {
  handleFiles(this.files);
});

function handleFiles(files) {
  if (files.length > 0) {
    const file = files[0];
    
    // Cloudinary Security Rules (Frontend Validation)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'video/mp4'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      showStatus('Security Alert: Invalid file type. Only PNG, JPG, WEBP, and MP4 are allowed.', true);
      return;
    }

    if (file.size > maxSize) {
      showStatus(`Security Alert: File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 5MB.`, true);
      return;
    }

    selectedFile = file;
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
        
        // Pop animation
        anime({
          targets: previewImg,
          scale: [0.9, 1],
          opacity: [0, 1],
          duration: 400,
          easing: 'easeOutBack'
        });
      };
      reader.readAsDataURL(selectedFile);
    } else {
      showStatus('Please select an image file', true);
    }
  }
}

// ==========================================================================
// Cloudinary Upload Helper
// Uploads a file to Cloudinary and returns the secure URL.
// ==========================================================================
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'kirmada-gallery');

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

// === Gallery Form Submission ===
document.getElementById('gallery-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const type = document.getElementById('gallery-type').value;
  const url = document.getElementById('gallery-url').value;
  const title = document.getElementById('gallery-title').value;
  const metric = document.getElementById('gallery-metric').value;
  const isPinned = document.getElementById('gallery-pin') ? document.getElementById('gallery-pin').checked : false;
  const btn = document.getElementById('btn-post-gallery');
  
  if (type === 'image' && !selectedFile) {
    showStatus('Please upload an image for Image type posts.', true);
    return;
  }
  if ((type === 'video' || type === 'website') && !url) {
    showStatus('Please provide a URL for Video/Website posts.', true);
    return;
  }

  try {
    btn.textContent = 'Uploading...';
    btn.disabled = true;
    
    let imageUrl = '';
    
    // Auto-fetch YouTube thumbnail if it's a video and no thumbnail was uploaded
    if (type === 'video' && !selectedFile && url.includes('youtu')) {
      const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
      if (videoIdMatch && videoIdMatch[1]) {
        imageUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
      }
    }

    // Upload image/thumbnail to Cloudinary (FREE — no Firebase Storage needed)
    if (selectedFile) {
      btn.textContent = 'Uploading image...';
      imageUrl = await uploadToCloudinary(selectedFile);
    }

    // Save to Firestore
    btn.textContent = 'Saving to database...';
    await addDoc(collection(db, "gallery"), {
      type: type,
      url: type === 'image' ? '' : url,
      imageUrl: imageUrl,
      title: title,
      metric: metric,
      isPinned: isPinned,
      createdAt: serverTimestamp()
    });

    showStatus('Successfully posted to Gallery!');
    loadGalleryItems();
    
    // Reset form
    e.target.reset();
    selectedFile = null;
    previewImg.style.display = 'none';
    previewImg.src = '';
    urlGroup.style.display = 'none';
    document.querySelector('.ig-dropzone p.body-md').textContent = 'Drag photos here';
    
  } catch (error) {
    showStatus('Error uploading: ' + error.message, true);
  } finally {
    btn.textContent = 'Post to Gallery';
    btn.disabled = false;
  }
});

// === Key Benefits Dynamic List ===
function addBenefitInput(value = '') {
  const container = document.getElementById('benefits-container');
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.gap = '8px';
  wrapper.style.alignItems = 'center';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'admin-input benefit-input';
  input.style.paddingLeft = '20px'; // Override the icon padding
  input.placeholder = 'e.g. Free 1-year hosting';
  input.value = value;
  input.required = true;
  
  const btnRemove = document.createElement('button');
  btnRemove.type = 'button';
  btnRemove.style.background = 'rgba(255, 255, 255, 0.05)';
  btnRemove.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  btnRemove.style.color = 'var(--on-dark-mute)';
  btnRemove.style.width = '36px';
  btnRemove.style.height = '36px';
  btnRemove.style.borderRadius = 'var(--rounded-full)';
  btnRemove.style.display = 'flex';
  btnRemove.style.alignItems = 'center';
  btnRemove.style.justifyContent = 'center';
  btnRemove.style.cursor = 'pointer';
  btnRemove.style.transition = 'all 0.2s';
  btnRemove.onmouseover = () => {
    btnRemove.style.background = 'rgba(234, 40, 4, 0.1)';
    btnRemove.style.borderColor = 'rgba(234, 40, 4, 0.3)';
    btnRemove.style.color = 'var(--primary)';
    btnRemove.style.transform = 'scale(1.05)';
  };
  btnRemove.onmouseout = () => {
    btnRemove.style.background = 'rgba(255, 255, 255, 0.05)';
    btnRemove.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    btnRemove.style.color = 'var(--on-dark-mute)';
    btnRemove.style.transform = 'scale(1)';
  };
  btnRemove.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  btnRemove.onclick = () => wrapper.remove();
  
  wrapper.appendChild(input);
  wrapper.appendChild(btnRemove);
  container.appendChild(wrapper);
}

document.getElementById('btn-add-benefit').addEventListener('click', () => {
  addBenefitInput();
});

// === Offer Form Submission ===
document.getElementById('offer-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-save-offer');
  
  const offerData = {
    active: document.getElementById('offer-active').value === 'true',
    headline: document.getElementById('offer-headline').value,
    description: document.getElementById('offer-desc').value,
    discount: parseInt(document.getElementById('offer-discount').value),
    spots: parseInt(document.getElementById('offer-spots').value),
    endTime: document.getElementById('offer-end').value,
    benefits: Array.from(document.querySelectorAll('.benefit-input')).map(input => input.value).filter(val => val.trim() !== ''),
    updatedAt: serverTimestamp()
  };

  try {
    btn.textContent = 'Saving...';
    btn.disabled = true;
    
    // We store the offer in a specific document called 'current' in the 'offers' collection
    await setDoc(doc(db, "offers", "current"), offerData);
    showStatus('Offer updated and published successfully!');
  } catch (error) {
    showStatus('Error updating offer: ' + error.message, true);
  } finally {
    btn.textContent = 'Save & Publish Offer';
    btn.disabled = false;
  }
});

document.getElementById('btn-delete-offer').addEventListener('click', async (e) => {
  if (!confirm("Are you sure you want to completely delete the current offer? This will immediately hide it from the site.")) return;
  
  try {
    e.target.textContent = 'Deleting...';
    e.target.disabled = true;
    
    await deleteDoc(doc(db, "offers", "current"));
    showStatus('Offer deleted successfully!');
    
    // Reset form
    document.getElementById('offer-form').reset();
    document.getElementById('offer-active').value = 'false';
    document.getElementById('benefits-container').innerHTML = '';
  } catch (error) {
    showStatus('Error deleting offer: ' + error.message, true);
  } finally {
    e.target.textContent = 'Delete Offer';
    e.target.disabled = false;
  }
});

// === Load Live Gallery Items ===
async function loadGalleryItems() {
  const listContainer = document.getElementById('gallery-items-list');
  const loadingText = document.getElementById('gallery-items-loading');
  
  if (!listContainer) return;

  try {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    listContainer.innerHTML = '';
    if (snapshot.empty) {
      loadingText.textContent = "No gallery items found.";
      loadingText.style.display = 'block';
      return;
    }

    loadingText.style.display = 'none';
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;
      
      const row = document.createElement('div');
      row.className = 'gallery-item-row';
      
      let imgHtml = data.imageUrl 
        ? `<img src="${data.imageUrl}" class="gallery-item-thumb" alt="${data.title}">`
        : `<div class="gallery-item-thumb" style="display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;text-transform:uppercase;">${data.type}</div>`;
        
      let pinBadgeHtml = data.isPinned ? `<span class="type-badge" style="background: rgba(234,40,4,0.1); color: var(--primary); border: 1px solid var(--primary);">📌 Pinned</span>` : '';

      row.innerHTML = `
        ${imgHtml}
        <div class="gallery-item-info">
          <div class="gallery-item-title">${data.title}</div>
          <div class="gallery-item-meta">
            ${pinBadgeHtml}
            <span class="type-badge ${data.type}">${data.type}</span>
            <span>${data.metric || ''}</span>
          </div>
        </div>
        <button class="btn-delete" data-id="${id}">Delete</button>
      `;
      
      listContainer.appendChild(row);
    });
    
    // Attach delete listeners
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        const itemId = e.target.getAttribute('data-id');
        
        try {
          e.target.textContent = 'Deleting...';
          e.target.disabled = true;
          await deleteDoc(doc(db, "gallery", itemId));
          showStatus("Item deleted successfully!");
          loadGalleryItems(); // Refresh the list
        } catch (error) {
          showStatus("Error deleting item: " + error.message, true);
          e.target.textContent = 'Delete';
          e.target.disabled = false;
        }
      });
    });

  } catch (error) {
    loadingText.textContent = "Error loading items: " + error.message;
    loadingText.style.display = 'block';
  }
}

// === Load Captured Leads ===
async function loadLeads() {
  const tableBody = document.getElementById('leads-table-body');
  if (!tableBody) return;

  try {
    tableBody.innerHTML = '<tr><td colspan="4" style="padding: 32px; text-align: center; color: var(--on-dark-mute);">Loading leads...</td></tr>';
    
    // Query leads ordered by newest first
    const q = query(collection(db, "leads"), orderBy("capturedAt", "desc"));
    const snapshot = await getDocs(q);
    
    tableBody.innerHTML = ''; // Clear loading
    
    if (snapshot.empty) {
      tableBody.innerHTML = '<tr><td colspan="4" style="padding: 32px; text-align: center; color: var(--on-dark-mute);">No leads captured yet.</td></tr>';
      return;
    }
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--divider-dark)';
      tr.style.transition = 'background-color 0.2s';
      tr.onmouseover = () => tr.style.backgroundColor = 'rgba(255,255,255,0.02)';
      tr.onmouseout = () => tr.style.backgroundColor = 'transparent';
      
      const email = data.email || 'Unknown';
      const source = data.source || 'Website';
      const context = data.messageContext || '-';
      
      let dateStr = 'Unknown Date';
      if (data.capturedAt && data.capturedAt.toDate) {
        const dateObj = data.capturedAt.toDate();
        dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }
      
      tr.innerHTML = `
        <td style="padding: 16px; color: white; font-weight: 600;">${email}</td>
        <td style="padding: 16px; color: var(--on-dark-mute);"><span style="background: rgba(234,40,4,0.1); color: var(--hero-glow); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;">${source}</span></td>
        <td style="padding: 16px; color: var(--on-dark-mute); font-size: 14px; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${context.replace(/"/g, '&quot;')}">${context}</td>
        <td style="padding: 16px; color: var(--on-dark-mute); font-size: 14px;">${dateStr}</td>
      `;
      
      tableBody.appendChild(tr);
    });
    
  } catch (error) {
    console.error("Error loading leads:", error);
    tableBody.innerHTML = `<tr><td colspan="4" style="padding: 32px; text-align: center; color: #f87171;">Error loading leads: ${error.message}</td></tr>`;
  }
}

// Bind the refresh button
const refreshBtn = document.getElementById('btn-refresh-leads');
if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    refreshBtn.querySelector('svg').style.animation = 'spin 1s linear infinite';
    loadLeads().then(() => {
      setTimeout(() => { refreshBtn.querySelector('svg').style.animation = ''; }, 500);
    });
  });
}
// Add keyframes for spin if not already present
const styleSheet = document.createElement("style");
styleSheet.innerText = "@keyframes spin { 100% { transform: rotate(360deg); } }";
document.head.appendChild(styleSheet);
