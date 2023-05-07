import { PhysicsObject, Vector2D } from '../index.d';

/**
 * @name calc_normal
 * @description Returns the normal vector of a physics object
 * @param {PhysicsObject} a
 * @param {PhysicsObject} b
 * @param {Vector2D} col The collision vector
 * @returns {Vector2D}
 */
export function calc_normal(
    a: PhysicsObject,
    b: PhysicsObject,
    col: Vector2D
): Vector2D {
    // -- Calculate the midpoint of the collision
    const midpoint = {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2
    };

    // -- Calculate the normal vector
    const normal = {
        x: midpoint.x - col.x,
        y: midpoint.y - col.y
    };

    // -- Normalize the normal vector
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
    return {
        x: normal.x / length,
        y: normal.y / length
    };
}


/**
 * @name invert_normal
 * @description Invert a normal vector
 * @param {Vector2D} normal
 * @returns {Vector2D}
 */
export function invert_normal(normal: Vector2D): Vector2D {
    return {
        x: -normal.x,
        y: -normal.y,
    };
}



/**
 * @name dot_product
 * @description Calculate the dot product of two vectors
 * @param {Vector2D} a
 * @param {Vector2D} b
 * @returns {number}
 */
export function dot_product(a: Vector2D, b: Vector2D): number {
    return a.x * b.x + a.y * b.y;
}



/**
 * @name sub_vector
 * @description Subtract two vectors
 * @param {Vector2D} a
 * @param {Vector2D} b
 * @returns {Vector2D}
 */
export function sub_vector(a: Vector2D, b: Vector2D): Vector2D {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
    };
}



/**
 * @name calc_velocity
 * @description Calculate the velocity of an object after a collision
 * new_velocity = velocity - 2 * dot_product(velocity, normal) * normal * coefficient_of_restitution
 * @param {PhysicsObject} obj
 * @param {Vector2D} normal
 * @param {number} coefficient_of_restitution
 * @returns {Vector2D}
 */
export function calc_velocity(
    obj: PhysicsObject,
    normal: Vector2D,
    coefficient_of_restitution: number
): Vector2D {
    // -- Calculate the dot product of the velocity and the normal
    const dot = dot_product(obj.velocity, normal);

    // -- Calculate the new velocity
    return sub_vector(
        obj.velocity,
        mul_vector(
            mul_vector(normal, dot),
            coefficient_of_restitution
        )
    );
}



/**
 * @name mul_vector
 * @description Multiply a vector by a scalar
 * @param {Vector2D} vec
 * @param {number} scalar
 * @returns {Vector2D}
 */
export function mul_vector(vec: Vector2D, scalar: number): Vector2D {
    return {
        x: vec.x * scalar,
        y: vec.y * scalar,
    };
}



/**
 * @name add_vector
 * @description Add two vectors
 * @param {Vector2D} a
 * @param {Vector2D} b
 * @returns {Vector2D}
 */
export function add_vector(a: Vector2D, b: Vector2D): Vector2D {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    };
}



/**
 * @name physics_update
 * @description Update the position and velocity of a physics object based on its acceleration
 * @param {PhysicsObject} obj
 * @param {number} delta_time The time elapsed since the last update, in seconds
 */
export function physics_update(obj: PhysicsObject, delta_time: number): void {
    // -- Skip fixed objects
    if (obj.fixed) return;

    // -- Apply acceleration to velocity
    obj.velocity.x += obj.acceleration.x * delta_time;
    obj.velocity.y += obj.acceleration.y * delta_time;

    // -- Apply friction to velocity
    const friction_force = {
        x: -obj.velocity.x * obj.friction,
        y: -obj.velocity.y * obj.friction,
    };
    obj.velocity.x += friction_force.x * delta_time;
    obj.velocity.y += friction_force.y * delta_time;

    // -- Calculate new position
    obj.x += obj.velocity.x * delta_time;
    obj.y += obj.velocity.y * delta_time;
}
