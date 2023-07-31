export type FrameCallback = {
    func: () => void;
    remove: () => void;
}

export interface CanvasInstance {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    draw_callback: (ctx: CanvasRenderingContext2D) => void;
    last_frame_time: number;
    real_frame_rate: number;
    frame_rate: number;

    frame_callbacks: Array<FrameCallback>;
    add_frame_callback: (cb: () => void) => FrameCallback;
}

// -- X,Y Coordinates
export type Dot = [number, number];

export interface Dots {
    rows: number;
    cols: number;

    dot_size: number;
    dot_spacing: number;

    max_dist: number;
    force: number;
    force_size: number;

    color: string;
}

export interface DotsDetailed extends Dots {
    data: Array<Array<number>>;
}