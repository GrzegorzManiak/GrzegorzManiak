import { render_dots } from './dots';
import { Dots } from './index.d';
import { add_canvas, start_draw } from './render';

// -- Attempt to get the canvas elements
const main_canvas = document.getElementById('main-canvas') as HTMLCanvasElement;

// -- Check if the canvas elements exist
if (!main_canvas) 
    throw new Error('One ore more Canvas elements were not found');

// -- Get the canvas contexts
const main_context = main_canvas.getContext('2d');

// -- Set the canvas contexts to be the same size as the canvas
export const update_canvas_size = (): void => {
    main_context.canvas.width = main_canvas.offsetWidth;
    main_context.canvas.height = main_canvas.offsetHeight;
    main_context.scale(1, 1);
};


// -- DEV
const dots: Dots = {
    rows: 10,
    cols: 50,

    dot_size: 5,
    dot_spacing: 15,

    force: 25,
    force_size: 100,

    max_dist: 50,
    color: '#fff'
}


document.addEventListener('DOMContentLoaded', () => {
    // -- We need to wait for the dom to load before we can do anything
    //    with styles as it could be that the styles are not loaded yet
    console.log('DOM Loaded');
    update_canvas_size();

    let mouse_event: MouseEvent = null;
    document.addEventListener('mousemove', (e) => mouse_event = e);


    // -- Add the canvases to the draw loop
    const mc = add_canvas(120, main_context, (ctx) => {

        // -- Get the width and height of the dots grid
        const width = dots.cols * dots.dot_size + (dots.cols * dots.dot_spacing),
            height = dots.rows * dots.dot_size + (dots.rows * dots.dot_spacing);

        // -- Calculate the x and y coordinates
        const x = (ctx.canvas.width / 2) - (width / 2),
            y = (ctx.canvas.height / 2) - (height / 2);

        render_dots(mc, dots, mouse_event, x, y);
    });

    // -- Start the animation loop
    start_draw();
});