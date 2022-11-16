export default class scroll_handler {
    // -- This is a singleton class
    private static instance: scroll_handler;
    private constructor() { 
        this.scroll_position = [0, 0];
        window.addEventListener('scroll', this.scroll_handler);
    }
    public static getInstance(): scroll_handler {
        if (!scroll_handler.instance) {
            scroll_handler.instance = new scroll_handler();
        }
        return scroll_handler.instance;
    }


    // -- Scroll position
    private scroll_position: [number, number] = [0, 0];
    public get_scroll_position(): [number, number] {
        return this.scroll_position;
    }


    // -- Scroll hooks
    private scroll_hooks: Array<(num: [number, number]) => void> = [];
    public add_scroll_hook(hook: (num: [number, number]) => void) {
        this.scroll_hooks.push(hook);
    }



    private scroll_handler = () => {
        this.scroll_position = [window.scrollX, window.scrollY];
        this.scroll_hooks.forEach(hook => hook(this.scroll_position));
    };
}