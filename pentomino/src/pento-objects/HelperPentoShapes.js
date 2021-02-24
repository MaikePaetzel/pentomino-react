/**
 * Draw point (one block shape)
 */
import {Block} from "./PentoBlock";
import {Shape} from "./PentoShape";

const pento_point = (shape) => {
    var block = pento_create_block(0, 0, shape.block_size, shape.color);
    shape.add_block(block);
}

const pento_create_block = (x, y, block_size, color) => {
    return new Block(x, y, block_size, block_size, color)
};

// draw F 
const pento_F = (shape) => {
    // Draw block

    for (var i = 0; i < 3; i++) {
        var block = pento_create_block(0, + i * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    if (shape.is_mirrored) {
        shape.add_block(pento_create_block(shape.block_size, + shape.block_size, shape.block_size, shape.color));
        shape.add_block(pento_create_block(- shape.block_size, 0, shape.block_size, shape.color));
    } else {
        shape.add_block(pento_create_block(- shape.block_size, + shape.block_size, shape.block_size, shape.color));
        shape.add_block(pento_create_block(shape.block_size, 0, shape.block_size, shape.color));
    }
};

// Draw I
const pento_I = (shape) => {
    // Draw blocks
    for (var i = 0; i < 4; i++) {
        var block = pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }
};

// Draw L
const pento_L = (shape) => {
    // Draw blocks
    for (var i = 0; i < 4; i++) {
        var block = pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    if (shape.is_mirrored) {
        var block = pento_create_block(shape.block_size, 3 * shape.block_size, shape.block_size, shape.color);
    } else {
        var block = pento_create_block(- shape.block_size, 3 * shape.block_size, shape.block_size, shape.color);
    }
    shape.add_block(block);
};

// draw N
const pento_N = (shape) => {

    // Draw blocks
    for (var i = 0; i < 3; i++) {
        var block = pento_create_block(0, + i * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    for (var i = 2; i < 4; i++) {
        if (shape.is_mirrored) {
            var block = pento_create_block(shape.block_size, + i * shape.block_size, shape.block_size, shape.color);
        } else {
            var block = pento_create_block(shape.block_size, + i * shape.block_size, shape.block_size, shape.color);
        }
        shape.add_block(block);
    }
};

// draw P
const pento_P = (shape) => {

    // Draw blocks
    for (var i = 0; i < 3; i++) {
        var block = pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    for (var i = 0; i < 2; i++) {
        if (shape.is_mirrored) {
            var block = pento_create_block(shape.block_size, + i * shape.block_size, shape.block_size, shape.color);
        } else {
            var block = pento_create_block(- shape.block_size, + i * shape.block_size, shape.block_size, shape.color);
        }
        shape.add_block(block);
    }
};

// Draw T
const pento_T = (shape) => {
    // Draw blocks
    for (var i = 0; i < 3; i++) {
        var block = pento_create_block(0, + i * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    shape.add_block(pento_create_block(- shape.block_size, 0, shape.block_size, shape.color));
    shape.add_block(pento_create_block(shape.block_size, 0, shape.block_size, shape.color));
};

// draw U
const pento_U = (shape) => {
    // Draw blocks
    for (var i = 0; i < 3; i++) {
        var block = pento_create_block(i * shape.block_size, + shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    var block = pento_create_block(0, 0, shape.block_size, shape.color);
    shape.add_block(block);

    var block = pento_create_block(2 * shape.block_size, 0, shape.block_size, shape.color);
    shape.add_block(block);
};

// draw V
const pento_V = (shape) => {
    // Draw blocks
    for (var i = 0; i < 3; i++) {
        var block = pento_create_block(i * shape.block_size, 2 * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    for (var i = 0; i < 2; i++) {
        var block = pento_create_block(2 * shape.block_size, i * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }
};

// draw W
const pento_W = (shape) => {

    // Draw blocks
    for (var i = 0; i < 2; i++) {
        var block = pento_create_block(i * shape.block_size, 2 * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    for (var i = 1; i < 3; i++) {
        var block = pento_create_block(i * shape.block_size, 1 * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    var block = pento_create_block(2 * shape.block_size, 0, shape.block_size, shape.color);
    shape.add_block(block);
};

// Draw X
const pento_X = (shape) => {
    // Draw blocks
    for (var i = 0; i < 3; i++) {
        var block = pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    shape.add_block(pento_create_block(- shape.block_size, shape.block_size, shape.block_size, shape.color));
    shape.add_block(pento_create_block(shape.block_size, shape.block_size, shape.block_size, shape.color));
};

// Draw Y
const pento_Y = (shape) => {
    // Draw blocks
    for (var i = 0; i < 4; i++) {
        var block = pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    if (shape.is_mirrored) {
        var block = pento_create_block(shape.block_size, shape.block_size, shape.block_size, shape.color);
    } else {
        var block = pento_create_block(- shape.block_size, shape.block_size, shape.block_size, shape.color);
    }
    shape.add_block(block);
};

// draw Z
const pento_Z = (shape) => {
    // Draw blocks
    for (var i = 0; i < 3; i++) {
        var block = pento_create_block(0, i * shape.block_size, shape.block_size, shape.color);
        shape.add_block(block);
    }

    if (shape.is_mirrored) {
        shape.add_block(pento_create_block(shape.block_size, 2 * shape.block_size, shape.block_size, shape.color));
        shape.add_block(pento_create_block(-shape.block_size, 0, shape.block_size, shape.color));
    } else {
        shape.add_block(pento_create_block(shape.block_size, 0, shape.block_size, shape.color));
        shape.add_block(pento_create_block(- shape.block_size, 2 * shape.block_size, shape.block_size, shape.color));
    }

};

const _new_pento_shape = (id, type, color, is_mirrored, rotation, block_size) => {
    return new Shape(id, type, color, is_mirrored, rotation == null ? 0 : rotation, block_size)
};

export const pento_create_shape = (id, x, y, type, color, is_mirrored, rotation, block_size) => {
    //create empty shape
    var new_shape = _new_pento_shape(id, type, color, is_mirrored, rotation, block_size);

    switch (type) {
        case 'point':
            pento_point(new_shape);
            break;
        case 'F':
            pento_F(new_shape);
            break;
        case 'I':
            pento_I(new_shape);
            break;
        case 'L':
            pento_L(new_shape);
            break;
        case 'N':
            pento_N(new_shape);
            break;
        case 'P':
            pento_P(new_shape);
            break;
        case 'T':
            pento_T(new_shape);
            break;
        case 'U':
            pento_U(new_shape);
            break;
        case 'V':
            pento_V(new_shape);
            break;
        case 'W':
            pento_W(new_shape);
            break;
        case 'X':
            pento_X(new_shape);
            break;
        case 'Y':
            pento_Y(new_shape);
            break;
        case 'Z':
            pento_Z(new_shape);
            break;
        default:
            console.log('Unsupported shape type: ' + type);
            return;
    }

    // Important: Closing the shapes disabled editing and
    // calculates center point for rotations
    new_shape.close();

    // move and rotate
    new_shape.moveTo(x, y);
    new_shape.rotate(rotation);

    return new_shape
};