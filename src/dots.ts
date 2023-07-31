import { CanvasInstance, Dots, Dot } from './index.d';
import { get_relative_pos } from './render';



/**
 * @name render_dots
 * @description renders the dots to the canvas
 * @param {CanvasInstance} ci the canvas instance to render to
 * @param {Dots} dots the dots to render
 * @param {MouseEvent} e the mouse event to use for the mouse position
 * @param {number} [x_o=0] the x coordinate to start rendering at
 * @param {number} [y_o=0] the y coordinate to start rendering at
 */
export const render_dots = (
    ci: CanvasInstance, 
    dots: Dots,
    e: MouseEvent = null,
    x_o: number = 0,
    y_o: number = 0
): void => {

    // -- Get the mouse position
    let mouse_pos: [number, number] = [-5000, -5000];
    if (e !== null) mouse_pos = get_relative_pos(ci, e);

    ci.ctx.beginPath();
    ci.ctx.arc(mouse_pos[0], mouse_pos[1], 10, 0, 2 * Math.PI);
    ci.ctx.fill();

    // -- Loop through each row
    for (let row = 0; row < dots.rows; row++) {

        // -- Loop through each column
        for (let col = 0; col < dots.cols; col++) {

            // -- Calculate the x and y coordinates
            let x = (col * dots.dot_size) + (col * dots.dot_spacing) + x_o,
                y = (row * dots.dot_size) + (row * dots.dot_spacing) + y_o;

            // -- Calculate the distance
            const dist = get_dist_from_mouse(mouse_pos, x, y);
            let size = dots.dot_size;

            // -- Push the dot away from the mouse
            if (dist < dots.force_size)
                [x, y] = push_dot(mouse_pos, x, y, dist, dots.force_size, dots.force);

            // -- Check if the distance is greater than the max distance
            if (dist < dots.max_dist) {
                // -- Calculate the size of the dot
                const capped_dist = Math.min(dist, dots.max_dist),
                    norm_dist = (capped_dist / dots.max_dist) - 1;

                // -- Calc the size, if 100, then 1, if 0, then 2
                size = dots.dot_size + (norm_dist * dots.dot_size);
            }
            

            // -- Draw the dot
            ci.ctx.fillStyle = dots.color;
            
            // -- Circle
            ci.ctx.beginPath();
            ci.ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
            ci.ctx.fill();
        }
    }
};




/**
 * @name get_dist_from_mouse
 * @description gets the distance from the mouse to a dot
 * @param {[number, number]} mouse_pos the mouse position
 * @param {number} x the x coordinate of the dot
 * @param {number} y the y coordinate of the dot
 * @returns {number} the distance from the mouse to the dot
 */
export const get_dist_from_mouse = (
    mouse_pos: [number, number],
    x: number,
    y: number,
): number => {

    // -- Calculate the distance
    const dist = Math.sqrt(
        Math.pow(mouse_pos[0] - x, 2) + 
        Math.pow(mouse_pos[1] - y, 2)
    );

    // -- Return the distance
    return dist;
}



/**
 * @name push_dot
 * @description pushes a dot away from the mouse, sortof like
 * a circular repulsion
 * @param {[number, number]} mouse_pos the mouse position
 * @param {number} x the x coordinate of the dot
 * @param {number} y the y coordinate of the dot
 * @param {number} dist the distance from the mouse to the dot
 * @param {number} max_dist the maximum distance to push the dot away (if the distance is greater than this, then the dot will not be pushed)
 * @param {number} [force=1] the force to push the dot away with
 * @returns {[number, number]} the new x and y coordinates of the dot
 */
export const push_dot = (
    mouse_pos: [number, number],
    x: number,
    y: number,
    dist: number,
    max_dist: number = 100,
    force: number = 1
): [number, number] => {

    // -- If the distance is greater than the max distance, then return the original coordinates
    if (dist > max_dist) return [x, y];

    // -- Calculate the angle
    const angle = Math.atan2(mouse_pos[1] - y, mouse_pos[0] - x);

    // -- How much force to apply (the closer the mouse is, the more force to apply)
    force = force * (1 - (dist / max_dist));

    // -- Calculate the new x and y coordinates
    const new_x = x - (Math.cos(angle) * force),
        new_y = y - (Math.sin(angle) * force);

    // -- Return the new coordinates
    return [new_x, new_y];
}