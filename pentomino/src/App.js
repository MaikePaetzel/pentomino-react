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
import {createNewPentoPieceInShape, generateElephantShape} from "./pento-objects/HelperDrawComplexShapes";


function App() {

    const pento_config = new PentoConfig()

    const n_blocks = pento_config.n_blocks;
    const board_size = pento_config.board_size;
    const block_size = pento_config.block_size;
    const grid_x = 0;
    const grid_y = 0;

    const game_time = 600

    const grid_config = {"n_blocks": n_blocks, "board_size": board_size, "block_size": block_size , "x": grid_x, "y": grid_y}

    const [initialShapes, setInitialShapes] = useState([]);
    const [placedShapes, setPlacedShapes] = useState([]);

    const [activeShape, setActiveShape] = useState([]);

    const [gameState, setGameState] = useState({
        "left_board": [],
        "right_board": [],
        "game": {
            "status": "initial",
            "time": 600,
        },
        "selected": ""
    });

    const [beginGame, setBeginGame] = useState( )
    let gameTimeHandler = null;

    const renderButtons = () => {
        return initialShapes.map(element => {
            return <button id={"pento_"+element.type} onClick={() => {selectPentoPiece(element.name)}}> {pento_config.get_color_name(element.color)} {element.type} </button>
        })
    };

    /**
     * This method is called when the respective button for a pento piece is pressed, or when
     * the "pick" event is received over the interface.
     */
    const selectPentoPiece = (pento_name) => {
        if(activeShape.length > 0 && activeShape[0].name == pento_name) {
            setActiveShape([])
        }
        else {
            setActiveShape(initialShapes.filter(item => item.name == pento_name));
        }
    };

    /**
     * This method is called when the "Deselect" button is pressed, or when
     * the "deselect" event is received over the interface.
     */
    const deselect = () => {
        setActiveShape([])
    };

    /**
     * This method is called when the "Start Game" button is pressed, or when
     * the "start_game" event is received over the interface.
     */
    const startGame = () => {

        let newState = gameState;
        newState.game.status = "ongoing";
        setGameState(newState)
        setPlacedShapes([]);
        setActiveShape([]);
        setInitialShapes(generateElephantShape("elephant", pento_config, grid_config));
        startGameTimer();
    };

    /**
     * This method is called when the "Place selected" button is pressed, or when
     * the "place_selected" event is received over the interface.
     */
    const placeSelected = () => {
        if (activeShape.length > 0) {
            let selected_shape = activeShape[0].name;
            let to_replace = null;
            initialShapes.forEach(el => {
                if (el.name == selected_shape) {
                    to_replace = el
                }
            });

            let new_shape = createNewPentoPieceInShape("elephant", pento_config, grid_config, to_replace.type, to_replace.color, to_replace.id);

            let newState = gameState;
            newState.right_board.concat(pentoPieceToObj(new_shape.name, new_shape.type, new_shape.color, new_shape.x, new_shape.y));
            setGameState(newState);

            setPlacedShapes(placedShapes.concat(new_shape));
            setInitialShapes(initialShapes.filter(item => item.name !== to_replace.name));
            setActiveShape([])
        }
    };

    const pentoPieceToObj = (name, type, color, coord_x, coord_y) => {
        return {
            "name": name,
            "type": type,
            "color": color,
            "location": {
                "x": coord_x,
                "y": coord_y
            }
        }
    };


    //TODO: Make this a pop-up
    const gameWon = () => {
        //let newState = gameState;
        //newState.game.status = "lost"
        //setGameState(newState)
    };

    const gameLost = () => {
        let newState = gameState;
        newState.game.status = "lost"
        setGameState(newState)
    };

    //TODO: Why is initialShapes == 0 all the time????
    //TODO: Why doesn't the game time update anymore, only when the button is set?
    const updateGameTime = () => {

        if(initialShapes.length == 0) {
            gameWon();
        }

        let time_diff = 0;

        console.log("S1 " + beginGame)
        if (!beginGame) {
            time_diff = (new Date().getTime() - beginGame);
            console.log("S2 " + time_diff)

        }

        let remainingTime = game_time - time_diff;

        if (remainingTime <= 0) {
            clearInterval(gameTimeHandler);
            gameLost()
        }

        let newState = gameState;
        newState.game.time = remainingTime;
        setGameState(newState);

    };

    const startGameTimer = () => {
        let currentTime = new Date().getTime();
        setBeginGame(currentTime);
        gameTimeHandler = setInterval(() => updateGameTime(), 300)
    };

      return (
        <div className="App">
            <div className="twelve columns">
                <h5>Pentomino Game</h5>
            </div>
            <div className="row">
                <div className="six columns">
                    <button id="startBtn" style={{marginRight: 50}} onClick={() => startGame()} >Start new game</button>
                    <button id="placeBtn" style={{marginRight: 50}} onClick={() => placeSelected()}>Place selected</button>
                    <button id="placeBtn" onClick={() => deselect()}>Deselected Piece</button>
                </div>
                <div className="six columns">
                    <div style={{color: "#555", fontSize: "16px"}}>Game State: {gameState.game.status}</div>
                    <div style={{color: "#555", fontSize: "16px"}}>Remaining Game Time: {gameState.game.time}</div>
                </div>
            </div>
            <hr/>
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
