
import { ComplexNumber, Coords, Mandelbrot } from './index.d';



/**
 * @name draw_pixel - Draw a pixel on a canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Coords} coords - The coordinates of the pixel
 * @param {string} color - The color of the pixel
 * @param {number} size - The size of the pixel
 * @returns {void}
 */
export function draw_pixel(
    ctx: CanvasRenderingContext2D,
    coords: Coords,
    color: string = '#000',
    size: number = 1
): void {
    ctx.fillStyle = color;
    ctx.fillRect(coords.x, coords.y, size, size);
}




// -- Get the main mandelbrot container and add a canvas element
const mandelbrot_elm = document.querySelector('[mandelbrot="main"]'),
    mandelbrot = mandelbrot_elm.appendChild(document.createElement('canvas'));
console.log(mandelbrot_elm, mandelbrot);

async function calc_mandelbrot(
    c: ComplexNumber, 
    max_iter: number
): Promise<number> {
    let z_real = 0, z_imaginary = 0, n = 0;
  
    while (n < max_iter && Math.abs(z_real * z_real + z_imaginary * z_imaginary) < 4) {
        const z_real_temp = z_real * z_real - z_imaginary * z_imaginary + c.real;
        z_imaginary = 2 * z_real * z_imaginary + c.imaginary;
        z_real = z_real_temp;
        n++;
    }
  
    return n;
}


  
function get_color(
    value: number,
    max_iter: number
) {
    if (value === max_iter)
      return '#000000'; // -- Black color for points inside the Mandelbrot set

  
    const hue = (value / max_iter) * 360, // -- Map the value to a hue value between 0 and 360
        saturation = 1,                   // -- Set saturation to 1 for full saturation
        lightness = 0.5;                  // -- Set lightness to 0.5 for a balanced brightness
  

    // -- Convert HSL color values to RGB
    const hslToRgb = (h: number, s: number, l: number) => {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r: number, g: number, b: number;
        
        if (s === 0) r = g = b = l; 
        else {
            const hueToRgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
        
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                p = 2 * l - q;
        
            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);
        }
        
        return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    };
  
    return hslToRgb(hue, saturation * 100, lightness * 100);
}
  

// -- Calculate the mandelbrot
async function calculate_mandelbrot(
    pixel_scale: number = 1,
    max_iter: number = 80,
    mandelbrot_set: Mandelbrot = { min_r: -2, max_r: 1, min_i: -1, max_i: 1 }
) {
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
    for (let i = 0; i < adj_size.x; i++) {
        for (let j = 0; j < adj_size.y; j++) {
            // -- We need to adjust for the pixel scale
            //    so that it doesn't look small, aka if the pixel scale is 0.25
            //    then we need to multiply the pixel coordinate by 4.
            const 
                x = Math.ceil(i / pixel_scale),
                y = Math.ceil(j / pixel_scale);

            // -- Convert pixel coordinate to complex number
            const c: ComplexNumber = {
                real: mandelbrot_set.min_r + (x / rel_size.x) * (mandelbrot_set.max_r - mandelbrot_set.min_r),
                imaginary: mandelbrot_set.min_i + (y / rel_size.y) * (mandelbrot_set.max_i - mandelbrot_set.min_i)
            };

            // -- Compute the number of iterations
            calc_mandelbrot(c, max_iter).then(async(m) => draw_pixel(
                ctx, { x, y }, get_color(m, max_iter),
                Math.ceil(1 / pixel_scale)
            ));
        }
    }
}


/**
 * @name sleep
 * @description Sleep for a given amount of time
 * @param {number} ms The amount of time to sleep in milliseconds
 * @returns {Promise<void>}
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// -- Calculate the mandelbrot
(async () => {
    // await calculate_mandelbrot(0.25, 105);
    const iter_scales = [ 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5 ];
    const px_scale = 0.15;
    await calculate_mandelbrot(
        1,
        15,
        {
            min_r: -1.25,
            max_r: 1.25,
            min_i: -1.25,
            max_i: 1.25
        }
    );

    // // -- Calculate the mandelbrot
    // let i = 0;
    // while (true) {
    //     const set: Mandelbrot = {
    //         min_r: -1.25,
    //         max_r: 1.25,
    //         min_i: -1.25,
    //         max_i: 1.25
    //     };
        
    //     // -- Calculate the mandelbrot
    //     await calculate_mandelbrot(
    //         px_scale,
    //         i + 5,
    //         set
    //     );

    //     // -- Sleep for 1 second
    //     await sleep(10);
    //     i++;

    //     if (i >= 50) i = 0;
    // }

    // // for (let i = 0; i < max_iter.length; i++) {
    //     await calculate_mandelbrot(0.35, max_iter[i]);
    //     await sleep(1000);
    //     console.log('Done');
    // }
})();