// // a is 5 here
// function x($t){ return 5 * $t * cos($t); }
// function y($t){ return 5 * $t * sin($t); }

// for ($t = 0; $t < 50; $t += 0.01) {
//     $xyPoint = array(x($t), y($t));
//     // draw it
// }

import { Coords } from './index.d';

function spiral(
    size: Coords,
    center: Coords,
    delta: number,
    angle: number,
    old_point: Coords
): Coords {
    const x = old_point.x + delta * Math.cos(angle);
    const y = old_point.y + delta * Math.sin(angle);
    return { x, y };
}