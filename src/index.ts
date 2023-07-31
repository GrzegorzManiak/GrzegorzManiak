import { render_dots } from './dots';
import { Dots, DotsDetailed } from './index.d';
import { add_canvas, animate, start_draw } from './render';
import { generate_text_points } from './text';
import GUI from 'lil-gui'; 

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
    dot_spacing: 5,

    force: 50,
    force_size: 150,

    max_dist: 75,
    color: '#fff'
}


// -- Variables
let dots_detailed: number[][] | null = null,
    name_width: number = 0, name_height: number = 0,
    text = 'GRZEGORZ',
    frame_rate = 60,
    auto_scale = true,
    font_size = 15,
    scale = 1;

// -- Add the control panel
const gui = new GUI({
    title: 'Dots',
    width: 300,
});

const ctrl = {
    'Frame Rate': frame_rate,
    'Auto Scale': auto_scale,
    'Font Size': font_size,
    'Dot Size': dots.dot_size,
    'Dot Spacing': dots.dot_spacing,
    'Force': dots.force,
    'Force Size': dots.force_size,
    'Max Distance': dots.max_dist,
    'Color': dots.color
};

// -- Add the text input
gui.add(ctrl, 'Frame Rate', 1, 500).onChange((v) => frame_rate = v);
gui.add(ctrl, 'Auto Scale').onChange((v) => auto_scale = v);
gui.add(ctrl, 'Font Size', 1, 100).onChange((v) => { font_size = v; dots_detailed = null; });
gui.add(ctrl, 'Dot Size', 1, 100).onChange((v) => dots.dot_size = v);
gui.add(ctrl, 'Dot Spacing', 1, 100).onChange((v) => dots.dot_spacing = v);
gui.add(ctrl, 'Force', 1, 500).onChange((v) => dots.force = v);
gui.add(ctrl, 'Force Size', 1, 500).onChange((v) => dots.force_size = v);
gui.add(ctrl, 'Max Distance', 1, 100).onChange((v) => dots.max_dist = v);
gui.add(ctrl, 'Color').onChange((v) => dots.color = v);
gui.add({ 'Text': text }, 'Text').onChange((v) => { text = v; dots_detailed = null; });
gui.close();


document.addEventListener('DOMContentLoaded', () => {
    // -- We need to wait for the dom to load before we can do anything
    //    with styles as it could be that the styles are not loaded yet
    console.log('DOM Loaded');
    update_canvas_size();

    // -- Add the mouse events
    let mouse_event: MouseEvent = null;
    document.addEventListener('mousemove', (e) => mouse_event = e);

    // -- Add the canvases to the draw loop
    const mc = add_canvas(frame_rate, main_context, (ctx) => {
        if (text.length === 0) return;
        
        // -- Check if the name has been generated
        if (!dots_detailed) {
            const name = generate_text_points(text, font_size, mc);
            dots_detailed = name;
        }

        // -- Calculate the x and y coordinates
        name_width = dots_detailed[0].length * dots.dot_size + (dots_detailed[0].length * dots.dot_spacing),
        name_height = dots_detailed.length * dots.dot_size + (dots_detailed.length * dots.dot_spacing);

        // -- Center the text
        const x = (ctx.canvas.width / 2) - (name_width / 2),
            y = (ctx.canvas.height / 2) - (name_height / 2);

        // -- Render the dots
        render_dots(mc, {
            ...dots,
            data: dots_detailed,
        }, mouse_event, 
            x, 
            y
        );
    });


    const adjust_scale = () => {

        // -- Calc the % of the width that the text takes up
        const text_width = dots_detailed[0].length * dots.dot_size + (dots_detailed[0].length * dots.dot_spacing),
            percent = (text_width / mc.canvas.width) * 100;

        // -- We want the text to take up 80% of the width
        const max_percent = 80;

        // -- Calc the new scale
        const new_scale = (max_percent / percent) * 100;
        scale = new_scale / 100;

        // -- Set the scale
        // mc.ctx.scale(scale, scale);

        // // -- Translate the canvas to the center
        // mc.ctx.translate(
        //     (mc.canvas.width / 2) - (name_width / 2),
        //     (mc.canvas.height / 2) - (name_height / 2)
        // );
    };


    // -- On resize update the canvas size
    window.addEventListener('resize', () => {
        update_canvas_size();
        mc.last_frame_time = 0; // -- Keeps it from jittering

        // -- Calculate a new font size
        if (!auto_scale) return;
        adjust_scale();
    });


    // -- Start the animation loop
    start_draw();
    adjust_scale();
});