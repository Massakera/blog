interface AnimationOptions {
  selector: string;
  threshold?: number;
  rootMargin?: string;
  animationClass: string;
}

export class AnimationManager {
  private defaultOptions: AnimationOptions = {
    selector: '.animate-on-scroll',
    threshold: 0.1,
    rootMargin: '0px',
    animationClass: 'visible'
  };

  constructor() {}

  public init(): void {
    this.setupScrollAnimations(this.defaultOptions);
    this.animateHeaderText();
  }

  private setupScrollAnimations(options: AnimationOptions): void {
    const elements = document.querySelectorAll(options.selector);
    
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(options.animationClass);
        } else {
          // Optionally remove the class when out of view
          // entry.target.classList.remove(options.animationClass);
        }
      });
    }, {
      threshold: options.threshold,
      rootMargin: options.rootMargin
    });

    elements.forEach(el => observer.observe(el));
  }

  private animateHeaderText(): void {
    const siteTitle = document.querySelector('.site-name');
    if (!siteTitle) return;

    const text = siteTitle.textContent || '';
    siteTitle.textContent = '';

    let i = 0;
    const typeSpeed = 100; 

    const typeWriter = () => {
      if (i < text.length) {
        siteTitle.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, typeSpeed);
      }
    };

    setTimeout(typeWriter, 500);
  }
}