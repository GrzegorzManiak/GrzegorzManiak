
import { Coords, Mandelbrot } from './classes';
import { calculate_mandelbrot, get_color } from './wasm_bin';

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
const mandelbrot_elm = document.querySelector('[mandelbrot="main"]'),
    mandelbrot = mandelbrot_elm.appendChild(document.createElement('canvas'));
console.log(mandelbrot_elm, mandelbrot);



// -- Calculate the mandelbrot
function calc_mandelbrot(
    pixel_scale: number = 1,
    max_iter: number = 80,
    mandelbrot_set: Mandelbrot,
): void {
    // -- Get the canvas context
    const ctx = mandelbrot.getContext('2d');
    if (!ctx) return;

    // -- Set the canvas size
    mandelbrot.width = mandelbrot_elm.clientWidth;
    mandelbrot.height = mandelbrot_elm.clientHeight;

    // -- Get the size of the mandelbrot
    const adj_size = { 
        x: mandelbrot.width * pixel_scale,
        y: mandelbrot.height * pixel_scale
    }

    const rel_size = {
        x: mandelbrot.width,
        y: mandelbrot.height
    }

    // -- Calculate the mandelbrot
    const px_size = Math.ceil(1 / pixel_scale);
    const callback = (x: number, y: number, color: string): void => { 
        (async () => draw_pixel(ctx, { x, y }, color, px_size))();
    }   

    console.log('adj_size', adj_size);
    console.log('rel_size', rel_size);


    for (let x = 0; x < rel_size.x; x++) {
        for (let y = 0; y < rel_size.y; y++) {
            
            const data = calculate_mandelbrot(
                x, y,
                mandelbrot_set.min_r, mandelbrot_set.max_r,
                mandelbrot_set.min_i, mandelbrot_set.max_i,
                pixel_scale, max_iter,
                rel_size.x, rel_size.y
            );

            const color = get_color(data, max_iter);
            callback(x, y, color);
        }
    }
}



// -- Time
console.time('mandelbrot');
calc_mandelbrot(0.25, 50, { min_r: -2, max_r: 1, min_i: -1, max_i: 1 });
console.timeEnd('mandelbrot');

// /**
//  * @name sleep
//  * @description Sleep for a given amount of time
//  * @param {number} ms The amount of time to sleep in milliseconds
//  * @returns {Promise<void>}
//  */
// function sleep(ms: number): Promise<void> {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// // -- Calculate the mandelbrot
// (async () => {
//     // await calculate_mandelbrot(0.25, 105);
//     const iter_scales = [ 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5 ];
//     const px_scale = 0.15;
//    calculate_mandelbrot(
//         1,
//         15,
//         {
//             min_r: -1.25,
//             max_r: 1.25,
//             min_i: -1.25,
//             max_i: 1.25
//         }
//     );

//     // // -- Calculate the mandelbrot
//     // let i = 0;
//     // while (true) {
//     //     const set: Mandelbrot = {
//     //         min_r: -1.25,
//     //         max_r: 1.25,
//     //         min_i: -1.25,
//     //         max_i: 1.25
//     //     };
        
//     //     // -- Calculate the mandelbrot
//     //     await calculate_mandelbrot(
//     //         px_scale,
//     //         i + 5,
//     //         set
//     //     );

//     //     // -- Sleep for 1 second
//     //     await sleep(10);
//     //     i++;

//     //     if (i >= 50) i = 0;
//     // }

//     // // for (let i = 0; i < max_iter.length; i++) {
//     //     await calculate_mandelbrot(0.35, max_iter[i]);
//     //     await sleep(1000);
//     //     console.log('Done');
//     // }
// })();