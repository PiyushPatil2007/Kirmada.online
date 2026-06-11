// ==========================================
// Custom Dropdown UI Initialization
// Automatically converts <select> elements into premium custom UI
// ==========================================

window.initCustomDropdowns = function() {
  // Target both Admin selects and Contact form premium selects
  const selects = document.querySelectorAll('select.admin-select, select.premium-input');
  
  selects.forEach(select => {
    // Prevent double initialization
    if (select.dataset.customDropdownInitialized) return;
    select.dataset.customDropdownInitialized = 'true';
    
    // 1. Hide original select and any native arrows
    select.style.display = 'none';
    const nativeArrow = select.parentElement.querySelector('.select-arrow');
    if (nativeArrow) nativeArrow.style.display = 'none';
    
    // 2. Create Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    if (select.classList.contains('premium-input')) {
      wrapper.classList.add('is-premium');
      const formGroup = select.closest('.form-group');
      if (formGroup) {
        formGroup.classList.add('has-custom-select');
        const border = formGroup.querySelector('.input-border');
        if (border) border.style.display = 'none'; // Custom select uses full border on focus, so hide the bottom red line
      }
    }
    
    // Insert wrapper right after the original select
    select.parentNode.insertBefore(wrapper, select.nextSibling);
    
    // 3. Create Trigger (The visible button)
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    const triggerText = document.createElement('span');
    // Find selected option
    const selectedOption = select.options[select.selectedIndex];
    triggerText.textContent = selectedOption ? selectedOption.textContent : select.options[0].textContent;
    
    const arrow = document.createElement('div');
    arrow.className = 'custom-select-arrow';
    arrow.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    
    trigger.appendChild(triggerText);
    trigger.appendChild(arrow);
    wrapper.appendChild(trigger);
    
    // 4. Create Options Container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options';
    
    // Populate options
    Array.from(select.options).forEach((option, index) => {
      // Skip options that are purely placeholders (e.g. value="" and disabled)
      if (option.disabled && !option.value) return;
      
      const optionEl = document.createElement('div');
      optionEl.className = 'custom-option';
      if (option.selected) optionEl.classList.add('selected');
      
      optionEl.textContent = option.textContent;
      optionEl.dataset.value = option.value;
      
      optionEl.addEventListener('click', (e) => {
        // Update original select
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true })); // Trigger native change event
        
        // Update trigger text
        triggerText.textContent = option.textContent;
        
        // Update active class
        optionsContainer.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        optionEl.classList.add('selected');
        
        // Close dropdown
        wrapper.classList.remove('open');
        
        // Handle floating label if inside premium form
        if (select.classList.contains('premium-input')) {
          select.classList.add('has-value');
        }
      });
      
      optionsContainer.appendChild(optionEl);
    });
    
    wrapper.appendChild(optionsContainer);
    
    // 5. Toggle Dropdown Logic
    trigger.addEventListener('click', (e) => {
      // Close all other dropdowns
      document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
        if (w !== wrapper) w.classList.remove('open');
      });
      
      wrapper.classList.toggle('open');
      e.stopPropagation();
    });
    
    // Sync if original select changes externally
    select.addEventListener('change', () => {
      const selected = select.options[select.selectedIndex];
      if (selected) {
        triggerText.textContent = selected.textContent;
        optionsContainer.querySelectorAll('.custom-option').forEach(opt => {
          if (opt.dataset.value === selected.value) opt.classList.add('selected');
          else opt.classList.remove('selected');
        });
      }
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
      w.classList.remove('open');
    });
  });
};

document.addEventListener('DOMContentLoaded', window.initCustomDropdowns);
