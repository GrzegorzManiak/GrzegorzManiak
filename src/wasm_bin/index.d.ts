/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * src/wasm/calc_mandelbrot
 * @param c `src/classes/ComplexNumber`
 * @param max_iter `f64`
 * @returns `f64`
 */
export declare function calc_mandelbrot(c: __Internref4, max_iter: number): number;
/**
 * src/wasm/calc_complex
 * @param mandelbrot_set `src/classes/Mandelbrot`
 * @param x `f64`
 * @param y `f64`
 * @param size_x `f64`
 * @param size_y `f64`
 * @returns `src/classes/ComplexNumber`
 */
export declare function calc_complex(mandelbrot_set: __Internref5, x: number, y: number, size_x: number, size_y: number): __Internref4;
/**
 * src/wasm/get_color
 * @param value `f64`
 * @param max_iter `f64`
 * @returns `~lib/string/String`
 */
export declare function get_color(value: number, max_iter: number): string;
/**
 * src/wasm/calculate_mandelbrot
 * @param i `f64`
 * @param j `f64`
 * @param min_r `f64`
 * @param max_r `f64`
 * @param min_i `f64`
 * @param max_i `f64`
 * @param pixel_scale `f64`
 * @param max_iter `f64`
 * @param rel_size_x `f64`
 * @param rel_size_y `f64`
 * @returns `f64`
 */
export declare function calculate_mandelbrot(i: number, j: number, min_r?: number, max_r?: number, min_i?: number, max_i?: number, pixel_scale?: number, max_iter?: number, rel_size_x?: number, rel_size_y?: number): number;
/** src/classes/ComplexNumber */
declare class __Internref4 extends Number {
  private __nominal4: symbol;
  private __nominal0: symbol;
}
/** src/classes/Mandelbrot */
declare class __Internref5 extends Number {
  private __nominal5: symbol;
  private __nominal0: symbol;
}
