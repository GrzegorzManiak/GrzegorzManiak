export interface Coords {
    x: number;
    y: number;
}

// -- This defines the zoom level of the mandelbrot set
export interface Mandelbrot { 
    min_r: number;
    max_r: number;
    min_i: number;
    max_i: number;
}

export interface ComplexNumber { real: number; imaginary: number; }

