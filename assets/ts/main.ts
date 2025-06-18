import { ThemeManager } from './theme';
import { SmoothScroll } from './smooth-scroll';
import { AnimationManager } from './animation';
import { KeyboardNavigation } from './keyboard-nav';

// Initialize theme manager (dark/light mode)
const themeManager = new ThemeManager();
themeManager.init();

// Initialize smooth scrolling
const smoothScroll = new SmoothScroll();
smoothScroll.init();

// Initialize animation manager (for aesthetic transitions)
const animationManager = new AnimationManager();
animationManager.init();

// Initialize Vim-like keyboard navigation
const keyboardNav = new KeyboardNavigation();
keyboardNav.init();