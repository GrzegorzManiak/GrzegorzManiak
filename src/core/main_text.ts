import { NAV_MAIN_TEXT_SELECTOR } from "..";
import { sleep } from "./common";
import scroll_handler from "./scroll_handler";

export default function () {
    // -- Get the main text element
    const main_text_elm = document.querySelector(NAV_MAIN_TEXT_SELECTOR) as HTMLSpanElement,
        nav_elm = document.querySelector('nav');

    if (
        !main_text_elm || 
        !nav_elm
    ) return;


    // -- Get the current scroll position
    const scroll = scroll_handler
        .getInstance();

    scroll.add_scroll_hook((pos) => {
        // -- Get the scroll position
        // and height of the main nav bar
        const [, y] = pos;

        // -- Get the height of the main nav bar
        const nav_height = nav_elm.getBoundingClientRect().height,
            scroll_percentage = y / nav_height;

        
            
    });
}


