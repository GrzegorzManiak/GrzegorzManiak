export default class scroll_handler {
    private static instance;
    private constructor();
    static getInstance(): scroll_handler;
    private scroll_position;
    get_scroll_position(): [number, number];
    private scroll_hooks;
    add_scroll_hook(hook: (num: [number, number]) => void): void;
    private scroll_handler;
}
//# sourceMappingURL=scroll_handler.d.ts.map