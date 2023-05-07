import Konva from 'konva';
import { PhysicsEnvironment, PhysicsObject, Vector2D } from '../index.d';
import { mul_vector, calc_normal, invert_normal, calc_velocity, add_vector, physics_update } from './calc';

export default class Physics {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private objects: Array<PhysicsObject>;

    private animation: Konva.Animation;
    private running = false;
    private show_debug = false;

    private last_frame = 0;


    // -- Main entry point
    constructor(private env: PhysicsEnvironment) {
        // -- Attach the main loop to the animation frame
        this.animation = new Konva.Animation(this.loop.bind(this), this.layer);
        this.animation.start();

        // -- Assign the environment
        this.stage = env.stage;
        this.layer = env.layer;
        this.objects = env.objects;

        // -- Log 
        console.log('Physics engine initialized');
    }

    // -- Main loop
    private async loop() {
        this.debug_loop();
        const delta_time = this.delta_time();

        // -- Loop through all the objects
        this.objects.forEach((obj) => {
            const col_neighbors = this.neighbors(obj);
            col_neighbors.forEach((neighbor) => {
                // -- Check for collisions
                const point = this.colliding(obj, neighbor);

                if (!point) return;
                const normal = calc_normal(obj, neighbor, point);

                // -- Show the Normal vector of the collision
                if (this.debug) this.debug_line(
                    normal, 
                    mul_vector(normal, 5),
                    'black',
                );
                    
                // -- Calculate the new velocity for both objects
                // v1f = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
                // obj.velocity = calc_velocity(obj, normal, this.env.coefficient_of_restitution);
                // neighbor.velocity = calc_velocity(neighbor, invert_normal(normal), this.env.coefficient_of_restitution);
                // obj.acceleration = normal;
                neighbor.acceleration = invert_normal(normal);
            });
        });

        // -- Update the position of all the objects
        this.objects.forEach((obj) => {
            physics_update(obj, delta_time);
            
            // -- Update the shape
            obj.shape.x(obj.x);
            obj.shape.y(obj.y);
            obj.shape.fire('phy_update');
        });


        // -- Update the time of the last frame
        this.last_frame = Date.now();
    }


    // -- Public methods
    public start = () => this.running = true;
    public stop = () => this.running = false;

    public debug = (value: boolean) => this.show_debug = value;


    // -- Private methods
    private debug_loop() {
        if (!this.show_debug) return;

        // -- Draw the outline of the objects
        this.objects.forEach((obj) => {
            const { x, y, shape } = obj;
            const { width, height } = shape.getClientRect();

            const outline = new Konva.Rect({
                x: x,
                y: y,
                width: width * 2,
                height: height * 2,
                stroke: 'red',
                strokeWidth: 1,
            });

            this.layer.add(outline);

            // -- Remove the outline
            setTimeout(() => outline.destroy(), 100);
        });
    }

    

    /**
     * @name neighbors
     * @description Find the neighbors of a given object
     * eg any object that is within a certain radius of the given object
     * this gives us a list of objects that we need to check for collisions
     * @param {PhysicsObject} obj
     * @param {number} radius Default is 100
     * @returns {Array<PhysicsObject>}
     */
    private neighbors(
        obj: PhysicsObject,
        radius: number = 15
    ): Array<PhysicsObject> {
        // -- This will work by checking the distance between the center of the
        //    object, it takes in account the size of the object as well

        // -- Get the center of the object (Without the radius)
        const obj_center = {
            x: obj.x + obj.shape.getClientRect().width / 2,
            y: obj.y + obj.shape.getClientRect().height / 2,
        };

        // -- Calculate the smallest size of circle to contain the object
        const obj_radius = Math.sqrt(
            Math.pow(obj.shape.getClientRect().width / 2, 2) +
            Math.pow(obj.shape.getClientRect().height / 2, 2)
        );

        // -- Expand the radius to include the given radius
        radius += obj_radius;


        // -- Render the new grown outline of the object
        //    if debug is enabled
        if (this.show_debug) {
            const outline = new Konva.Circle({
                x: obj_center.x,
                y: obj_center.y,
                radius: radius,
                stroke: 'blue',
                strokeWidth: 1,
            });

            this.layer.add(outline);

            // -- Remove the outline after 1 second
            setTimeout(() => outline.destroy(), 5);
        }


        // -- Return all the objects that are within the radius
        return this.objects.filter((other) => {
            // -- Dont include the object itself
            if (other === obj) return false;

            // -- Get the center of the other object
            const other_center = {
                x: other.x + other.shape.getClientRect().width / 2,
                y: other.y + other.shape.getClientRect().height / 2,
            };

            // -- Calculate the distance between the two centers
            const distance = Math.sqrt(
                Math.pow(other_center.x - obj_center.x, 2) +
                Math.pow(other_center.y - obj_center.y, 2)
            );

            // -- Return true if the distance is less than the radius
            return distance < radius;
        });
    }



    /**
     * @name colliding
     * @description Check if two objects are colliding
     * @param {PhysicsObject} a
     * @param {PhysicsObject} b
     * @returns {Vector2D | undefined} Returns the collison vector or null
     *                           if no collision    
     */
    private colliding(
        a: PhysicsObject,
        b: PhysicsObject
    ): Vector2D | undefined {
        // -- Check if the two objects are colliding
        //    This is done by checking if the distance between the two objects
        //    is less than the sum of the two radii

        // -- Get the bounding boxes of the two objects
        const a_box = a.shape.getClientRect();
        const b_box = b.shape.getClientRect();

        if (
            a_box.x + a_box.width > b_box.x &&
            a_box.x < b_box.x + b_box.width &&
            a_box.y + a_box.height > b_box.y &&
            a_box.y < b_box.y + b_box.height
        ) {
            // -- Calculate the point of intersection
            let dx = (a_box.x + (a_box.width / 2)) - (b_box.x + (b_box.width / 2));
            let dy = (a_box.y + (a_box.height / 2)) - (b_box.y + (b_box.height / 2));
            
            // -- Calculate the angle of the collision
            let angle = Math.atan2(dy, dx);

            // -- Calculate the distance between the two objects
            let dist = Math.sqrt(dx * dx + dy * dy);

            // -- Calculate the minimum distance between the two objects
            let min_dist = (a_box.width / 2) + (b_box.width / 2);

            // -- Calculate the overlap
            let overlap = min_dist - dist;

            // -- Calculate the collision vector
            return {
                x: Math.cos(angle) * overlap,
                y: Math.sin(angle) * overlap,
            };
        } 
        
        return undefined;
    }



    /**
     * @name debug_line
     * @description Draw a line between two points
     * @param {Vector2D} a
     * @param {Vector2D} b
     * @param {string} color
     * @param {ttl} number
     */
    private debug_line(
        a: Vector2D, 
        b: Vector2D, 
        color: string = 'black',
        ttl: number = 2
    ) {
        const line = new Konva.Line({
            points: [a.x, a.y, b.x, b.y],
            stroke: color,
            strokeWidth: 1,
        });

        this.layer.add(line);

        setTimeout(() => {
            line.destroy();
        } , ttl);
    }



    /**
     * @name delta_time
     * @description Calculate the time between frames
     * @returns {number} The time between frames in seconds
     */
    public delta_time(): number {
        // -- Calculate the time between frames
        const now = Date.now();
        const delta = now - this.last_frame;
        this.last_frame = now;

        // -- Return the time between frames in seconds
        return delta / 1000;
    }
}
