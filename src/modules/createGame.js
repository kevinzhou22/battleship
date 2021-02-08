import createGameBoard from './createGameboard';
import createPlayer from './createPlayer';

const createGame = function createGame(events) {
  const eventsEmitted = {
    USER_TURN_BEGINS: 'USER_TURN_BEGINS',
    COMPUTER_TURN_BEGINS: 'COMPUTER_TURN_BEGINS',
    PLAYER_HAS_WON: 'PLAYER_HAS_WON',
  };

  // initialization
  const xLength = 8;
  const yLength = 8;

  const userPlayer = createPlayer('user');
  const computerPlayer = createPlayer('computer');

  let currentPlayer = null;

  let userBoard = createGameBoard(xLength, yLength);
  let computerBoard = createGameBoard(xLength, yLength);

  /* used to resolve the returned promises in awaitUserMove and
  awaitComputerMove  */
  let awaitCallback = null;

  const getCorrespondingBoard = function getCorrespondingBoard(playerName) {
    if (playerName === 'user') return userBoard;
    if (playerName === 'computer') return computerBoard;
    throw new Error('Player does not exist');
  };

  const placeShip = function placeShip(playerName, coordinatesList) {
    const board = getCorrespondingBoard(playerName);
    board.placeShip(coordinatesList);
  };

  const getBoardState = function getBoardState(playerName) {
    const board = getCorrespondingBoard(playerName);
    const placedShips = board.getPlacedShips();
    const hitCoordinates = board.getHitCoordinates();
    const missedCoordinates = board.getMissedCoordinates();
    return {
      placedShips,
      hitCoordinates,
      missedCoordinates,
      xLength,
      yLength,
    };
  };

  /* returns a promise that is resolved with the coordinates of the
  user's move */
  const awaitUserMove = function awaitUserMove() {
    events.emit(eventsEmitted.USER_TURN_BEGINS, null);
    currentPlayer = userPlayer;
    return new Promise((resolve) => {
      awaitCallback = resolve;
    });
  };

  const awaitComputerMove = function awaitComputerMove() {
    events.emit(eventsEmitted.COMPUTER_TURN_BEGINS, null);
    currentPlayer = computerPlayer;
    return new Promise((resolve) => {
      awaitCallback = resolve;
    });
  };

  const makeUserMove = function makeUserMove(coordinates) {
    if (!(currentPlayer === userPlayer)) {
      throw new Error('Not User Turn');
    }
    userPlayer.makeMove(computerBoard, coordinates);
    awaitCallback();
  };

  const makeComputerMove = function makeComputerMove(randomFn) {
    if (!(currentPlayer === computerPlayer)) {
      throw new Error('Not Computer Turn');
    }
    computerPlayer.autoMakeMove(userBoard, randomFn);
    awaitCallback();
  };

  const hasPlayerWon = function hasPlayerWon(playerName) {
    let board;
    if (playerName === 'user') {
      board = computerBoard;
    }
    if (playerName === 'computer') {
      board = userBoard;
    }
    if (board.areAllShipsSunk()) {
      return true;
    }
    return false;
  };

  const declareWinner = function declareWinner(playerName) {
    events.emit(
      eventsEmitted.PLAYER_HAS_WON,
      { winner: playerName },
    );
  };

  const start = async function start() {
    /* eslint-disable no-await-in-loop */
    while (true) {
      currentPlayer = userPlayer;
      await awaitUserMove();
      if (hasPlayerWon('user')) {
        declareWinner('user');
        currentPlayer = null;
        break;
      }
      currentPlayer = computerPlayer;
      await awaitComputerMove();
      if (hasPlayerWon('computer')) {
        declareWinner('computer');
        currentPlayer = null;
        break;
      }
    }
  };

  const resetGame = function resetGame() {
    userBoard = createGameBoard(xLength, yLength);
    computerBoard = createGameBoard(xLength, yLength);
  };

  const generateShipCoordinates = function generateShipCoordinates(orientation, origin, length) {
    const coordinatesList = [];
    coordinatesList.push({ ...origin });
    let constantVariable;
    let changingVariable;
    if (orientation === 'up') {
      constantVariable = 'x';
      changingVariable = 'y';
    } else if (orientation === 'right') {
      constantVariable = 'y';
      changingVariable = 'x';
    } else {
      throw new RangeError('Invalid orientation');
    }
    for (let i = 1; i < length; i += 1) {
      const newCoordinates = {
        [constantVariable]: origin[constantVariable],
        [changingVariable]: (origin[changingVariable] + i),
      };
      coordinatesList.push(newCoordinates);
    }
    return coordinatesList;
  };
  const generateRandomShipCoordinates = function generateRandomShipCoordinates(
    randomFn,
    playerName,
    length,
  ) {
    let orientation;
    let permittedXLengthForOrigin;
    let permittedYLengthForOrigin;
    const orientationNumber = Math.floor(randomFn() * 2);
    switch (orientationNumber) {
      case 0:
        orientation = 'right';
        permittedXLengthForOrigin = xLength - length + 1;
        permittedYLengthForOrigin = yLength;
        break;
      case 1:
        orientation = 'up';
        permittedXLengthForOrigin = xLength;
        permittedYLengthForOrigin = yLength - length + 1;
        break;
      default:
    }
    const origin = {
      x: Math.floor(randomFn() * permittedXLengthForOrigin),
      y: Math.floor(randomFn() * permittedYLengthForOrigin),
    };
    const ship = generateShipCoordinates(orientation, origin, length);

    const board = getCorrespondingBoard(playerName);

    if (board.areCoordinatesValidForShip(ship)) {
      return ship;
    }
    // try again at generating a new ship if the generated coordinates are not valid
    return generateRandomShipCoordinates(randomFn, playerName, length);
  };

  return {
    placeShip,
    getBoardState,
    start,
    makeUserMove,
    makeComputerMove,
    resetGame,
    generateShipCoordinates,
    generateRandomShipCoordinates,
  };
};

export default createGame;
