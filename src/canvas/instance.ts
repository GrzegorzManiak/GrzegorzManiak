import { FrameCallback } from '../index.d';



export default class CanvasInstance {
    // -- Getter functions for internal data
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    readonly draw_canvas: OffscreenCanvas;
    readonly draw_ctx: OffscreenCanvasRenderingContext2D;
    readonly is_offscreen: boolean = false;

    private _draw_canvas_active: boolean;
    private _last_frame_time: number;
    private _real_frame_rate: number;
    private _frame_rate: number;
    private _scale: number;
    private _mouse_pos: { x: number; y: number; };
    private _frame_callbacks: Array<FrameCallback>;

    readonly _main_callback: (ctx: CanvasRenderingContext2D) => void


    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        draw_canvas: OffscreenCanvas,
        draw_ctx: OffscreenCanvasRenderingContext2D,
        callback: (ctx: CanvasRenderingContext2D) => void
    ) {
        // -- Read only properties
        this.canvas = canvas;
        this.ctx = ctx;
        this.draw_canvas = draw_canvas;
        this.draw_ctx = draw_ctx;
        this._main_callback = callback;
        

        // -- Private properties
        this._draw_canvas_active = true;
        this._last_frame_time = 0;
        this._real_frame_rate = 0;
        this._frame_rate = 0;
        this._scale = 1;
        this._mouse_pos = { x: 0, y: 0 };
        this._frame_callbacks = [];

        // -- Setup the canvas
        this._setup_canvas();

        // -- Check if the draw canvas is an offscreen canvas
        this.is_offscreen = this.draw_canvas instanceof OffscreenCanvas;
    }
  


    /**
     * @name _setup_canvas
     * Sets up the canvas for drawing / resizing etc.
     * 
     * @returns {void} - Nothing.
     */
    private _setup_canvas(
    ): void {
        // -- Add a resize event listener
        window.addEventListener('resize', () => {
            // -- Resize the canvas
            this.update_canvas_size();
            
            // -- Force a redraw
            this._last_frame_time = 0;
        });

        // -- Set the scale
        this._scale = 1;
        this.ctx.scale(this._scale, this._scale);
        this.draw_ctx.scale(this._scale, this._scale);
    }


    
    /**
     * @name add_frame_callback
     * Add a callback function to be called on each frame.
     * 
     * @param {(ctx: CanvasRenderingContext2D) => void} cb - The callback function. 
     * 
     * @returns {FrameCallback} - Fc Object that allows you to remove the callback.
     */
    public add_frame_callback(
        cb: () => void
    ): FrameCallback {
        // -- Create the FrameCallback object
        const fc: FrameCallback = {
            func: cb,
            remove: () => {
                const index = this._frame_callbacks.indexOf(fc);
                if (index > -1) this._frame_callbacks.splice(index, 1);
            },
        };

        // -- Add the callback to the array
        this._frame_callbacks.push(fc);
        return fc;
    };



    /**
     * @name update_canvas_size
     * Updates both canvases sizes
     * 
     * @returns {void} Nothing
     */
    public update_canvas_size(
    ): void {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.draw_canvas.width = this.canvas.offsetWidth;
        this.draw_canvas.height = this.canvas.offsetHeight;
    }



    /**
     * @name clear_draw_canvas
     * Clear the draw canvas.
     * 
     * @returns {void} - Nothing.
     */
    public clear_draw_canvas(
    ): void {
        this.draw_ctx.save();
        this.draw_ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.draw_ctx.clearRect(
            0, 0, 
            this.ctx.canvas.width, 
            this.ctx.canvas.height
        );
        this.draw_ctx.restore();
    };



    /**
     * @name clear_main_canvas
     * Clear the main canvas.
     * 
     * @returns {void} - Nothing.
     */
    public clear_main_canvas(
    ): void {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(
            0, 0, 
            this.ctx.canvas.width, 
            this.ctx.canvas.height
        );
        this.ctx.restore();
    };



    /**
     * @name store_draw_canvas
     * Store the draw canvas as an ImageData object.
     * 
     * @returns {ImageData} - The ImageData object.
     */
    public store_draw_canvas(
    ): ImageData {
        return this.draw_ctx.getImageData(
            0, 0, 
            this.ctx.canvas.width, 
            this.ctx.canvas.height
        );
    };



    /**
     * @name _call_frame_callbacks
     * Calls all the frame callbacks.
     * NOTE: This function is called by the main loop, and
     * probably should not be called by anything else.
     * 
     * @returns {void} - Nothing.
     */
    public _call_frame_callbacks(
    ): void {
        this._frame_callbacks.forEach((fc) => fc.func());
    };



    /**
     * @name animate
     * Animate a function over a given time, it will call the given
     * callback function on each frame returning the progress of the
     * animation from 0.0 to 1.0.
     * 
     * @param {(anim_time: number) => void} callback This function is called on each frame.
     * @param {number} ms The time in milliseconds to animate over.
     * 
     * @returns {Promise<void>} - A promise that resolves when the animation is complete.
     */
    public animate(
        callback: (anim_time: number) => void,
        ms: number
    ): Promise<void> {
        const startTime = performance.now();
        let animTime = 0;

        return new Promise<void>((resolve) => {
            // -- Create the FrameCallback
            const fc = this.add_frame_callback(() => frame());

            // -- Func to progress the animation
            const frame = () => {
                const currentTime = performance.now();
                const elapsedTime = currentTime - startTime;
                animTime = elapsedTime / ms;

                // -- Check if were done the animation
                if (elapsedTime >= ms) {
                    callback(1.0);
                    fc.remove();
                    resolve();
                }

                // -- Continue animating
                else callback(animTime);
            };
        });
    }



    // 
    // -- Getters and setters
    //

    /**
     * @name draw_canvas_active
     * Get or set the draw_canvas_active flag that determines
     * whether the draw canvas is active or not.
     *
     * @type {boolean}
     */
    public get draw_canvas_active(): boolean {
        return this._draw_canvas_active; }

    public set draw_canvas_active(value: boolean) {
        this._draw_canvas_active = value; }



    /**
     * @name last_frame_time
     * Get or set the last_frame_time property that stores 
     * the timestamp of the last frame.
     *
     * @type {number}
     */
    public get last_frame_time(): number {
        return this._last_frame_time; }

    public set _int_last_frame_time(value: number) {
        this._last_frame_time = value; }



    /**
     * @name real_frame_rate
     * Get the real_frame_rate property that holds 
     * the calculated real frame rate.
     *
     * @type {number}
     * @readonly
     */
    public get real_frame_rate(): number {
        return this._real_frame_rate; }

    public set _int_real_frame_rate(value: number) {
        this._real_frame_rate = value; }



    /**
     * @name frame_rate
     * Get or set the frame_rate property that determines 
     * the desired frame rate for drawing.
     *
     * @type {number}
     */
    public get frame_rate(): number {
        return this._frame_rate; }

    public set frame_rate(value: number) {
        this._frame_rate = value; }



    /**
     * @name scale
     * Get or set the scale property that represents the 
     * current canvas scale.
     *
     * @type {number}
     */
    public get scale(): number {
        return this._scale; }

    public set _int_scale(value: number) {
        this._scale = value; }



    /**
     * @name mouse_pos
     * Get or set the mouse_pos property that holds the
     * current mouse position.
     *
     * @type {{x: number, y: number}}
     */
    public get mouse_pos(): { x: number; y: number } {
        return this._mouse_pos; }

    public set _int_mouse_pos(value: { x: number; y: number }) {
        this._mouse_pos = value; }
}