const createPlayer = function createPlayer(name) {
  const makeMove = function makeMove(gameBoard, coordinates) {
    gameBoard.receiveAttack(coordinates);
  };

  const getName = function getName() {
    return name;
  };

  const areCoordinatesAlreadyAttacked = function areCoordinatesAlreadyAttacked(
    gameBoard,
    coordinates,
  ) {
    let alreadyAttacked = false;
    const hitCoordinates = gameBoard.getHitCoordinates();
    hitCoordinates.forEach(({ x, y }) => {
      if (x === coordinates.x && y === coordinates.y) {
        alreadyAttacked = true;
      }
    });
    const missedCoordinates = gameBoard.getMissedCoordinates();
    missedCoordinates.forEach(({ x, y }) => {
      if (x === coordinates.x && y === coordinates.y) {
        alreadyAttacked = true;
      }
    });
    return alreadyAttacked;
  };

  const autoMakeMove = function autoMakeMove(gameBoard, randomFn) {
    let xValue;
    let yValue;
    do {
      xValue = Math.floor(gameBoard.getXLength() * randomFn());
      yValue = Math.floor(gameBoard.getYLength() * randomFn());
    } while (areCoordinatesAlreadyAttacked(gameBoard, { x: xValue, y: yValue }));

    gameBoard.receiveAttack({ x: xValue, y: yValue });
  };

  return {
    makeMove,
    getName,
    autoMakeMove,
  };
};

export default createPlayer;
