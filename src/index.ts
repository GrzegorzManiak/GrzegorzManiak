import main_text from './core/main_text';
import scroll_handler from './core/scroll_handler';
import Physics from './physics/engine';
import build_stage from './physics/stage';

export const NAV_MAIN_TEXT_SELECTOR = '#nav-main-text';

// -- Main entry point
scroll_handler.getInstance();
main_text();

// -- Physics
const env = build_stage(),
    engine = new Physics(env);

engine.debug(true);
engine.start();