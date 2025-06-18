type Language = 'en' | 'pt-br';

export class LanguageSwitcher {
  private storageKey = 'blog-language-preference';
  private defaultLanguage: Language = 'en';
  private currentLanguage: Language;

  constructor() {
    // Check for language in URL path first (Hugo's multilingual URL structure)
    const path = window.location.pathname;
    const pathLanguage = path.startsWith('/pt-br/') ? 'pt-br' : null;
    
    // Fall back to stored preference or browser language
    const savedLanguage = localStorage.getItem(this.storageKey) as Language;
    const browserLanguage = navigator.language.startsWith('pt') ? 'pt-br' : 'en';
    
    // Priority: 1. URL path language, 2. Saved preference, 3. Browser language, 4. Default
    this.currentLanguage = pathLanguage || savedLanguage || browserLanguage || this.defaultLanguage;
  }

  public init(): void {
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
      languageToggle.addEventListener('click', () => this.toggleLanguage());
      this.updateToggleButton();
    }
  }

  private toggleLanguage(): void {
    const newLanguage: Language = this.currentLanguage === 'en' ? 'pt-br' : 'en';
    localStorage.setItem(this.storageKey, newLanguage);
    
    // Navigate to the equivalent page in the other language
    const currentPath = window.location.pathname;
    let newPath: string;
    
    if (this.currentLanguage === 'en' && !currentPath.startsWith('/pt-br/')) {
      // Switching from English to Portuguese
      newPath = '/pt-br' + currentPath;
    } else if (this.currentLanguage === 'pt-br' && currentPath.startsWith('/pt-br/')) {
      // Switching from Portuguese to English
      newPath = currentPath.replace('/pt-br', '');
    } else {
      // Default case or if URL structure doesn't match expected pattern
      newPath = newLanguage === 'en' ? '/' : '/pt-br/';
    }
    
    window.location.href = newPath;
  }

  private updateToggleButton(): void {
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
      languageToggle.textContent = this.currentLanguage === 'en' 
        ? '🇧🇷 Português' 
        : '🇺🇸 English';
    }
  }
}