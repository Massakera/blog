type Theme = 'light' | 'dark';

export class ThemeManager {
  private storageKey = 'blog-theme-preference';
  private defaultTheme: Theme = 'dark';
  private currentTheme: Theme;

  constructor() {
    const savedTheme = localStorage.getItem(this.storageKey) as Theme;
    this.currentTheme = savedTheme || this.defaultTheme;
  }

  public init(): void {
    this.applyTheme(this.currentTheme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    this.updateToggleButton();
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    localStorage.setItem(this.storageKey, theme);
  }

  private toggleTheme(): void {
    const newTheme: Theme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.updateToggleButton();
  }

  private updateToggleButton(): void {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.textContent = this.currentTheme === 'dark' 
        ? '☀️ Light Mode' 
        : '🌙 Dark Mode';
    }
  }
}