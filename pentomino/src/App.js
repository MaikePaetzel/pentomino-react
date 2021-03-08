import './css/normalize.css';
import './css/skeleton.css';
import './css/style.css';
import './css/App.css';
import React, { useEffect, useReducer, useState, useRef } from 'react'
import { PentoBoard } from "./pento-objects/PentoBoard";
import { PentoConfig } from "./config";
import { configPerShape, createNewPentoPieceInShape, generateElephantShape } from "./pento-objects/HelperDrawComplexShapes";
import {grid_cell_to_coordinates} from "./pento-objects/HelperDrawingBoard";
import Furhat from 'furhat-gui'


const App = () => {

  const pento_config = new PentoConfig()

  const n_blocks = pento_config.n_blocks;
  const board_size = pento_config.board_size;
  const block_size = pento_config.block_size;
  const grid_x = 0;
  const grid_y = 0;

  // Diese Variable setzt, wie lang das Game im Webinterface dauert (in Sekunden)
  const game_time = 600;

  const grid_config = {
    "n_blocks": n_blocks,
    "board_size": board_size,
    "block_size": block_size,
    "x": grid_x,
    "y": grid_y
  }

  // Der initiale GameState
  const initialState = {
    "left_board": [],
    "right_board": [],
    "correctly_placed": [],
    "game": {
      "status": "initial",
      "startTime": undefined,
      "time": game_time,
    },
    "selected": "None"
  }


  // Dient dazu, den Intervall-Handler für die Spielzeit nach Ablauf der Spielzeit wieder zu zerstören
  // (ansonsten würde die Spielzeit negativ werden)
  const gameTimeHandler = useRef();

  // Die Pentomino-Steine auf dem linken Board
  const [initialShapes, setInitialShapes] = useState([])

  // Die Pentomino-Steine auf dem rechten Board
  const [placedShapes, setPlacedShapes] = useState([]);

  // Die momentan ausgewählten Pento-Steine
  const [activeShape, setActiveShape] = useState([]);

  // Speichert, ob die Web-UI mit dem Roboter verbunden ist
  const [initialized, setInitialized] = useState(false)

  // Speichert, ob die Web-UI auf alle Events des Roboters hört
  const [eventsInitialized, setEventsInitialized] = useState(false)


  //Hält den momentanen GameState und sorgt dafür, dass Änderungen korrekt umgesetzt werden
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
      }
      case 'deselectPiece': {
        return {
          ...state,
          selected: "None"
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

      case 'move':
        console.log('moving', action.dir);
        return state;

      case 'pieceAtGoal':
        return {
          ...state,
          correctly_placed: [...state.correctly_placed, action.piece]
        }

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


  /**
   * Rendert die Buttons unter dem Game-Board, mit denen zu Testzwecken einzelne Teile ausgewählt werden können.
   */
  const renderButtons = () => {
    return initialShapes.concat(placedShapes).sort().map(element => {
      return <button id={"pento_" + element.type} style={{ visibility: gameState.correctly_placed.find(shape => shape.name == element.name)?'hidden':'visible'}} onClick={() => {
        selectPentoPiece(element.name)
      }}> {pento_config.get_color_name(element.color)} {element.type} </button>
    })
  };

  /**
   * Diese Methode wird aufgerufen, wenn ein Pentomino-Stein ausgewählt wird (entweder durch Button-klick oder durch
   * ein Event vom Roboter)
   *
   * @param pento_name Der Name des Pentomino-Teils als String
   */
  const selectPentoPiece = (pento_name) => {
    if (activeShape.length > 0 && activeShape[0].name == pento_name) {
      deselect();
    } else {
      setActiveShape(initialShapes.concat(placedShapes).filter(item => item.name == pento_name.toString()));
    }
  };

  /**
   * Diese Methode sorgt dafür, dass alle momentan ausgewählten Spielsteine nicht mehr ausgewählt sind
   * Wird entweder durch Button-Klick oder Event vom Roboter aufgerufen.
   */
  const deselect = () => {
    setActiveShape([])
  };

  /** 
   * Hilfsmethode zum Testen, ob der ausgewählte ('aktive') Stein auf dem linken Brett ist.
   */
  const activeOnLeftBoard = () => {
    return (activeShape[0] && initialShapes.find(shape => shape.name == activeShape[0].name));
  }

  /** 
   * Hilfsmethode zum Testen, ob der ausgewählte ('aktive') Stein auf dem rechten Brett ist.
   */
  const activeOnRightBoard = () => {
    return (activeShape[0] && placedShapes.find(shape => shape.name == activeShape[0].name));
  }

  // Parameter und Variblen zur Bewegung des aktiven Spielsteins auf dem rechten Spielbrett
  const MOVESPEED = 5;
  const MOVEFREQ  = 200;
  const moveId    = null;
  
  const moveUp = () => {
    dispatch({type: 'move', dir: 'up'})
  }
  const moveDown = () => {}
  const moveLeft = () => {}
  const moveRight = () => {}

  const stopMove = () => {}

  /**
  * Den aktiven Spielstein auf dem rechten Brett rotieren, um delta_angle Grad
  */
  const rotateActive = (delta_angle) => {
    if (activeShape.length > 0) {
      let active = activeShape[0].name;
      // Aktive Shape rotieren, alle anderen bleiben unverändert. 
      // Nach dem Rotieren testen ob Shape in Zielkonfiguration ist und evtl. dort fixieren.
      setPlacedShapes(placedShapes.map(shape => {
        if (shape.name == active) {
          shape.rotate(delta_angle);
          fixCorrectlyPlaced(shape);
        }
        return shape;
      }));
    } else {
      console.log('No active shape');
    }
    dispatch({type: 'rotate', angle: delta_angle})
    // if (this.elephant_board.pento_active_shape) {
    //   this.elephant_board.rotate_shape(-90);
    //   this.fixCorrectlyPlaced();
    // } else {
    //   console.log('No active shape');
    // }
  }
  
  /**
   * Spiegelt einen aktiven Spielstein auf dem rechten Brett
   */
  const flipActive = (axis) => {
    if (activeShape.length > 0) {
      let active = activeShape[0].name;
      // Aktive Shape spiegeln, alle anderen bleiben unverändert. 
      // Nach dem Spiegeln testen, ob Shape in Zielkonfiguration ist und evtl. dort fixieren.
      setPlacedShapes(placedShapes.map(shape => {
        if (shape.name == active) {
          shape.flip(axis);
          fixCorrectlyPlaced(shape);
        }
        return shape;
      }));
    } else {
      console.log('No active shape');
    }
  }

    /**
   * If the currently active shape is placed, rotated and flipped correctly on the elephant board,
   * the corresponding button is hidden to stop any further changes by the user
   */
  const fixCorrectlyPlaced = () => {
    if (activeOnRightBoard() && isCorrectlyPlaced(activeShape[0])) {
      dispatch({type: 'pieceAtGoal', piece: activeShape[0]});
      setActiveShape([]);
    }
  }

  const isCorrectlyPlaced = (shape) => {
    // no flip applied
    if (shape.is_mirrored) { return false; }
    let goalCoords = configPerShape("elephant", grid_config.n_blocks);
    goalCoords = grid_cell_to_coordinates(goalCoords['x'] + goalCoords['coords'][shape.type]['x'],
                                          goalCoords['y'] + goalCoords['coords'][shape.type]['y']);
    if (shape.x != goalCoords[0] || shape.y != goalCoords[1]) { return false };
    // goal rotation is 0. 'rotation attribute' of shape is not necessarily correct
    // because of the flip action. Using a hack here: Check whether the block arrangement
    // corresponds to that of a newly created shape of the same type
    let dummy_shape = createNewPentoPieceInShape("dummy", grid_config, shape.type, "black", -1);
    let shape_grid = shape.get_internal_grid();
    let dummy_grid = dummy_shape.get_internal_grid();
    for (let row = 0; row < shape.get_grid_height(); row++) {
      for (let col = 0; col < shape.get_grid_width(); col++) {
        if (dummy_grid[row] == undefined ||
          dummy_grid[row][col] == undefined || // grid sizes don't match (shouldn't happen)
          dummy_grid[row][col] != shape_grid[row][col]) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Diese Methode wird aufgerufen, um das Spiel zu starten (entweder durch Button-klick oder durch Event vom Roboter)
   */
  const startGame = () => {
    // Alle aktuellen Spielsteine auf dem rechten Board löschen
    setPlacedShapes([]);

    // ALle aktuell ausgewählten Spielsteine löschen
    setActiveShape([]);
    setInitialShapes(generateElephantShape("elephant", pento_config, grid_config));

    dispatch({type: 'gameStart'})
  };

  /**
   * Diese Methode plaziert einen Spielstein an der richtigen Position auf dem rechten Spielbrett.
   * Wird entweder durch Button-Klick oder Event vom Roboter aufgerufen.
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

      // Falls der Spielstein auf dem linken Brett nicht gefunden wurde, gibt es nichts zu tun
      if (!to_replace) { return; }

      let new_shape = createNewPentoPieceInShape("upper_left_corner", grid_config, to_replace.type, to_replace.color, to_replace.id);

      const newPiece = pentoPieceToObj(new_shape.name, new_shape.type, new_shape.color, new_shape.x, new_shape.y);
      dispatch({type: 'addToRightBoard', piece: newPiece});
      dispatch({type: 'removeFromLeftBoard', piece: to_replace});

      setPlacedShapes(placedShapes.concat(new_shape));
      setInitialShapes(initialShapes.filter(item => item.name !== to_replace.name));

      // Spielstein der rechts gesetzt wurde wird aktiv
      setActiveShape([new_shape]);
    }
  };

  /**
   * Hilfsmethode, um einen Pentomino-Stein als JSON zu speichern
   * @param name Name des Pentimon-Steins
   * @param type Typ des Pentomino-Steins
   * @param color_code Farbe des Steins (als Hex-code)
   * @param x x-Koordinate auf dem Spielbrett
   * @param y z-Koordinate auf dem Spielbrett
   * @returns {{color, name, location: {x, y}, type}}
   */
  const pentoPieceToObj = (name, type, color_code, x, y) => {
    let color = pento_config.get_color_name(color_code)
    return {name, type, color, location: { x, y}}
  };

  /**
   * Dies hier wird getriggert, wenn es eine Änderung im Spielstatus gab
   */
  useEffect(() => {

    // Sorgt für den richtigen Status wenn das Spiel beginnt
    if (gameState.game.status === 'ongoing') {
      console.log('Game status changed to ongoing');
      initialShapes.forEach(el => {
        const newPiece = pentoPieceToObj(el.name, el.type, el.color, el.x, el.y);
        dispatch({type: 'addToLeftBoard', piece: newPiece});
      });
      gameTimeHandler.current = setInterval(() => {
        dispatch({type: 'refreshTime'});
      }, 500)
    }

    // Setzt den Alert für ein gewonnenes / verlorenes Spiel
    if (['lost', 'won'].includes(gameState.game.status)){
      alert(`You ${gameState.game.status} the game!`);
      if (gameTimeHandler.current){
        clearInterval(gameTimeHandler.current)
      }
    }
  }, [gameState.game.status]);

  /**
   * Dies wird getriggert, wenn es eine Änderung im Spielstatus oder der Liste mit Steinen auf dem linken Board gibt
   */
  useEffect(() => {

    // Wenn es keine Steine mehr auf dem linken Board gibt und das Spiel noch läuft, haben wir gewonnen
    if (gameState.game.status === 'ongoing' && initialShapes?.length === 0) {
      dispatch({type: 'gameWon'})
    }

    if (gameState.game.status === 'ongoing' && !eventsInitialized && window.furhat) {
      // Wir subscriben zu dem Event, das vom Roboter gesendet werden kann, um einen Spielstein auszuwählen
      window.furhat.subscribe('selectPiece', function (params) {
        selectPentoPiece(params.piece)
      });

      // Wir subscriben zu dem Event, das vom Roboter gesendet werden kann, um die aktuelle Auswahl an Spielsteinen
      // zu löschen
      window.furhat.subscribe('deselectPiece', function () {
        deselect()
      });

      // Wir subscriben zu dem Event, das vom Roboter gesendet werden kann, um den aktuell ausgewählten Spielstein
      // auf dem rechten Board zu plazieren
      window.furhat.subscribe('startPlacing', function () {
        placeSelected()
      })

      // Sorgt dafür, dass wir nur einmal zu den Furhat-Events subscriben
      setEventsInitialized(true);
    }

  }, [initialShapes, gameState.game.status]);

  /**
   * Hier werden Änderungen im aktuell ausgewählten Spielstein an die richtigen Stellen kommuniziert.
   */
  useEffect(() => {
    if (activeShape && activeShape.length > 0) {
      dispatch({type: 'selectPiece', piece: activeShape[0]});
    }
    else {
      dispatch({type: 'deselectPiece'})
    }
  }, [activeShape]);

  /**
   * Bei jedem Update in der Spielzeit (also einmal die Sekunde) wird der aktuelle Spielstand and Furhat gesendet
   */
  useEffect(() => {
    sendDataToFurhat()
  }, [gameState.game.time]);


  /**
   * Wenn die Web-UI initialisiert wird, verbinden wir uns mit dem Roboter.
   * Initial hören wir nur auf "startGame" events.
   */
  useEffect(() => {
    Furhat(function (furhat) {

      window.furhat = furhat
      // We subscribe to the event to start the game
      furhat.subscribe('startGame', function () {
        startGame()
      });
    })

  }, [])

  /**
   * Hilfs-methode zum Initialisieren der Verbindung mit Furhat
   */
  const initializationMonitor = () => {

    if(!window.furhat) {
      setTimeout(initializationMonitor, 1000)
    }
    else {
      setInitialized(true)
      console.log("Initialization successful")
    }

  }

  /**
   * Hilfs-methode zum Initialisieren der Verbindung mit Furhat
   */
  useEffect(() => {
    initializationMonitor()
  }, [])

  /**
   * Hilfsmethode, die Daten an den Roboter sendet
   */
  const sendDataToFurhat = () => {
    if(window.furhat) {
      window.furhat.send({
        event_name: "GameStateUpdate",
        data: JSON.stringify(gameState)
      })
    }
  }


  /**
   * Hier werden die einzelnen Komponenten in der Web-UI angezeigt
   */
  return (
      <div className="App">
        <div className="twelve columns">
          <h5>Pentomino Game</h5>
        </div>
        <div className="row">
          <div className="six columns">
          </div>
          <div className="six columns">
            <div style={{ color: "#555", fontSize: "16px" }}>Game State: {gameState.game.status}</div>
            <div style={{ color: "#555", fontSize: "16px" }}>Remaining Game Time: {gameState.game.time}</div>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="five columns">
            <PentoBoard shapes={initialShapes}
                        activeShape={ activeOnLeftBoard() ? activeShape[0] : null}
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
          <div className="two columns">
            <br/>
            <button id="startBtn" onClick={() => startGame()}>Start new game</button>
            <button id="placeBtn" onClick={() => placeSelected()}>Place selected</button>
            <button id="placeBtn" onClick={() => deselect()}>Deselect Piece</button>
            <hr/>
              <button id="leftBtn" onClick={() => rotateActive(-90)} style={{ fontSize: "15px" }}>{'\u21b6'}</button>
              <button onClick={() => moveUp()} style={{margin: "5px"}}>{'\u25b2'}</button>
              <button onClick={() => rotateActive(90)} style={{ fontSize: "15px" }}>{'\u21b7'}</button>
              <br/>
              <button onClick={() => moveLeft()}>{'\u25c0'}</button>
              <button onClick={() => stopMove()} style={{ fontSize: "20px", margin: "5px" }}>{'\u2613'}</button>
              <button onClick={() => moveRight()}>{'\u25b6'}</button>
              <br />
              <button onClick={() => flipActive('horizontal')} style={{ fontSize: "14px" }}>{'\u21c5'}</button>
              <button onClick={() => moveDown()} style={{margin: "5px"}}>{'\u25bc'}</button>
              <button onClick={() => flipActive('vertical')} style={{ fontSize: "14px" }}>{'\u21c6'}</button>
          </div>
          <div className="five columns">
            <PentoBoard shapes={placedShapes}
                        activeShape={ activeOnRightBoard() ? activeShape[0] : null}
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
