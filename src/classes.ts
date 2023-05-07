export interface Coords {
    x: number;
    y: number;
}

// -- This defines the zoom level of the mandelbrot set
export class Mandelbrot { 
    public min_r: number;
    public max_r: number;
    public min_i: number;
    public max_i: number;

    public constructor(
        min_r: number,
        max_r: number,
        min_i: number,
        max_i: number
    ) {
        this.min_r = min_r;
        this.max_r = max_r;
        this.min_i = min_i;
        this.max_i = max_i;
    }
}

export class ComplexNumber { 
    public real: number; 
    public imaginary: number; 

    public constructor(
        real: number,
        imaginary: number
    ) {
        this.real = real;
        this.imaginary = imaginary;
    }
}

export class Proccessable {
    public m: number;
    public color: string;
    public x: number;
    public y: number;

    public constructor(
        m: number,
        color: string,
        x: number,
        y: number
    ) {
        this.m = m;
        this.color = color;
        this.x = x;
        this.y = y;
    }
}