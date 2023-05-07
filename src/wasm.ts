import { ComplexNumber } from './index.d';

export function calc_mandelbrot(
    c: ComplexNumber, 
    max_iter: number
): number {
    let z_real = 0.0, z_imaginary = 0.0, n = 0.0;
  
    while (n < max_iter && Math.abs(z_real * z_real + z_imaginary * z_imaginary) < 4) {
        const z_real_temp = z_real * z_real - z_imaginary * z_imaginary + c.real;
        z_imaginary = 2 * z_real * z_imaginary + c.imaginary;
        z_real = z_real_temp;
        n++;
    }
  
    return n;
}

