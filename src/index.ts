
import init, { Complex, Mandelbrot, calc_mandelbrot } from './wasm/dom';
init().then(() => main());


// -- Get the main mandelbrot container and add a canvas element
const mandelbrot_parent_elm = document.querySelector('[mandelbrot="main"]'),
    mandelbrot_elm = mandelbrot_parent_elm.appendChild(document.createElement('canvas'));
const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    const mandelbrot = new Mandelbrot(
        new Complex(-2, 1),
        new Complex(1, -1)
    );
    
    // calc_mandelbrot(
    //     mandelbrot, 
    //     mandelbrot_elm, 
    //     6.5, 0.25
    // );

    
    const start = 2.5;
    const end = 60.0;
    const step = 0.15;

    for (let i = start; i < end; i += step) {
        console.log("i: ", i, " of ", end, " step: ", step);
        calc_mandelbrot(
            mandelbrot, 
            mandelbrot_elm, 
            i, 0.25
        );
        console.log("done");
        await sleep(2.5);
    }
}