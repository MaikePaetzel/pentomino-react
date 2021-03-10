import './css/normalize.css';
import './css/skeleton.css';
import './css/style.css';
import './css/App.css';
import React, { useEffect, useReducer, useState, useRef } from 'react'
import { PentoBoard } from "./pento-objects/PentoBoard";
import { PentoConfig } from "./config";
import { configPerShape, createNewPentoPieceInShape, generateElephantShape } from "./pento-objects/HelperDrawComplexShapes";
import { grid_cell_to_coordinates, coordinates_to_grid_cell } from "./pento-objects/HelperDrawingBoard";
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
    "selected": "None",
    "selected_coords": []
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

  //Speichert, ob wir gerade unser Popup für Spiel gewonnen anzeigen
  const [isPopupWonOpen, setIsPopupWonOpen] = useState(false);

  //Speichert, ob wir gerade unser Popup für Spiel gewonnen anzeigen
  const [isPopupLostOpen, setIsPopupLostOpen] = useState(false);

  const togglePopupWon = () => {
    setIsPopupWonOpen(!isPopupWonOpen);
  };

  const togglePopupLost = () => {
    setIsPopupLostOpen(!isPopupLostOpen);
  };


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
      case 'updateCoords': {
        // Pixelkoordinaten in Gitterkoordinaten umrechnen
        // falls kein Stein aktiv, leeres Array speichern
        return {
          ...state,
          selected_coords: (action.x < 0 || action.y < 0) ? [] : coordinates_to_grid_cell(action.x, action.y, grid_config.block_size)
        }
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
        let new_left_board = state.left_board.filter(item => item.name !== action.piece.name)
        return {
          ...state,
          left_board: new_left_board
        };
      case 'pieceAtGoal':
        let new_right_board = state.right_board.filter(item => item.name !== action.piece.name);
        return {
          ...state,
          right_board: new_right_board,
          correctly_placed: [...state.correctly_placed, action.piece]
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
      case 'resetGame':
        return {
          "left_board": [],
          "right_board": [],
          "correctly_placed": [],
          "game": {
            "status": "initial",
            "startTime": undefined,
            "time": game_time,
          },
          "selected": "None",
          "selected_coords": []
        }
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
   * Hier erzeugen wir unseren Popup für den Fall, dass wir das Spiel gewonnen haben
   * @param props
   * @returns {*}
   * @constructor
   */
  const PopupWon = props => {
        return (
            <div className="popup-box">
              <div className="box">
                <b>Congratulations!</b>
                <p>You won this round of Pentomino.</p>
                <button onClick={props.handleClose}>Okay</button>
            </div>
            </div>
        );
      };

  /**
   * Hier erzeugen wir unseren Popup für den Fall, dass wir das Spiel verloren haben
   * @param props
   * @returns {*}
   * @constructor
   */
  const PopupLost = props => {
    return (
        <div className="popup-box">
          <div className="box">
            <b>Awwwwww!</b>
            <p>Sorry, but the time is up - you lost this round of Pentomino.</p>
            <button onClick={props.handleClose}>Okay</button>
        </div>
        </div>
    );
  };


  /**
   * Rendert die Buttons unter dem Game-Board, mit denen zu Testzwecken einzelne Teile ausgewählt werden können.
   */
  const renderButtons = () => {
    return initialShapes.concat(placedShapes).sort().map(element => {
      return <button id={"pento_" + element.type} 
        style={{ visibility: gameState.correctly_placed.find(shape => shape.name == element.name)?'hidden':'visible'}} 
        onClick={() => {
          selectPentoPiece(element.name);
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
      // Evtl. laufende Bewegung des alten aktiven Steins stoppen.
      stopMove();
      setActiveShape(initialShapes.concat(placedShapes).filter(item => item.name == pento_name.toString()));
    }
  };
  /**
   * Diese Methode sorgt dafür, dass alle momentan ausgewählten Spielsteine nicht mehr ausgewählt sind
   * Wird entweder durch Button-Klick oder Event vom Roboter aufgerufen.
   */
  const deselect = () => {
    stopMove();
    setActiveShape([]);
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

  // Parameter und Variablen zur Bewegung des aktiven Spielsteins auf dem rechten Spielbrett
  const [MOVESPEED, setMOVESPEED] = useState(5);
  const [MOVEFREQ, setMOVEFREQ]   = useState(200);
  const moveHandler               = useRef(null);

  /**
  * Den aktiven Stein um (dx,dy) verschieben.
  * @param {Entfernung horizontal} dx
  * @param {Entfernung vertikal} dy
  */
  const moveActive = (dx, dy) => {
    let active = activeShape[0];
    // den Gamestate mit den neuen Koordinaten updaten
    dispatch({type: 'updateCoords', x:active.x+dx, y:active.y+dy});
    active.moveTo(active.x+dx, active.y+dy);
  };

  /**
   * Eine aktuelle Bewegung des aktiven Spielsteins stoppen und eine neue Bewegung starten.
   * @param {eine Richtung aus ['up', 'down', 'left', 'right']} dir
   * @param {Häufigkeit der Bewegung, default:200} interval
   * @param {mit jedem Schritt zurückgelegte Pixel, default: 5} step
   */
  const startMove = (dir, interval=MOVEFREQ, step=MOVESPEED) => {
    if (activeOnRightBoard()) {
      // evtl. stattfindende Bewegung anhalten, aber für eine flüssige Richtungsänderung
      // Stein nicht ein
      stopMove(false);
      // setInterval wird genutzt, um die Funktion moveActive in regelmäßigen Abständen auszuführen
      switch (dir) {
        case 'up':
          moveHandler.current = setInterval(moveActive, interval, 0, -step);
          break;
        case 'down':
          moveHandler.current = setInterval(moveActive, interval, 0, step);
          break;
        case 'left':
          moveHandler.current = setInterval(moveActive, interval, -step, 0);
          break;
        case 'right':
          moveHandler.current = setInterval(moveActive, interval, step, 0);
          break;
        default:
          console.log(`Unknown direction: ${dir} at startMove`);
      }
    } else {
      console.log('No active shape');
    }
  }

  /**
  * Bewegung des aktiven Spielstein anhalten und den Stein auf einem Quadrat der Matrix 'einrasten' lassen
  */
  const stopMove = (lock_and_fix_correct=true) =>  {
    clearInterval(moveHandler.current);
    if (lock_and_fix_correct && activeOnRightBoard()) {
      lockActiveOnGrid();
      fixCorrectlyPlaced(); // falls Stein korrekt liegt: fixieren
    }
  }
  
  /**
  * Den aktiven Spielstein auf dem rechten Brett rotieren, um delta_angle Grad
  */
  const rotateActive = (delta_angle) => {
    if (activeShape.length > 0) {
      let active = activeShape[0];
      // Aktive Shape rotieren; testen, ob Shape in Zielkonfiguration ist und evtl. dort fixieren
      active.rotate(delta_angle);
      fixCorrectlyPlaced(active);
    } else {
      console.log('No active shape');
    }
  }
  
  /**
   * Spiegelt einen aktiven Spielstein auf dem rechten Brett
   */
  const flipActive = (axis) => {
    if (activeShape.length > 0) {
      let active = activeShape[0];
      // Aktive Shape spiegeln; testen, ob Shape in Zielkonfiguration ist und evtl. dort fixieren.
      active.flip(axis);
      fixCorrectlyPlaced(active);
    } else {
      console.log('No active shape');
    }
  }

  /**
   * Falls die aktuell aktive Shape korrekt platziert und ausgerichtet ist, wird dies im Gamestate vermerkt
   * und der zugehörige Button versteckt, um weitere Änderungen zu verhindern.
   */
  const fixCorrectlyPlaced = () => {
    if (activeOnRightBoard() && isCorrectlyPlaced(activeShape[0])) {
      dispatch({type: 'pieceAtGoal', piece: activeShape[0]});
      setActiveShape([]);
    }
  }

  /**
   * Testet, ob ein Spielstein an der richtigen Position in der richtigen Ausrichtung liegt.
   * {zu testendes PentoShape object} shape
   */
  const isCorrectlyPlaced = (shape) => {
    // Shape darf nicht gespiegelt sein
    if (shape.is_mirrored) { return false; }
    let goalCoords = configPerShape("elephant", grid_config.n_blocks);
    goalCoords = grid_cell_to_coordinates(goalCoords['x'] + goalCoords['coords'][shape.type]['x'],
                                          goalCoords['y'] + goalCoords['coords'][shape.type]['y'],
                                          grid_config.block_size);
    if (shape.x != goalCoords[0] || shape.y != goalCoords[1]) { return false; };
    // Die Zielrotation ist 0. Das 'rotation'-Attribut eines Steins kann jedoch nicht einfach
    // verwendet werden, da der Wert bei Verwendung einer Spiegelung ('flip') verfälscht
    // werden kann. Hier wird eine etwas 'hacky' Lösung verwendet: Es wird eine neue Shape
    // desselben Typs erstellt und die Blockanordnung abgeglichen.
    let dummy_shape = createNewPentoPieceInShape("elephant", grid_config, shape.type, "black", -1);
    let shape_grid = shape.get_internal_grid();
    let dummy_grid = dummy_shape.get_internal_grid();
    for (let row = 0; row < shape.get_grid_height(); row++) {
      for (let col = 0; col < shape.get_grid_width(); col++) {
        if (dummy_grid[row] == undefined ||
          dummy_grid[row][col] == undefined || // sollte nicht vorkommen: Größen der internen Matrizen ('grid') stimmen nicht überein
          dummy_grid[row][col] != shape_grid[row][col]) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Einen auf dem rechten Spielbrett aktiven Spielstein auf einem Quadrat 'einrasten' lassen, sodass
   * der Stein auf dem Feld bleibt und am Hintergrundgitter ausgerichtet ist.
   */
  const lockActiveOnGrid = () => {
    if (activeOnRightBoard()) {
      let active = activeShape[0];
      // Sicherstellen, dass der Stein das Spielfeld nicht verlässt
      let new_x = Math.max(active.x, grid_config.x + 2*grid_config.block_size);
      new_x   = Math.min(new_x, grid_config.board_size - 2*grid_config.block_size);
      let new_y = Math.max(active.y, grid_config.y + 2*grid_config.block_size);
      new_y   = Math.min(new_y, grid_config.board_size - 2*grid_config.block_size);
      // Stein auf einem Quadrat einrasten lassen
      new_x = Math.floor((new_x - grid_config.x) / grid_config.block_size) * grid_config.block_size;
      new_y = Math.floor((new_y - grid_config.y) / grid_config.block_size) * grid_config.block_size;
      active.moveTo(new_x, new_y);
      dispatch({type: 'updateCoords', x:new_x, y:new_y});
    } else {
      console.log('No active shape');
    }
}

  /**
   * Diese Methode wird aufgerufen, um das Spiel zu starten (entweder durch Button-klick oder durch Event vom Roboter)
   */
  const startGame = () => {
    // Alle aktuellen Spielsteine auf dem rechten Board löschen
    dispatch({type: "resetGame"});
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

      // Kopie des aktiven Stein erstellen, mit anderer Position, aber gleicher Rotation und Spiegelung
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
      if ('lost' === gameState.game.status){
        togglePopupLost();
      }
      if ('won' === gameState.game.status){
        togglePopupWon();
      }
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
      dispatch({type: 'updateCoords', x:activeShape[0].x, y:activeShape[0].y});
    }
    else {
      dispatch({type: 'deselectPiece'});
      dispatch({type: 'updateCoords', x:-1, y:-1});
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
        {isPopupWonOpen && <PopupWon
            handleClose={togglePopupWon}
        />}
        {isPopupLostOpen && <PopupLost
            handleClose={togglePopupLost}
        />}
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
              <button onClick={() => startMove('up')} style={{margin: "5px"}}>{'\u25b2'}</button>
              <button onClick={() => rotateActive(90)} style={{ fontSize: "15px" }}>{'\u21b7'}</button>
              <br/>
              <button onClick={() => startMove('left')}>{'\u25c0'}</button>
              <button onClick={() => stopMove()} style={{ fontSize: "20px", margin: "5px" }}>{'\u2613'}</button>
              <button onClick={() => startMove('right')}>{'\u25b6'}</button>
              <br />
              <button onClick={() => flipActive('horizontal')} style={{ fontSize: "14px" }}>{'\u21c5'}</button>
              <button onClick={() => startMove('down')} style={{margin: "5px"}}>{'\u25bc'}</button>
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
