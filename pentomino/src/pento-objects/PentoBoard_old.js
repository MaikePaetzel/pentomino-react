import React, {Component, useEffect, useRef} from "react";
import {pento_create_shape} from "./HelperPentoShapes";
import {draw_shape, draw_shape_border} from "./HelperDrawingBlocks";

export const PentoBoard_old = ({grid_properties, shapes, config}) => {

    const canvasRef = useRef(null)

    const title = grid_properties?.title || "test";
    const pento_config = config;
    const pento_shapes = shapes;

    // board size and grid parameters
    const pento_grid_cols	= config.n_blocks;
    const pento_grid_rows	= config.n_blocks;
    const width				= config.board_size;
    const height				= config.board_size;
    const pento_block_size	= config.block_size;
    const pento_grid_color = 'gray';
    const pento_grid_x = grid_properties.x;
    const pento_grid_y = grid_properties.y;

    // pento game parameters
    const show_grid = grid_properties.with_grid;
    const pento_read_only = false;
    const pento_lock_on_grid = true;			// make pieces jump to full grid cells
    const pento_prevent_collision = false;
    let pento_active_shape = null;
    const pento_with_tray = grid_properties.with_tray;
    const remove_at_rightclick = false;		// delete shapes by right-clicking them
    const deactivate_at_canvasleave = true;	// reset active shape when leaving the canvas

    // actions
    const _actions = ['move', 'rotate', 'connect', 'flip'];

    const draw = ctx => {
        //const b = new Block(1,1,10,10,'red')
        //draw_block(ctx,b,0,100,true)
        //const b2 = new Block(1,1,10,10,'red')
        //draw_block(ctx,b2,11,100,true)
        //const s = pento_create_shape(1, 10, 10, 'W', 'blue', false, 180, 10)
        //const s = new Shape(1,'I','red',true,90,10)
        //pento_I(s)
        //TODO: shape visible???
        pento_shapes.forEach((s) => {
            console.log(s)
            draw_shape(ctx,s,{offsetX: 0, offsetY: 0})
            draw_shape_border(ctx,s,{offsetX: 0, offsetY: 0})
        })

    };

    const init_board = (canvas, ctx) => {
        if (pento_with_tray) {
            canvas.height = height;
            canvas.width = width;
            draw_line(ctx, pento_grid_x, pento_grid_y + height, pento_grid_x + width+200, pento_grid_y+height, 'black', 'separator');
            //this.draw_text(pento_grid_x+40, pento_grid_y+ height+10, 'Tray');
        }
    };


    const init_grid = (ctx) => {

        //draws the outer border
        draw_line(ctx, pento_grid_x, pento_grid_y, pento_grid_x+width, pento_grid_y, 'black')
        draw_line(ctx, pento_grid_x+width, pento_grid_y, pento_grid_x+width, pento_grid_y+height, 'black')
        draw_line(ctx, pento_grid_x, pento_grid_y+height, pento_grid_x+width, pento_grid_y+height, 'black')
        draw_line(ctx, pento_grid_x, pento_grid_y, pento_grid_x, pento_grid_y+height, 'black')


        if (show_grid) {
            for (var i = 0; i <= pento_grid_rows; i++) {
                draw_line(ctx, pento_grid_x, pento_grid_y + i * pento_block_size,
                    pento_grid_x + width, pento_grid_y + i * pento_block_size, pento_grid_color);
            }

            for (var i = 0; i <= pento_grid_cols; i++) {
                draw_line(ctx,pento_grid_x + i * pento_block_size, pento_grid_y + 0,
                    pento_grid_x + i * pento_block_size, pento_grid_y + height, pento_grid_color);
            }
        }
    };


    const draw_line = (ctx, x, y, x2, y2, color, name) => {
        if (name == undefined) {
            name = 'line' + Math.random();
        }
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.strokeWidth = 1;
        ctx.strokeStyle = color;
        ctx.stroke();
    };


    // functions to access grid borders
    const left_edge = () => {
        return pento_grid_x
    };

    const right_edge = () => {
        return pento_grid_x + this.width
    };

    const upper_edge = () => {
        return pento_grid_y
    };

    const lower_edge = () =>  {
        return pento_grid_y + this.height
    };

    const get_shapes = () => {
        return pento_shapes;
    };

    const get_actions = () => {
        return _actions;
    };

    /**
     * @return shape with given name
     */
    const get_shape = (name) => {
        return pento_shapes[name];
    };

    /**
     * Unselect the currently active shape
     */
    const clear_selections = () => {
        if (this.pento_active_shape != null){
            this.pento_active_shape.set_deactive();
        }
        this.pento_active_shape = null;

        //draw(); TODO
    };






    useEffect(() => {

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        //Our draw come here
        init_board(canvas, context)
        init_grid(context)
        draw(context)
    }, [shapes])

    return <canvas ref={canvasRef} />
}
