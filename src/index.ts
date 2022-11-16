import main_text from './core/main_text';
import scroll_handler from './core/scroll_handler';

export const NAV_MAIN_TEXT_SELECTOR = '#nav-main-text';

// -- Main entry point
scroll_handler.getInstance();
main_text();