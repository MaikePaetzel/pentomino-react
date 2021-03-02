import './css/normalize.css';
import './css/skeleton.css';
import './css/style.css';
import './css/App.css';
import React, { useEffect, useReducer, useState, useRef } from 'react'
import { pento_I } from "./pento-objects/HelperPentoShapes";
import { PentoBoard } from "./pento-objects/PentoBoard";
import { PentoConfig } from "./config";
import { createNewPentoPieceInShape, generateElephantShape } from "./pento-objects/HelperDrawComplexShapes";
import Furhat from 'furhat-gui'


const App = () => {

  const pento_config = new PentoConfig()

  const n_blocks = pento_config.n_blocks;
  const board_size = pento_config.board_size;
  const block_size = pento_config.block_size;
  const grid_x = 0;
  const grid_y = 0;

  const game_time = 600;

  const grid_config = {
    "n_blocks": n_blocks,
    "board_size": board_size,
    "block_size": block_size,
    "x": grid_x,
    "y": grid_y
  }
  const initialState = {
    "left_board": [],
    "right_board": [],
    "game": {
      "status": "initial",
      "startTime": undefined,
      "time": game_time,
    },
    "selected": ""
  }


  const gameTimeHandler = useRef();


  const [initialShapes, setInitialShapes] = useState([]);
  const [placedShapes, setPlacedShapes] = useState([]);

  const [activeShape, setActiveShape] = useState([]);

  const [initialized, setInitialized] = useState(false)


  const [gameState, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'gameStart':
        return {
          ...state,
          game: {
            ...state.game,
            status: 'ongoing',
            startTime: new Date().getTime()
          }
        };
      case 'selectPiece': {
        return {
          ...state,
          selected: action.piece.name
        };
      };
      case 'deselectPiece': {
        return {
          ...state,
          selected: ""
        };
      }
      case 'addToRightBoard':
        return {
          ...state,
          right_board: [...state.right_board, action.piece]
        };
      case 'addToLeftBoard':
        return {
          ...state,
          left_board: [...state.left_board, action.piece]
        };
      case 'removeFromLeftBoard':
        let filtered_list = state.left_board.filter(item => item.name !== action.piece.name)
        return {
          ...state,
          left_board: filtered_list
        };
      case 'gameWon':
        return {
          ...state,
          game: {
            ...state.game,
            status: 'won',
            startTime: new Date().getTime()
          }
        };
      case 'refreshTime':

        const currentTime = new Date().getTime();
        const newDiff = game_time - Math.floor((currentTime - state.game.startTime) / 1000.0);
        let newStatus = state.game.status;
        if (newDiff <= 0){
          newStatus = 'lost'
        }

        return {
          ...state,
          game: {
            ...state.game,
            status: newStatus,
            time: newDiff
          }
        };

      default:
        return state

    }
  }, initialState);


  const renderButtons = () => {
    return initialShapes.map(element => {
      return <button id={"pento_" + element.type} onClick={() => {
        selectPentoPiece(element.name)
      }}> {pento_config.get_color_name(element.color)} {element.type} </button>
    })
  };

  /**
   * This method is called when the respective button for a pento piece is pressed, or when
   * the "pick" event is received over the interface.
   */
  const selectPentoPiece = (pento_name) => {
    if (activeShape.length > 0 && activeShape[0].name == pento_name) {
      setActiveShape([])
    } else {
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
    setPlacedShapes([]);
    setActiveShape([]);
    setInitialShapes(generateElephantShape("elephant", pento_config, grid_config));

    dispatch({type: 'gameStart'})
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

      const newPiece = pentoPieceToObj(new_shape.name, new_shape.type, new_shape.color, new_shape.x, new_shape.y);
      dispatch({type: 'addToRightBoard', piece: newPiece});
      dispatch({type: 'removeFromLeftBoard', piece: to_replace});

      setPlacedShapes(placedShapes.concat(new_shape));
      setInitialShapes(initialShapes.filter(item => item.name !== to_replace.name));
      setActiveShape([])
    }
  };

  const pentoPieceToObj = (name, type, color_code, x, y) => {
    let color = pento_config.get_color_name(color_code)
    return {name, type, color, location: { x, y}}
  };

  useEffect(() => {
    if (gameState.game.status === 'ongoing') {
      console.log('Game status changed to ongoing');
      initialShapes.forEach(el => {
        const newPiece = pentoPieceToObj(el.name, el.type, el.color, el.x, el.y);
        dispatch({type: 'addToLeftBoard', piece: newPiece});
      });

      gameTimeHandler.current = setInterval(() => {
        dispatch({type: 'refreshTime'});
        sendDataToFurhat()
      }, 500)
    }
    if (['lost', 'won'].includes(gameState.game.status)){
      alert(`You ${gameState.game.status} the game!`);
      if (gameTimeHandler.current){
        clearInterval(gameTimeHandler.current)
      }
    }
  }, [gameState.game.status]);

  useEffect(() => {
    if (gameState.game.status === 'ongoing' && initialShapes?.length === 0) {
      dispatch({type: 'gameWon'})
    }
  }, [initialShapes, gameState.game.status]);

  useEffect(() => {
    if (activeShape && activeShape.length > 0) {
      dispatch({type: 'selectPiece', piece: activeShape[0]});
    }
    else {
      dispatch({type: 'deselectPiece'})
    }
  }, [activeShape]);

  useEffect(() => {

    Furhat(function (furhat) {

      window.furhat = furhat
      // We subscribe to the event to start the game
      furhat.subscribe('startGame', function () {
        startGame()
      });

      // We subscribe to the event to select a piece. We need to send the name of the shape as a parameter
      furhat.subscribe('selectPiece', function (shape_name) {
        selectPentoPiece(shape_name)
      });

      // We subscribe to the event to clear the selection of the current piece
      furhat.subscribe('deselectPiece', function () {
        deselect()
      });

      // We subscribe to the event to place the current piece on the right game board
      furhat.subscribe('startPlacing', function () {
        placeSelected()
      })
    })

  }, [])

  const initializationMonitor = () => {

    if(!window.furhat) {
      setTimeout(initializationMonitor, 1000)
    }
    else {
      setInitialized(true)
      console.log("Furhat initialized")
    }

  }

  useEffect(() => {
    initializationMonitor()
  }, [])

  const sendDataToFurhat = () => {
    if(window.furhat) {
      window.furhat.send({
        event_name: "GameStateUpdate",
        data: gameState.JSON()
      })
    }
  };


  return (
    <div className="App">
      <div className="twelve columns">
        <h5>Pentomino Game</h5>
      </div>
      <div className="row">
        <div className="six columns">
          <button id="startBtn" style={{ marginRight: 50 }} onClick={() => startGame()}>Start new game</button>
          <button id="placeBtn" style={{ marginRight: 50 }} onClick={() => placeSelected()}>Place selected</button>
          <button id="placeBtn" onClick={() => deselect()}>Deselected Piece</button>
        </div>
        <div className="six columns">
          <div style={{ color: "#555", fontSize: "16px" }}>Game State: {gameState.game.status}</div>
          <div style={{ color: "#555", fontSize: "16px" }}>Remaining Game Time: {gameState.game.time}</div>
        </div>
      </div>
      <hr />
      <div className="row">
        <div className="six columns">
          <PentoBoard shapes={initialShapes}
                      activeShape={activeShape[0]}
                      grid_properties={{
                        "title": "Initial",
                        "with_grid": true,
                        "with_tray": true,
                        "x": grid_x,
                        "y": grid_y
                      }}
                      config={{ "n_blocks": n_blocks, "board_size": board_size, "block_size": block_size }}
          />
        </div>
        <div className="six columns">
          <PentoBoard shapes={placedShapes}
                      grid_properties={{
                        "title": "Elephant",
                        "with_grid": true,
                        "with_tray": true,
                        "x": grid_x,
                        "y": grid_y
                      }}
                      config={{ "n_blocks": n_blocks, "board_size": board_size, "block_size": block_size }}
          />
        </div>
      </div>
      <div>
        {renderButtons()}
      </div>
    </div>
  );
};

export default App;
