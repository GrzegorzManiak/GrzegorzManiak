
import { Coords } from './classes';
import init, { Complex, Mandelbrot, calc_mandelbrot } from './wasm/dom';
init().then(() => main());

/**
 * @name draw_pixel - Draw a pixel on a canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Coords} coords - The coordinates of the pixel
 * @param {string} color - The color of the pixel
 * @param {number} size - The size of the pixel
 * @returns {void}
 */
async function draw_pixel(
    ctx: CanvasRenderingContext2D,
    coords: Coords,
    color: string = '#000',
    size: number = 1
): Promise<void> {
    ctx.fillStyle = color;
    ctx.fillRect(coords.x, coords.y, size, size);
}




// -- Get the main mandelbrot container and add a canvas element
const mandelbrot_parent_elm = document.querySelector('[mandelbrot="main"]'),
    mandelbrot_elm = mandelbrot_parent_elm.appendChild(document.createElement('canvas'));


function main() {
    // -- Time the execution
    const start = performance.now();

    const mandelbrot = new Mandelbrot(
        new Complex(-2, 1),
        new Complex(1, -1)
    );
    
    calc_mandelbrot(
        mandelbrot, 
        mandelbrot_elm, 
        50, 1
    );

    const end = performance.now();
    console.log(`Execution time: ${end - start}ms`);
}