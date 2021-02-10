import events from './events';

function createDOMController(game) {
  const playerGrid = document.querySelector('.player-section-wrapper .grid');
  const computerGrid = document.querySelector('.computer-section-wrapper .grid');

  /* STATE */

  let placedShips = [];
  let selectionLength = null;
  let selectionOrientation = 'up';
  let isThereAnotherShip = true;
  const shipsToPlace = (function createShipsToPlace() {
    const items = [5, 4, 3, 3, 2];
    let currentIndex = 0;
    const nextShipLength = function nextShipLength() {
      if (currentIndex >= items.length) {
        selectionLength = null;
        isThereAnotherShip = false;
      } else {
        selectionLength = items[currentIndex];
        currentIndex += 1;
      }
    };
    const reset = function reset() {
      isThereAnotherShip = true;
      currentIndex = 0;
      nextShipLength();
    };
    return {
      nextShipLength,
      reset,
    };
  }());

  const setInformation = function setInformation(message) {
    document.querySelector('.information').textContent = message;
  };
  const getCell = function getCell(grid, coordinates) {
    const { x, y } = coordinates;
    const cell = grid.querySelector(`.cell[data-cell-x="${x}"][data-cell-y="${y}"]`);
    if (cell === null) throw new Error('Cell not found');
    return cell;
  };

  let canUserMove = null;

  /* SELECTION MODE FUNCTIONS */

  const isCellAlreadyPlaced = function isCellAlreadyPlaced(coordinates, alreadyPlaced) {
    let placed = false;
    alreadyPlaced.forEach((ship) => {
      ship.forEach(({ x, y }) => {
        if (x === coordinates.x && y === coordinates.y) {
          placed = true;
        }
      });
    });
    return placed;
  };

  // returns the coordinates for the player's selection
  const getSelection = function getSelection(mouseLocation, orientation, length) {
    let changingAxis;
    let unchangingAxis;
    const coordinatesList = [];
    switch (orientation) {
      case 'up':
        changingAxis = 'y';
        unchangingAxis = 'x';
        break;
      case 'right':
        changingAxis = 'x';
        unchangingAxis = 'y';
        break;
      default:
    }
    for (let i = 0; i < length; i += 1) {
      const coordinates = {
        [changingAxis]: mouseLocation[changingAxis] + i,
        [unchangingAxis]: mouseLocation[unchangingAxis],
      };
      coordinatesList.push(coordinates);
    }
    return coordinatesList;
  };

  const renderCurrentSelection = function renderCurrentSelection(
    mouseLocation,
    orientation,
    length,
  ) {
    const coordinatesList = getSelection(mouseLocation, orientation, length);

    let isValidSelection = true;
    coordinatesList.forEach((coordinates) => {
      if (coordinates.x < 0 || coordinates.y < 0) {
        isValidSelection = false;
      }
      if (coordinates.x > 7 || coordinates.y > 7) {
        isValidSelection = false;
      }
      if (isCellAlreadyPlaced(coordinates, placedShips)) {
        isValidSelection = false;
      }
    });
    if (isValidSelection) {
      coordinatesList.forEach((coordinates) => {
        getCell(playerGrid, coordinates).classList.add('player-selection');
      });
    } else {
      getCell(playerGrid, mouseLocation).classList.add('invalid-placement');
    }
  };

  /* alters the playerGrid to show already placed ships */
  const renderPlacedShips = function renderInSelectMode(alreadyPlaced) {
    alreadyPlaced.forEach((ship) => {
      ship.forEach((coordinates) => {
        const cell = getCell(playerGrid, coordinates);
        cell.classList.add('already-placed');
      });
    });
  };

  const getCellCoordinates = function getCellCoordinates(cell) {
    const x = Number(cell.getAttribute('data-cell-x'));
    const y = Number(cell.getAttribute('data-cell-y'));
    const coordinates = {
      x,
      y,
    };
    return coordinates;
  };

  // adds ship to state
  const onClickOfCellDuringSelection = function onClickOfCellDuringSelection(event) {
    if (!isThereAnotherShip) {
      return;
    }
    const cell = event.target;
    const mouseLocation = getCellCoordinates(cell);
    const coordinatesList = getSelection(mouseLocation, selectionOrientation, selectionLength);
    let isValidSelection = true;
    coordinatesList.forEach((coordinates) => {
      if (coordinates.x < 0 || coordinates.y < 0) {
        isValidSelection = false;
      }
      if (coordinates.x > 7 || coordinates.y > 7) {
        isValidSelection = false;
      }
      if (isCellAlreadyPlaced(coordinates, placedShips)) {
        isValidSelection = false;
      }
    });
    if (isValidSelection) {
      placedShips.push(coordinatesList);
      renderPlacedShips(placedShips);
      shipsToPlace.nextShipLength();
    }
  };

  /* goes through all the cells in the player's grid to remove classes that indicate placed
  ships and selection */
  const removeAllSelectionClasses = function removeAllSelectionClasses() {
    playerGrid.querySelectorAll('.cell').forEach((cell) => {
      cell.classList.remove('player-selection');
      cell.classList.remove('invalid-placement');
    });
  };

  const onMouseEnterCellDuringSelection = function onMouseEnterCellDuringSelection(event) {
    if (!isThereAnotherShip) {
      return;
    }
    const cell = event.target;
    const coordinates = getCellCoordinates(cell);
    renderPlacedShips(placedShips);
    renderCurrentSelection(coordinates, selectionOrientation, selectionLength, placedShips);
  };

  const onMouseLeaveCellDuringSelection = function onMouseLeaveCellDuringSelection(event) {
    removeAllSelectionClasses();
  };

  // toggles orientation
  const onClickOfChangeOrientation = function onClickOfChangeOrientation() {
    if (selectionOrientation === 'up') {
      selectionOrientation = 'right';
    } else {
      selectionOrientation = 'up';
    }
  };

  const onClickOfResetDuringSelection = function onClickOfResetDuringSelection() {
    placedShips = [];
    playerGrid.querySelectorAll('.cell').forEach((cell) => {
      cell.classList.remove('already-placed');
    });
    shipsToPlace.reset();
  };

  const removePlayerSelectionEventListeners = function removePlayerSelectionEventListeners() {
    const cells = playerGrid.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.removeEventListener('mouseenter', onMouseEnterCellDuringSelection);
      cell.removeEventListener('mouseleave', onMouseLeaveCellDuringSelection);
      cell.removeEventListener('click', onClickOfCellDuringSelection);
    });
  };

  const onClickOfStartDuringSelection = function onClickOfStartDuringSelection() {
    if (isThereAnotherShip) {
      setInformation('All ships must be placed before the game can begin!');
      return;
    }
    removePlayerSelectionEventListeners();
    document.querySelector('.options').style.visibility = 'hidden';
    placedShips.forEach((placedShip) => {
      game.placeShip('user', placedShip);
    });
    startGame(); // eslint-disable-line
  };

  const setUpPlayerSelectionEventListeners = function setUpPlayerSelectionEventListeners() {
    const cells = playerGrid.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.addEventListener('mouseenter', onMouseEnterCellDuringSelection);
      cell.addEventListener('mouseleave', onMouseLeaveCellDuringSelection);
      cell.addEventListener('click', onClickOfCellDuringSelection);
    });
  };

  /* GAME MODE FUNCTIONS */
  const updateBoardForFiredUponCells = function updateBoardForFiredUponCells(playerName) {
    let hitCoordinates;
    let missedCoordinates;
    let grid;
    if (playerName === 'user') {
      ({ hitCoordinates, missedCoordinates } = game.getBoardState('user'));
      grid = playerGrid;
    } else if (playerName === 'computer') {
      ({ hitCoordinates, missedCoordinates } = game.getBoardState('computer'));
      grid = computerGrid;
    } else {
      throw new Error('Invalid playerName');
    }
    hitCoordinates.forEach((coordinates) => {
      getCell(grid, coordinates).classList.add('hit');
    });
    missedCoordinates.forEach((coordinates) => {
      getCell(grid, coordinates).classList.add('missed');
    });
  };

  const hasCellBeenFiredUpon = function hasCellBeenFiredUpon(coordinates) {
    const { hitCoordinates, missedCoordinates } = game.getBoardState('computer');
    let firedUpon = false;
    hitCoordinates.forEach(({ x, y }) => {
      if (x === coordinates.x && y === coordinates.y) {
        firedUpon = true;
      }
    });
    missedCoordinates.forEach(({ x, y }) => {
      if (x === coordinates.x && y === coordinates.y) {
        firedUpon = true;
      }
    });
    return firedUpon;
  };

  const onClickOfCellDuringGame = function onClickOnCellDuringGame(event) {
    if (!canUserMove) {
      return;
    }
    const cell = event.target;
    const coordinates = getCellCoordinates(cell);
    if (hasCellBeenFiredUpon(coordinates)) {
      return;
    }
    game.makeUserMove(coordinates);
    updateBoardForFiredUponCells('computer');
    canUserMove = false;
  };

  const onUserTurnBegins = function onUserTurnBegins() {
    canUserMove = true;
  };

  const onComputerTurnBegins = function onComputerTurnBegins() {
    game.makeComputerMove(Math.random);
    updateBoardForFiredUponCells('user');
  };

  const removeAllTargetingClasses = function removeAllTargetingClasses() {
    computerGrid.querySelectorAll('.cell').forEach((cell) => {
      cell.classList.remove('targeting');
      cell.classList.remove('invalid-targeting');
    });
  };

  const onMouseEnterComputerCellDuringGame = function onMouseEnterComputerCellDuringGame(event) {
    const cell = event.target;
    if (hasCellBeenFiredUpon(getCellCoordinates(cell))) {
      cell.classList.add('invalid-targeting');
    } else {
      cell.classList.add('targeting');
    }
  };

  const onMouseLeaveComputerCellDuringGame = function onMouseLeaveComputerCellDuringGame() {
    removeAllTargetingClasses();
  };

  const setUpGameModeEventListeners = function setUpGameModeEventListeners() {
    const cells = computerGrid.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.addEventListener('mouseenter', onMouseEnterComputerCellDuringGame);
      cell.addEventListener('mouseleave', onMouseLeaveComputerCellDuringGame);
      cell.addEventListener('click', onClickOfCellDuringGame);
    });

    events.on('USER_TURN_BEGINS', onUserTurnBegins);
    events.on('COMPUTER_TURN_BEGINS', onComputerTurnBegins);
    events.on('PLAYER_HAS_WON', onPlayerHasWon);  // eslint-disable-line
  };

  const removeGameModeEventListeners = function removeGameModeEventListeners() {
    const cells = computerGrid.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.removeEventListener('mouseenter', onMouseEnterComputerCellDuringGame);
      cell.removeEventListener('mouseleave', onMouseLeaveComputerCellDuringGame);
      cell.removeEventListener('click', onClickOfCellDuringGame); // eslint-disable-line
    });

    events.off('USER_TURN_BEGINS', onUserTurnBegins);
    events.off('COMPUTER_TURN_BEGINS', onComputerTurnBegins);
    events.off('PLAYER_HAS_WON', onPlayerHasWon); // eslint-disable-line
  };

  const onPlayerHasWon = function onPlayerHasWon(eventData) {
    const { winner } = eventData;
    let victorToDisplay;
    if (winner === 'user') {
      victorToDisplay = 'User';
    } else if (winner === 'computer') {
      victorToDisplay = 'Computer';
    } else {
      throw new Error('Unrecognized victor in event data');
    }
    setInformation(`${victorToDisplay} has won the game!`);
    removeGameModeEventListeners();
    removeAllTargetingClasses();
  };

  const startGame = function startGame() {
    game.generateAndPlaceComputerShips(Math.random);
    setUpGameModeEventListeners();
    game.start();
  };

  /* INITIALIZE */

  const initialize = function initialize() {
    setInformation('Place your ships!');
    for (let i = 7; i >= 0; i -= 1) {
      for (let j = 0; j < 8; j += 1) {
        const playerCell = document.createElement('div');
        playerCell.classList.add('cell');
        playerCell.setAttribute('data-cell-x', String(j));
        playerCell.setAttribute('data-cell-y', String(i));
        playerGrid.appendChild(playerCell);
        const computerCell = document.createElement('div');
        computerCell.classList.add('cell');
        computerCell.setAttribute('data-cell-x', String(j));
        computerCell.setAttribute('data-cell-y', String(i));
        computerGrid.appendChild(computerCell);
      }
    }
    document.querySelector('.change-orientation').addEventListener('click', onClickOfChangeOrientation);
    document.querySelector('.reset').addEventListener('click', onClickOfResetDuringSelection);
    document.querySelector('.start').addEventListener('click', onClickOfStartDuringSelection);
    shipsToPlace.nextShipLength();
    setUpPlayerSelectionEventListeners();
  };

  return {
    initialize,
    renderPlacedShips,
    renderCurrentSelection,
  };
}

export default createDOMController;
