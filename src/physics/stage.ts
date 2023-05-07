import Konva from 'konva';
import { PhysicsEnvironment, PhysicsObject } from '../index.d';

export default function build_stage(): PhysicsEnvironment {
    // -- Gather all the letters, data-phy attribute
    const letters = Array.from(document.querySelectorAll('[data-phy]')
    ) as Array<HTMLParagraphElement>;


    // -- Build the Konva stage
    const stage = new Konva.Stage({
        container: document.querySelector('[data-phy-env]') as HTMLDivElement,
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const layer = new Konva.Layer();
    const box = new Konva.Rect({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        fill: '#00000000',
        stroke: '#00000000',
    });

    stage.add(layer);
    layer.add(box);


    // -- Add the letters to the group
    const letter_group = new Konva.Group({x: 0, y: 0});
    let letter_array: Array<{
        letter: HTMLParagraphElement,
        shape: Konva.Text,
    }> = [],
        phy_objects = [];

    letters.forEach((letter) => {
        const bound = letter.getBoundingClientRect();

        // -- Build the Konva shape
        const letterShape = new Konva.Text({
            x: bound.x + 15,
            y: bound.y,
            width: bound.width,
            height: bound.height,
        });

        letter_array.push({
            letter: letter,
            shape: letterShape,
        });
        letter_group.add(letterShape);

        // -- Build the physics object
        const phy_object: PhysicsObject = {
            x: bound.x,
            y: bound.y,
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 },
            mass: 0.5,
            elasticity: 0.6,
            friction: 0.23,
            fixed: false,
            shape: letterShape,
        }

        // -- Add the physics object to the array
        phy_objects.push(phy_object);

    });


    letter_array.forEach((letter) => {
        // -- Apply a style to the letter to allow it to be moved
        letter.letter.parentElement.setAttribute('data-phy-env', 'true');
        letter.letter.parentElement.removeAttribute('flex');
        letter.letter.style.position = 'absolute';

        // -- On position change, update the element
        letter.shape.on('phy_update', () => {
            letter.letter.style.transform = `translate(${letter.shape.x()}px, ${letter.shape.y()}px)`;
        });

        // -- Update the element on load
        letter.shape.fire('phy_update');
    });
    

    // -- Add the letters group to the canvas
    layer.add(letter_group);

    // -- Build the physics environment
    const phy_env: PhysicsEnvironment = {
        stage: stage,
        layer: layer,
        objects: phy_objects,
        coefficient_of_restitution: 1.6,
    };

    // -- Remove any elements with the 'data-phy-rem' attribute
    const remove = Array.from(document.querySelectorAll('[data-phy-rem]')) as Array<HTMLElement>;
    remove.forEach((element) => element.remove());

    return phy_env;
}