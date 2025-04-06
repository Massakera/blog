export class SmoothScroll {
  private duration = 500; // ms

  public init(): void {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = (anchor as HTMLAnchorElement).getAttribute('href') || '';
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          this.scrollTo(targetElement as HTMLElement);
        }
      });
    });
  }

  private scrollTo(element: HTMLElement): void {
    const startPosition = window.scrollY;
    const targetPosition = element.getBoundingClientRect().top + window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      
      const timeElapsed = currentTime - startTime;
      const scrollProgress = Math.min(timeElapsed / this.duration, 1);
      const ease = this.easeInOutCubic(scrollProgress);
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (timeElapsed < this.duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}