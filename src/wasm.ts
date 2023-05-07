import { ComplexNumber, Mandelbrot, Proccessable } from './classes';

export function calc_mandelbrot(c: ComplexNumber, max_iter: number): number {
    let z_real = 0.0, z_imaginary = 0.0, n = 0.0;
    let z_real_squared = 0.0, z_imaginary_squared = 0.0;
  
    while (n < max_iter && (z_real_squared + z_imaginary_squared) < 4) {
        z_imaginary = 2 * z_real * z_imaginary + c.imaginary;
        z_real = z_real_squared - z_imaginary_squared + c.real;
    
        z_real_squared = z_real * z_real;
        z_imaginary_squared = z_imaginary * z_imaginary;
    
        n++;
    }
  
    return n;
}


export function calc_complex(
    mandelbrot_set: Mandelbrot,
    x: number, y: number,
    size_x: number, size_y: number
): ComplexNumber {
    const real = mandelbrot_set.min_r + (x / size_x) * (mandelbrot_set.max_r - mandelbrot_set.min_r);
    const imaginary = mandelbrot_set.min_i + (y / size_y) * (mandelbrot_set.max_i - mandelbrot_set.min_i);
    return new ComplexNumber(real, imaginary);
}


export function get_color(
    value: number,
    max_iter: number
): string {
    if (value === max_iter)
      return '#000000'; // -- Black color for points inside the Mandelbrot set

  
    const hue = (value / max_iter) * 360, // -- Map the value to a hue value between 0 and 360
        saturation = 1,                   // -- Set saturation to 1 for full saturation
        lightness = 0.5;                  // -- Set lightness to 0.5 for a balanced brightness
  

    // -- Convert HSL color values to RGB
    const hslToRgb = (
        h: number, 
        s: number, 
        l: number
    ): string => {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r: number, g: number, b: number;
        
        if (s === 0) r = g = b = l; 
        else {
            const hueToRgb = (p: number, q: number, t: number): number => {
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
  
    return hslToRgb(
        hue, 
        saturation * 100, 
        lightness * 100
    );
}


export function calculate_mandelbrot(
    i: number, j: number,

    min_r: number = -2,
    max_r: number = 1,

    min_i: number = -1,
    max_i: number = 1,

    pixel_scale: number = 1,
    max_iter: number = 80,

    rel_size_x: number = 0,
    rel_size_y: number = 0,

): number {
    // -- Construct the mandelbrot set
    // This is due to some weird ass WASM
    // bindings
    const mandelbrot_set = new Mandelbrot(min_r, max_r, min_i, max_i);

    // -- We need to adjust for the pixel scale
    //    so that it doesn't look small, aka if the pixel scale is 0.25
    //    then we need to multiply the pixel coordinate by 4.
    const x = Math.ceil(i / pixel_scale), y = Math.ceil(j / pixel_scale);

    // -- Convert pixel coordinate to complex number
    //    and calc the madelbrot
    return calc_mandelbrot(calc_complex(
        mandelbrot_set, x, y, rel_size_x, rel_size_y), max_iter)
}

