import { log } from "../log";
import CanvasInstance from "./instance";



export default class CanvasManager {
    // -- Private array to store canvases
    private static _canvases: CanvasInstance[] = [];
    private static _started_draw_loop: boolean = false;
    private constructor() { }

    
    /**
     * @name canvases
     * Returns the list of canvases
     * 
     * @returns {CanvasInstance[]} - the list of canvases
     */
    public static get canvases(
    ): CanvasInstance[] {
        return this._canvases;
    }



    /**
     * @name _add_canvas
     * Adds a canvas to the list of canvases
     * 
     * @param {number} frame_rate - the frame rate to draw at
     * @param {CanvasRenderingContext2D} ctx - the canvas to add
     * @param {CanvasRenderingContext2D} draw_ctx - the canvas that will be drawn to by tools
     * and is ready to be drawn to
     * @param {(canvas: CanvasRenderingContext2D) => void} on_draw - the function to call when the canvas is drawn
     * 
     * @returns {CanvasInstance} - the canvas object
     */
    private static _add_canvas(
        frame_rate: number,
        ctx: CanvasRenderingContext2D,
        on_draw: (canvas: CanvasRenderingContext2D) => void
    ): CanvasInstance {
        // -- Create the offscreen canvas or a normal canvas if it is not supported
        const draw_offscreen = new OffscreenCanvas(1, 1);

        // -- Create the canvas object
        const canvas_obj = new CanvasInstance(
            ctx.canvas,
            ctx,
            draw_offscreen,
            draw_offscreen.getContext('2d', { 
                willReadFrequently: true
            }),
            on_draw
        );

        // -- Set the frame rate
        canvas_obj.frame_rate = frame_rate;

        // -- Push the canvas object to the list of canvases
        this._canvases.push(canvas_obj);
        return canvas_obj;
    }



    /**
     * @name _start_draw
     * Starts the draw loop, this is a function that once called
     * it cannot be stopped. It will loop through each of the canvases
     * and call the on_draw function.
     * 
     * @returns {void}
     */
    private static _start_draw(): void {

        // -- Loop through each of the canvases
        const draw = () => {
            this._canvases.forEach((canvas) => {
                // -- Get the current time
                const current_time = performance.now();

                // -- Calculate the time elapsed since the last frame
                const elapsed_time = current_time - canvas.last_frame_time;

                // -- Calculate the real frame rate
                canvas._int_real_frame_rate = 1000 / elapsed_time;

                // -- Check if the frame rate has been reached
                if (elapsed_time < 1000 / canvas.frame_rate) return;

                // -- Update the canvas scale
                canvas._int_scale = canvas.ctx.getTransform().a;

                // -- Clear the canvas
                canvas.ctx.save();
                canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
                canvas.ctx.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
                canvas.ctx.restore();

                canvas.draw_ctx.save();
                canvas.draw_ctx.setTransform(1, 0, 0, 1, 0, 0);
                canvas.draw_ctx.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
                canvas.draw_ctx.restore();


                // -- Call the draw callback
                canvas._main_callback(canvas.ctx);

                // -- Call the frame callbacks
                canvas._call_frame_callbacks();

                // -- Update the last frame time
                canvas._int_last_frame_time = current_time;
            });

            // -- Call the draw function again
            requestAnimationFrame(draw);
        };


        // -- Only start the loop once
        if (this._started_draw_loop) {
            log('ERROR', 'Cannot start more than one draw loop.');
            return;
        }

        // -- Start the loop
        log('INFO', 'Started Draw loop.');
        this._started_draw_loop = true;
        draw();
    }



    /**
     * @name manage_canvas
     * 
     * @param {number} frame_rate - the frame rate to draw at
     * @param {CanvasRenderingContext2D} ctx - the canvas to add
     * and is ready to be drawn to
     * @param {(ci: CanvasRenderingContext2D) => void} on_draw - the function to call when the canvas is drawn
     * 
     * @returns {CanvasInstance} - the new canvas instance
     */
    public static manage_canvas(
        frame_rate: number,
        ctx: CanvasRenderingContext2D,
        on_draw: (ci: CanvasRenderingContext2D) => void
    ): CanvasInstance {
        const canvas_obj = this._add_canvas(
            frame_rate, 
            ctx, 
            on_draw
        );

        if (!this._started_draw_loop)
            this._start_draw();
        return canvas_obj;
    }
}