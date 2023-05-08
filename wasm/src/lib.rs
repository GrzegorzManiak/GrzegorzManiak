
use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

// -- Called by our JS entry point to run the example
#[wasm_bindgen(start)]
fn run() -> Result<(), JsValue> {
    // -- Use `web_sys`'s global `window` function to get a handle on the global
    // window object.
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");
    let body = document.body().expect("document should have a body");

    // -- Log that we loaded
    log("Loaded in from Rust!");

    Ok(())
}



#[wasm_bindgen]
pub fn calc_mandelbrot(
    mandelbrot: &Mandelbrot,
    canvas: &web_sys::HtmlCanvasElement,
    max_iter: u32,
    pixel_scale: f64,
) -> Result<(), JsValue>  {

    // -- Get the canvas context
    let context = canvas
        .get_context("2d")?
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()?;

    // -- Get the canvas size
    let canvas_width = canvas.client_width() as f64;
    let canvas_height = canvas.client_height() as f64;

    let abs_size = Vec2d::new(canvas_width * pixel_scale, canvas_height * pixel_scale);
    let px_size = (1.0 / pixel_scale).ceil() as f64;

    // -- Set the canvas size to rel_size
    canvas.set_width(abs_size.x as u32);
    canvas.set_height(abs_size.y as u32);


    // -- Iterate over the pixels
    for x in 0..abs_size.x.ceil() as u32 {
        for y in 0..abs_size.y.ceil() as u32 {
            
            // -- Calculate the complex number
            let pos = Vec2d::new(x as f64, y as f64);
            let complex = Complex::calc_complex(mandelbrot, &pos, &abs_size);

            // -- Calculate the mandelbrot value
            let mandelbrot_value = Mandelbrot::calc_mandelbrot(&complex, max_iter);

            // -- Calculate the color
            let color = get_color(mandelbrot_value, max_iter);
            draw_pixel(&context, &pos, &Vec2d::new(px_size, px_size), color)
        }
    }
    

    Ok(())
}


pub fn draw_pixel(
    ctx: &CanvasRenderingContext2d,
    pos: &Vec2d,
    size: &Vec2d,
    color: String,
) {
    ctx.set_fill_style(&JsValue::from_str(&color.to_string()));
    ctx.fill_rect(pos.x, pos.y, size.x, size.y);
}


#[wasm_bindgen]
pub struct Mandelbrot {
    pub min: Complex,
    pub max: Complex,
}

#[wasm_bindgen]
impl Mandelbrot {
    #[wasm_bindgen(constructor)]
    pub fn new(min: Complex, max: Complex) -> Mandelbrot {
        Mandelbrot { min, max }
    }

    #[wasm_bindgen]
    pub fn calc_mandelbrot(
        complex: &Complex,
        max_iter: u32,
    ) -> u32 {
        let mut z_real = 0.0;
        let mut z_imaginary = 0.0;
        let mut n = 0.0;
    
        let mut z_real_squared = 0.0;
        let mut z_imaginary_squared = 0.0;

        while n < max_iter as f64 && (z_real_squared + z_imaginary_squared) < 4.0 {
            z_imaginary = 2.0 * z_real * z_imaginary + complex.i;
            z_real = z_real_squared - z_imaginary_squared + complex.r;
        
            z_real_squared = z_real * z_real;
            z_imaginary_squared = z_imaginary * z_imaginary;
        
            n += 1.0;
        }

        n as u32
    }
}



#[wasm_bindgen]
pub struct Vec2d {
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
impl Vec2d {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64) -> Vec2d {
        Vec2d { x, y }
    }
}



#[wasm_bindgen]
#[derive(Copy)]
pub struct Complex {
    pub r: f64,
    pub i: f64,
}

#[wasm_bindgen]
impl Complex {
    #[wasm_bindgen(constructor)]
    pub fn new(r: f64, i: f64) -> Complex {
        Complex { r, i }
    }

    #[wasm_bindgen]
    pub fn calc_complex(
        mandelbrot: &Mandelbrot,
        pos: &Vec2d,
        size: &Vec2d,
    ) -> Self {
        let real = mandelbrot.min.r + (pos.x / size.x) * (mandelbrot.max.r - mandelbrot.min.r);
        let imaginary = mandelbrot.min.i + (pos.y / size.y) * (mandelbrot.max.i - mandelbrot.min.i);
        Self::new(real, imaginary)
    }
}

impl Clone for Complex {
    fn clone(&self) -> Self {
        Self::new(self.r, self.i)
    }
}


pub fn hue_to_rgb(
    p: f64,
    q: f64,
    mut t: f64,
) -> f64 {
    if t < 0.0 { t += 1.0; }
    if t > 1.0 { t -= 1.0; }
    if t < 1.0 / 6.0 { return p + (q - p) * 6.0 * t; }
    if t < 1.0 / 2.0 { return q; }
    if t < 2.0 / 3.0 { return p + (q - p) * (2.0 / 3.0 - t) * 6.0; }
    return p;
}

pub fn hsl_to_rgb(
    mut h: f64,
    mut s: f64,
    mut l: f64,
) -> (f64, f64, f64) {

    h /= 360.0;
    s /= 100.0;
    l /= 100.0;

    let mut r = 0.0;
    let mut g = 0.0;
    let mut b = 0.0;

    if s == 0.0 {
        r = l;
        g = l;
        b = l;
    } else {
        let q = if l < 0.5 { l * (1.0 + s) } else { l + s - l * s };
        let p = 2.0 * l - q;

        r = hue_to_rgb(p, q, h + 1.0 / 3.0);
        g = hue_to_rgb(p, q, h);
        b = hue_to_rgb(p, q, h - 1.0 / 3.0);
    }

    (r, g, b)
}

pub fn get_color(
    m: u32,
    max_iter: u32,
) -> String {
    let (r, g, b) = hsl_to_rgb(m as f64 / max_iter as f64 * 360.0, 100.0, 50.0);
    format!("rgb({}, {}, {})", r * 255.0, g * 255.0, b * 255.0)
}