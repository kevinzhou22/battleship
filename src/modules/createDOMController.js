function createDOMController() {
  const playerGrid = document.querySelector('.player-section-wrapper .grid');
  const computerGrid = document.querySelector('.computer-section-wrapper .grid');

  // state
  let placedShips = [];
  let selectionLength = 5;
  let selectionOrientation = 'up';

  const getCell = function getCell(grid, coordinates) {
    const { x, y } = coordinates;
    const cell = grid.querySelector(`.cell[data-cell-x="${x}"][data-cell-y="${y}"]`)
    if (cell === null) throw new Error('Cell not found');
    return cell;
  };

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

  /* Event Handlers */

  // adds ship to state
  const onClickOfCellDuringSelection = function onClickOfCellDuringSelection(event) {
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
  };

  const setUpPlayerSelectionEventListeners = function setUpPlayerSelectionEventListeners() {
    const cells = playerGrid.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.addEventListener('mouseenter', onMouseEnterCellDuringSelection);
      cell.addEventListener('mouseleave', onMouseLeaveCellDuringSelection);
      cell.addEventListener('click', onClickOfCellDuringSelection);
    });
    document.querySelector('.change-orientation').addEventListener('click', onClickOfChangeOrientation);
    document.querySelector('.reset').addEventListener('click', onClickOfResetDuringSelection);
  };

  const initialize = function initialize() {
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
    setUpPlayerSelectionEventListeners();
  };

  return {
    initialize,
    renderPlacedShips,
    renderCurrentSelection,
  };
}

export default createDOMController;
