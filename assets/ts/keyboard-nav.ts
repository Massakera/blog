export class KeyboardNavigation {
  private readonly SCROLL_AMOUNT = 100; // pixels to scroll

  constructor() {}

  public init(): void {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    document.addEventListener('keyup', this.handleKeyUp);
    this.addKeyboardShortcutsInfo();
    this.addKeyboardHint();
    // First-time notice removed for minimalist design
  }

  // Track state for link selection mode
  private linkHintsActive = false;
  private postLinks: HTMLAnchorElement[] = [];
  private linkHintsMap = new Map<string, HTMLAnchorElement>();
  
  private handleKeyPress(event: KeyboardEvent): void {
    // Skip if user is typing in an input, textarea, etc.
    if (this.isUserTyping()) {
      return;
    }
    
    // If we're in link selection mode, check for number keys
    if (this.linkHintsActive) {
      // If it's a number key
      if (/^[0-9]$/.test(event.key)) {
        const targetLink = this.linkHintsMap.get(event.key);
        if (targetLink) {
          targetLink.click();
          this.deactivateLinkHints();
          event.preventDefault();
        }
      } else if (event.key === 'Escape') {
        // Cancel link selection mode with Escape
        this.deactivateLinkHints();
        event.preventDefault();
      }
      return;
    }

    switch(event.key) {
      // Vim-like navigation
      case 'j': // Scroll down
        this.scrollVertically(this.SCROLL_AMOUNT);
        break;
      case 'k': // Scroll up
        this.scrollVertically(-this.SCROLL_AMOUNT);
        break;
      case 'h': // Previous page
        this.navigatePrevious();
        break;
      case 'l': // Next page
        this.navigateNext();
        break;
      case 'g': // Go to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'G': // Go to bottom (Shift+g)
        window.scrollTo({ 
          top: document.body.scrollHeight, 
          behavior: 'smooth' 
        });
        break;
      case 't': // First tab/nav link
        this.activateNavLink(0);
        break;
      case 'T': // Last tab/nav link
        const navLinks = this.getNavLinks();
        this.activateNavLink(navLinks.length - 1);
        break;
      case 'f': // Activate link selection mode for posts
        this.activateLinkHints();
        event.preventDefault();
        break;
      case 'a': // Go to About page
        this.navigateToPath('/about/');
        event.preventDefault();
        break;
      case 'p': // Go to Posts listing
        this.navigateToPath('/posts/');
        event.preventDefault();
        break;
      case 'H': // Go to Home
        this.navigateToPath('/');
        event.preventDefault();
        break;
      case '?': // Show help (on keydown)
        this.showHelpModal();
        break;
    }
  }
  
  // Handle key up events to hide the help modal when ? is released
  private handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key === '?') {
      this.hideHelpModal();
    }
  }

  private scrollVertically(amount: number): void {
    window.scrollBy({
      top: amount,
      behavior: 'smooth'
    });
  }

  private navigatePrevious(): void {
    const prevLink = document.querySelector('.prev-post') as HTMLAnchorElement;
    if (prevLink) {
      prevLink.click();
    }
  }

  private navigateNext(): void {
    const nextLink = document.querySelector('.next-post') as HTMLAnchorElement;
    if (nextLink) {
      nextLink.click();
    }
  }

  private activateNavLink(index: number): void {
    const navLinks = this.getNavLinks();
    if (navLinks.length > index) {
      navLinks[index].click();
    }
  }

  private getNavLinks(): HTMLAnchorElement[] {
    return Array.from(document.querySelectorAll('.terminal-menu a'));
  }

  private isUserTyping(): boolean {
    const element = document.activeElement;
    return element instanceof HTMLInputElement || 
           element instanceof HTMLTextAreaElement || 
           element instanceof HTMLSelectElement ||
           (element?.hasAttribute('contenteditable') || false);
  }

  private addKeyboardShortcutsInfo(): void {
    // Top nav button removed for minimalist design

    // Create help modal (hidden by default)
    const helpModal = document.createElement('div');
    helpModal.id = 'keyboard-shortcuts-modal';
    helpModal.className = 'help-modal';
    helpModal.style.display = 'none';
    
    helpModal.innerHTML = `
      <div class="help-modal-content">
        <h2>Keyboard Shortcuts</h2>
        <div class="shortcuts-grid">
          <div class="shortcut">
            <span class="key">j</span>
            <span class="description">Scroll down</span>
          </div>
          <div class="shortcut">
            <span class="key">k</span>
            <span class="description">Scroll up</span>
          </div>
          <div class="shortcut">
            <span class="key">h</span>
            <span class="description">Previous page</span>
          </div>
          <div class="shortcut">
            <span class="key">l</span>
            <span class="description">Next page</span>
          </div>
          <div class="shortcut">
            <span class="key">g</span>
            <span class="description">Go to top</span>
          </div>
          <div class="shortcut">
            <span class="key">G</span>
            <span class="description">Go to bottom</span>
          </div>
          <div class="shortcut">
            <span class="key">f</span>
            <span class="description">Show link numbers</span>
          </div>
          <div class="shortcut">
            <span class="key">a</span>
            <span class="description">Go to About</span>
          </div>
          <div class="shortcut">
            <span class="key">p</span>
            <span class="description">Go to Posts</span>
          </div>
          <div class="shortcut">
            <span class="key">H</span>
            <span class="description">Go to Home</span>
          </div>
          <div class="shortcut">
            <span class="key">t</span>
            <span class="description">First tab</span>
          </div>
          <div class="shortcut">
            <span class="key">T</span>
            <span class="description">Last tab</span>
          </div>
          <div class="shortcut">
            <span class="key">?</span>
            <span class="description">Hold to see this help</span>
          </div>
        </div>
        <button id="close-help-modal">Close</button>
      </div>
    `;
    
    document.body.appendChild(helpModal);
    
    // Add event listener to close button
    document.getElementById('close-help-modal')?.addEventListener('click', () => {
      this.hideHelpModal();
    });
    
    // Also close when clicking outside the modal content
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        this.hideHelpModal();
      }
    });
    
    // Add CSS for the modal
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      #keyboard-shortcuts {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-color);
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin-left: 10px;
      }
      
      #keyboard-shortcuts:hover {
        background-color: var(--border-color);
      }
      
      .help-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        overflow: auto;
      }
      
      .help-modal-content {
        background-color: var(--bg-color);
        margin: 10% auto;
        padding: 20px;
        border: 1px solid var(--border-color);
        width: 80%;
        max-width: 600px;
        border-radius: 5px;
      }
      
      .shortcuts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 10px;
        margin: 20px 0;
      }
      
      .shortcut {
        display: flex;
        align-items: center;
      }
      
      .key {
        background-color: var(--code-bg);
        padding: 5px 10px;
        border-radius: 3px;
        margin-right: 10px;
        font-family: var(--mono-font);
        font-weight: bold;
        min-width: 20px;
        text-align: center;
      }
      
      #close-help-modal {
        background-color: var(--accent-color);
        color: var(--bg-color);
        border: none;
        padding: 8px 16px;
        font-family: var(--mono-font);
        cursor: pointer;
        border-radius: 3px;
      }
      
      #close-help-modal:hover {
        opacity: 0.9;
      }
    `;
    document.head.appendChild(styleSheet);
  }
  
  private showHelpModal(): void {
    const modal = document.getElementById('keyboard-shortcuts-modal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  private hideHelpModal(): void {
    const modal = document.getElementById('keyboard-shortcuts-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  // Navigate to specific path
  private navigateToPath(path: string): void {
    const baseUrl = window.location.origin;
    window.location.href = baseUrl + path;
  }
  
  // Activate link hints mode
  private activateLinkHints(): void {
    // Get all post links on the page
    this.postLinks = Array.from(document.querySelectorAll('.post-link'));
    
    if (this.postLinks.length === 0) {
      return; // No links to highlight
    }
    
    this.linkHintsActive = true;
    this.linkHintsMap.clear();
    
    // Create overlay to darken the page
    const overlay = document.createElement('div');
    overlay.id = 'link-hints-overlay';
    overlay.className = 'link-hints-overlay';
    document.body.appendChild(overlay);
    
    // Add link numbers
    const maxLinks = Math.min(this.postLinks.length, 9); // Only use digits 1-9
    
    for (let i = 0; i < maxLinks; i++) {
      const link = this.postLinks[i];
      const hintNumber = (i + 1).toString();
      
      // Create a hint element
      const hint = document.createElement('span');
      hint.className = 'link-hint';
      hint.textContent = hintNumber;
      
      // Position it over the link
      const linkRect = link.getBoundingClientRect();
      hint.style.top = `${window.scrollY + linkRect.top - 10}px`;
      hint.style.left = `${window.scrollX + linkRect.left - 10}px`;
      
      // Add to document
      document.body.appendChild(hint);
      
      // Store mapping
      this.linkHintsMap.set(hintNumber, link);
    }
    
    // Add the CSS for hints
    if (!document.getElementById('link-hints-style')) {
      const style = document.createElement('style');
      style.id = 'link-hints-style';
      style.textContent = `
        .link-hints-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.3);
          z-index: 9000;
        }
        
        .link-hint {
          position: absolute;
          background-color: var(--accent-color);
          color: var(--bg-color);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          font-weight: bold;
          font-family: var(--mono-font);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9001;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Deactivate link hints mode
  private deactivateLinkHints(): void {
    this.linkHintsActive = false;
    
    // Remove overlay
    const overlay = document.getElementById('link-hints-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // Remove all hints
    document.querySelectorAll('.link-hint').forEach(hint => {
      hint.remove();
    });
  }
  
  private addKeyboardHint(): void {
    // Create a small hint element
    const hint = document.createElement('div');
    hint.id = 'keyboard-hint';
    hint.className = 'keyboard-hint';
    hint.innerHTML = `hold <span class="key-icon">&nbsp;?&nbsp;</span>for shortcuts`;
    
    // Add to the bottom right of the screen
    document.body.appendChild(hint);
    
    // Add CSS for the hint
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-hint {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 5px;
        padding: 8px 12px;
        font-family: var(--mono-font);
        font-size: 14px;
        display: flex;
        align-items: center;
        opacity: 0.8;
        z-index: 100;
        transition: opacity 0.3s ease;
      }
      
      .keyboard-hint:hover {
        opacity: 1;
      }
      
      .key-icon {
        display: inline-block;
        background-color: var(--code-bg);
        padding: 2px 6px;
        border-radius: 3px;
        margin-right: 8px;
        font-weight: bold;
      }
      
      .hint-text {
        display: inline-block;
      }
      
      @media (max-width: 768px) {
        .keyboard-hint {
          display: none;
        }
      }
      
      /* First-time visitor notice */
      .onboarding-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      
      .onboarding-card {
        background-color: var(--bg-color);
        border-radius: 8px;
        padding: 24px;
        max-width: 500px;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
        text-align: center;
      }
      
      .onboarding-title {
        font-size: 1.5rem;
        margin-bottom: 16px;
        border-bottom: none;
      }
      
      .key-highlight {
        animation: pulse 2s infinite;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: var(--code-bg);
        color: var(--accent-color);
        font-family: var(--mono-font);
        font-weight: bold;
        width: 40px;
        height: 40px;
        border-radius: 5px;
        margin: 20px auto;
        font-size: 24px;
      }
      
      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
        }
        
        70% {
          transform: scale(1.1);
          box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
        }
        
        100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        }
      }
      
      .onboarding-text {
        margin-bottom: 20px;
        line-height: 1.6;
      }
      
      .onboarding-buttons {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
      
      .onboarding-button {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-family: var(--mono-font);
        border: none;
      }
      
      .onboarding-primary {
        background-color: var(--accent-color);
        color: var(--bg-color);
      }
      
      .onboarding-secondary {
        background-color: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-color);
      }
    `;
    document.head.appendChild(style);
    
    // Add a timeout to fade out the hint after a few seconds
    setTimeout(() => {
      hint.style.opacity = '0.4';
    }, 5000);
    
    // Show the hint more clearly when hovering
    hint.addEventListener('mouseenter', () => {
      hint.style.opacity = '1';
    });
    
    hint.addEventListener('mouseleave', () => {
      hint.style.opacity = '0.4';
    });
    
    // Make the hint clickable to show shortcuts
    hint.addEventListener('click', () => {
      this.showHelpModal();
    });
  }
  
  private showFirstTimeNotice(): void {
    // Check if we've shown this before
    const hasSeenOnboarding = localStorage.getItem('keyboard-nav-onboarding');
    
    if (hasSeenOnboarding === 'true') {
      return;
    }
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    
    // Create card content
    const card = document.createElement('div');
    card.className = 'onboarding-card';
    
    card.innerHTML = `
      <h2 class="onboarding-title">This blog has keyboard shortcuts!</h2>
      <div class="key-highlight">?</div>
      <p class="onboarding-text">
        Hold the <strong>?</strong> key anytime to see available shortcuts.<br/>
        Navigate using Vim-like keys - no clicking required.
      </p>
      <div class="onboarding-buttons">
        <button class="onboarding-button onboarding-primary" id="try-shortcuts">Try it now</button>
        <button class="onboarding-button onboarding-secondary" id="dismiss-onboarding">Got it</button>
      </div>
    `;
    
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    
    // Trigger a fade-in animation
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 500);
    
    // Set up button actions
    document.getElementById('try-shortcuts')?.addEventListener('click', () => {
      this.dismissOnboarding(overlay);
      this.showHelpModal();
    });
    
    document.getElementById('dismiss-onboarding')?.addEventListener('click', () => {
      this.dismissOnboarding(overlay);
    });
    
    // Also dismiss when pressing Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.parentNode) {
        this.dismissOnboarding(overlay);
      }
    });
  }
  
  private dismissOnboarding(overlay: HTMLElement): void {
    // Fade out
    overlay.style.opacity = '0';
    
    // Remove from DOM after animation
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 500);
    
    // Save preference
    localStorage.setItem('keyboard-nav-onboarding', 'true');
  }
}