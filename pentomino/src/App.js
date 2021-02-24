import logo from './logo.svg';
import './css/normalize.css';
import './css/skeleton.css';
import './css/style.css';
import './css/App.css';
import React, {useRef, useEffect, useState} from 'react'
import {Shape} from "./pento-objects/PentoShape";
import {pento_create_shape, pento_I} from "./pento-objects/HelperPentoShapes";
import {draw_shape, draw_shape_border} from "./pento-objects/HelperDrawingBlocks";
import {PentoBoard_old} from "./pento-objects/PentoBoard_old";
import {PentoConfig} from "./config";
import {grid_cell_to_coordinates} from "./pento-objects/HelperDrawingBoard";
import {generateElephantShape} from "./pento-objects/HelperDrawComplexShapes";


function App() {

    const pento_config = new PentoConfig()

    const n_blocks = pento_config.n_blocks;
    const board_size = pento_config.board_size;
    const block_size = pento_config.block_size;
    const grid_x = 0;
    const grid_y = 0;

    const [initialShapes, setInitialShapes] = useState([]);
    const [placedShapes, setPlacedShapes] = useState([]);

    const [activeShape, setActiveShape] = useState(null)

    //TODO: Add onClick listener to setActiveShapeCorrectly
    const renderButtons = () => {
        return initialShapes.map(element => {
            return <button> {pento_config.get_color_name(element.color)} {element.type} </button>
        })
    }

    const startGame = () => {

        //TODO: The validation whether blocks collide doesn't work - they are frequently placed on top and right next to each other
        //TODO: The validation whether blocks are outside the board does not work either, parts of them are sticking out
        //TODO: Flip action doesn't work, breaks with indexing error

        setInitialShapes(generateElephantShape("elephant", pento_config, {"n_blocks": n_blocks, "board_size": board_size, "block_size": block_size , "x": grid_x, "y": grid_y}))
    };

    const placeSelected = () => {
        //TODO: get the currently selected shape from the initialShapes list and add to the placedShapes
        //TODO: update the position so it is placed correctly
    }


    //TODO: Correct placement and positions of the two boards, take the general styling from Karla's UI
    //TODO: Count down game time
  return (
    <div className="App">
        <div className="twelve columns">
            <h5>Pentomino Board</h5>
            <button id="startBtn" onClick={startGame} >Start new game</button>
            <button id="placeBtn" onClick={placeSelected}>Place selected</button>
            <hr/>
        </div>
        <div className="row">
            <div className="six columns">
              <PentoBoard_old shapes = {initialShapes}
                              grid_properties={{"title": "Initial", "with_grid": true, "with_tray": true, "x": grid_x, "y": grid_y}}
                              config={{"n_blocks": n_blocks, "board_size": board_size, "block_size": block_size }}
              />
            </div>
            <div className="six columns">
                <PentoBoard_old shapes = {placedShapes}
                                grid_properties={{"title": "Elephant", "with_grid": true, "with_tray": true, "x": grid_x, "y": grid_y}}
                                config={{"n_blocks": n_blocks, "board_size": board_size, "block_size": block_size }}
                />
            </div>
        </div>
        <div>
            {renderButtons()}
        </div>
    </div>
  );
}

export default App;
