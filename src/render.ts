/**
 * @module render
 * 
 * This module contains functions for asynchronusly drawing
 * to each of the canvases
 */

import { CanvasInstance, FrameCallback } from './index.d';

let _canvases: Array<CanvasInstance> = [];



/**
 * @name get_relative_pos
 * @description gets the relative position of the mouse in
 * a canvas instance.
 * @param {CanvasInstance} - The canvas 
 * @param {MouseEvent} 
 * @returns {[number, number]} - The Relative position on the canvas
 */
export const get_relative_pos = (
    canvas: CanvasInstance,
    e: MouseEvent,
): [number, number] => {
    // -- Get the canvas position
    const canvas_pos = canvas.canvas.getBoundingClientRect();

    // -- Return the relative position
    return [
        e.clientX - canvas_pos.x,
        e.clientY - canvas_pos.y
    ];
}



/**
 * @name add_canvas
 * @description adds a canvas to the list of canvases
 * @param {number} frame_rate the frame rate to draw at
 * @param {CanvasRenderingContext2D} ctx the canvas to add
 * @param {(ctx: CanvasRenderingContext2D) => void} draw_callback the callback to call when the canvas has been cleared
 * and is ready to be drawn to
 * @returns {CanvasInstance}
 */
export const add_canvas = (
    frame_rate: number,
    ctx: CanvasRenderingContext2D, 
    draw_callback: (ctx: CanvasRenderingContext2D) => void
): CanvasInstance => {
    let frame_callbacks = [];

    const canvas_obj: CanvasInstance = {
        canvas: ctx.canvas,
        ctx,
        draw_callback,
        last_frame_time: 0,
        frame_rate,
        real_frame_rate: 0,

        frame_callbacks,
        add_frame_callback: (cb) => {
            // -- Create the FrameCallback object
            const fc: FrameCallback = {
                func: cb,
                remove: () => {
                    const index = frame_callbacks.indexOf(fc);
                    if (index > -1) frame_callbacks.splice(index, 1);
                }
            }

            // -- Add the callback to the array
            frame_callbacks.push(fc);

            // -- Return the FrameCallback
            return fc;
        }
    };

    _canvases.push(canvas_obj);
    return canvas_obj;
}



/**
 * @name start_draw
 * @description draws to all of the canvases
 * @returns {void}
 */
export async function start_draw(): Promise<void> {
    // -- Loop through each of the canvases
    _canvases.forEach(canvas => {

        // -- Get the current time
        const current_time = performance.now();

        // -- Calculate the time elapsed since the last frame
        const elapsed_time = current_time - canvas.last_frame_time;

        // -- Calculate the real frame rate
        canvas.real_frame_rate = 1000 / elapsed_time;

        // -- Check if the frame rate has been reached
        if (elapsed_time < 1000 / canvas.frame_rate) return;

        // -- Clear the canvas
        canvas.ctx.save();
        canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
        canvas.ctx.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        canvas.ctx.restore();

        // -- Call the draw callback
        canvas.draw_callback(canvas.ctx);

        // -- Call the frame callbacks
        canvas.frame_callbacks.forEach((cb) => cb.func());

        // -- Update the last frame time
        canvas.last_frame_time = current_time;
    });

    // -- Call the draw function again
    requestAnimationFrame(start_draw);
}



/**
 * @name animate
 * @description This function enables smooth animation on a canvas by 
 * utilizing the `real_frame_rate` of the `CanvasInstance` object. It 
 * allows you to create custom animations that progress over time.
 * @param {Function} callback - A function that gets called at each animation step with the updated progress (ranging from 0.0 to 1.0).
 * @param {CanvasInstance} ci - The canvas on which the animation will take place.
 * @param {number} ms - The duration of the animation in milliseconds.
 */
export const animate = async (
    callback: (anim_time: number) => void,
    ci: CanvasInstance,
    ms: number
) => {
    const startTime = performance.now();
    let animTime = 0;

    return new Promise<void>((resolve) => {
        // -- Create the FrameCallback
        const fc = ci.add_frame_callback(() => frame());

        // -- Func to progress the animation
        const frame = () => {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;
            animTime = elapsedTime / ms;

            // -- Check if were done the animation
            if (elapsedTime >= ms) {
                callback(1.0);
                fc.remove()
                resolve();
            } 
            
            // -- Continue animating
            else callback(animTime);
        };

    });
};



/**
 * @name set_opacity
 * @description sets the opacity of a hex color
 * @param {string} hex the hex color to set the opacity of
 * @param {number} opacity the opacity to set
 * @returns {string} the new hex color
 */
export const set_opacity = (hex: string, opacity: number): string => {
    const parse_hex = (hex: string) => {
        // -- Remove the hash
        hex = hex.replace('#', '');

        // -- Get the r, g, b values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // -- Return the values
        return { r, g, b };
    }

    // -- Parse the hex color
    const { r, g, b } = parse_hex(hex);

    // -- Return the new hex color
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}${opacity}`;
}