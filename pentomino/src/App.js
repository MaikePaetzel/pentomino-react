import logo from './logo.svg';
import './css/normalize.css';
import './css/skeleton.css';
import './css/style.css';
import './css/App.css';
import React, {useRef, useEffect, useState} from 'react'
import {Shape} from "./pento-objects/PentoShape";
import {pento_create_shape, pento_I} from "./pento-objects/HelperPentoShapes";
import {draw_shape, draw_shape_border} from "./pento-objects/HelperDrawingBlocks";
import {PentoBoard} from "./pento-objects/PentoBoard";
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

    const [activeShape, setActiveShape] = useState([])

    const renderButtons = () => {
        return initialShapes.map(element => {
            return <button id={"pento_"+element.type} onClick={() => {selectPentoPiece(element.name)}}> {pento_config.get_color_name(element.color)} {element.type} </button>
        })
    }

    const selectPentoPiece = (pento_name) => {
        if(activeShape.length > 0 && activeShape[0].name == pento_name) {
            setActiveShape([])
        }
        else {
            console.log(pento_name);
            setActiveShape(initialShapes.filter(item => item.name == pento_name));
        }
    };

    const startGame = () => {

        //TODO: The validation whether blocks are outside the board does not work either, parts of them are sticking out
        setPlacedShapes([]);
        setActiveShape([]);
        setInitialShapes(generateElephantShape("elephant", pento_config, {"n_blocks": n_blocks, "board_size": board_size, "block_size": block_size , "x": grid_x, "y": grid_y}));
        console.log(initialShapes)
    };

    //TODO: Hier muss die Position der Steine wieder verändert werden, so dass sie auch als Teil des Elefanten rechts eingefügt werden
    const placeSelected = () => {
        if (activeShape.length > 0) {
            let selected_shape = activeShape[0].name;
            let to_replace = null;
            initialShapes.forEach(el => {
                if (el.name == selected_shape) {
                    to_replace = el
                }
            })
            setPlacedShapes(placedShapes.concat(to_replace));
            setInitialShapes(initialShapes.filter(item => item.name !== to_replace.name));
            setActiveShape([])
        }
    };


    //TODO: Count down game time
  return (
    <div className="App">
        <div className="twelve columns">
            <h5>Pentomino Spiel</h5>
            <button id="startBtn" style={{marginRight: 50}} onClick={() => {startGame()}} >Start new game</button>
            <button id="placeBtn" onClick={() => {placeSelected()}}>Place selected</button>
            <hr/>
        </div>
        <div className="row">
            <div className="six columns">
              <PentoBoard shapes = {initialShapes}
                          activeShape = {activeShape[0]}
                          grid_properties={{"title": "Initial", "with_grid": true, "with_tray": true, "x": grid_x, "y": grid_y}}
                          config={{"n_blocks": n_blocks, "board_size": board_size, "block_size": block_size }}
              />
            </div>
            <div className="six columns">
                <PentoBoard shapes = {placedShapes}
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
