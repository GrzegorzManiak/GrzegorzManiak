import Konva from 'konva';

export interface PhysicsObject {
    x: number;
    y: number;
    
    velocity: Vector2D;
    acceleration: Vector2D;

    mass: number;
    elasticity: number;
    friction: number;
    fixed: boolean;
    shape: Konva.Shape;
}

export interface PhysicsEnvironment {
    stage: Konva.Stage;
    layer: Konva.Layer;
    objects: Array<PhysicsObject>;
    coefficient_of_restitution: number;
}

export interface Vector2D {
    x: number;
    y: number;
}
