import createGame from '../modules/createGame';

const events = {
  eventsList: [],
  emit: jest.fn(),
  on: jest.fn(),
};
let game = createGame(events);

beforeEach(() => {
  jest.resetAllMocks();
  game = createGame(events);
});

afterEach(() => {
  jest.resetModules();
});

test(`After placing a ship for the user, getBoardState('user') returns an object with
  a property placedShips that contains the coordinates of the ship`, () => {
  game.placeShip('user', [{ x: 0, y: 2 }]);
  const { placedShips } = game.getBoardState('user');
  expect(placedShips).toEqual([[{ x: 0, y: 2 }]]);
});

test(`When a ship is placed for both players and startGame is called, an event is fired
  indicating that it is the user's turn with eventData null`, () => {
  game.placeShip('user', [{ x: 0, y: 2 }]);
  game.placeShip('computer', [{ x: 0, y: 2 }]);
  game.start();
  expect(events.emit).toHaveBeenCalledWith('USER_TURN_BEGINS', null);
});

test(`After a ship is placed for both players, start is called, and makeUserMove is called
with the coordinates of a computer's ship, getBoardState('computer') returns
an object with property hitCoordinates that contains the coordinates passed
to makeUserMove`, () => {
  game.placeShip('user', [{ x: 0, y: 2 }]);
  game.placeShip('computer', [{ x: 0, y: 2 }, { x: 1, y: 2 }]);
  game.start();
  game.makeUserMove({ x: 0, y: 2 });
  const { hitCoordinates } = game.getBoardState('computer');
  expect(hitCoordinates).toContainEqual({ x: 0, y: 2 });
});

test(`After a ship is placed for both players, startGame is called, calling makeuserMove
  twice (the second asynchronously) throws an error`, () => {
  game.placeShip('user', [{ x: 0, y: 2 }]);
  game.placeShip('computer', [{ x: 0, y: 2 }]);
  game.start();
  game.makeUserMove({ x: 0, y: 1 });
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(() => game.makeUserMove({ x: 1, y: 2 })).toThrow(Error);
      resolve();
    }, 0);
  });
});

test(`When a ship is placed for both players, start is called, and makeUserMove is called,
 the second event fired (which is supposed to be asynchronous) indicates that it is the computer's
 turn with eventData null`, () => {
  game.placeShip('user', [{ x: 0, y: 2 }]);
  game.placeShip('computer', [{ x: 0, y: 2 }]);
  game.start();
  game.makeUserMove({ x: 0, y: 0 });
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(events.emit.mock.calls[1]).toEqual(['COMPUTER_TURN_BEGINS', null]);
      resolve();
    }, 0);
  });
});

// relies on knowledge of implementation, which indicates better tests may be necessary
test(`After calling start, makeUserMove, and then once the computer's turn begins makeComputerMove(random),
  where random is a function that returns 0, given that a ship was not placed at the origin
  for the user, getBoardState('user') should return an object whose property missedCoordinates
  contains the origin`, () => {
  const random = jest.fn();
  random.mockReturnValue(0);
  game.placeShip('user', [{ x: 0, y: 2 }]);
  game.placeShip('computer', [{ x: 0, y: 2 }]);
  game.start();
  game.makeUserMove({ x: 0, y: 1 });
  return new Promise((resolve) => {
    setTimeout(() => {
      game.makeComputerMove(random);
      const { missedCoordinates } = game.getBoardState('user');
      expect(missedCoordinates).toContainEqual({ x: 0, y: 0 });
      resolve();
    }, 0);
  });
});

test(`When the computer's only ship is sunk, the second event emitted declares that
 someone has won with eventData indicating the victo to be the user`, () => {
  game.placeShip('user', [{ x: 0, y: 2 }]);
  game.placeShip('computer', [{ x: 0, y: 2 }]);
  game.start();
  game.makeUserMove({ x: 0, y: 2 });
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(events.emit.mock.calls[1]).toEqual(['PLAYER_HAS_WON', { winner: 'user' }]);
      resolve();
    }, 0);
  });
});

// relies on knowledge of implementation, which indicates better tests may be necessary
test(`When the user's only ship is sunk on the second turn, the third event emitted declares that
 someone has won with eventData indicating the victo to be the computer`, () => {
  const random = jest.fn();
  random.mockReturnValue(0);
  game.placeShip('user', [{ x: 0, y: 0 }]);
  game.placeShip('computer', [{ x: 0, y: 2 }]);
  game.start();
  game.makeUserMove({ x: 0, y: 1 });
  return new Promise((resolve) => {
    setTimeout(() => {
      game.makeComputerMove(random);
      setTimeout(() => {
        expect(events.emit.mock.calls[2]).toEqual(['PLAYER_HAS_WON', { winner: 'computer' }]);
        resolve();
      }, 0);
    }, 0);
  });
});

test(`After the user has won and calling resetGame, getBoardState('user') shows no placed
  ships`, () => {
  game.placeShip('user', [{ x: 0, y: 2 }]);
  game.placeShip('computer', [{ x: 0, y: 2 }]);
  game.start();
  game.makeUserMove({ x: 0, y: 2 });
  return new Promise((resolve) => {
    setTimeout(() => {
      game.resetGame();
      const { placedShips } = game.getBoardState('user');
      expect(placedShips).toEqual([]);
      resolve();
    }, 0);
  });
});

test(`Calling generateShipCoordinates('up', {x: 0, y: 0}, 3) generates
  an array of three continous coordinates that begin at the origin and go up`, () => {
  expect(game.generateShipCoordinates('up', { x: 0, y: 0 }, 3)).toEqual([{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }]);
});

// relies on implementation
test(`When passed argument random, a function that returns a value close to 1, generateRandomShipCoordinates(random,, 'user', 5)
  should return an array with coordinates representing a vertical ship of length 5 at the far edge of the board`, () => {
  const random = jest.fn();
  random.mockReturnValue(0.99999);
  const coordinates = game.generateRandomShipCoordinates(random, 'user', 5);
  expect(coordinates).toContainEqual({ x: 7, y: 7 });
  expect(coordinates).toContainEqual({ x: 7, y: 6 });
  expect(coordinates).toContainEqual({ x: 7, y: 5 });
  expect(coordinates).toContainEqual({ x: 7, y: 4 });
  expect(coordinates).toContainEqual({ x: 7, y: 3 });
  expect(coordinates.length).toBe(5);
});

// relies on implementation
test(`When passed argument random, a function that always returns 0, generateRandomShipCoordinates(random, 'user', 5)
  should return an array with coordinates representing a horizontal ship of length 5 starting from the origin`, () => {
  const random = jest.fn();
  random.mockReturnValue(0);
  const coordinates = game.generateRandomShipCoordinates(random, 'user', 5);
  expect(coordinates).toContainEqual({ x: 0, y: 0 });
  expect(coordinates).toContainEqual({ x: 1, y: 0 });
  expect(coordinates).toContainEqual({ x: 2, y: 0 });
  expect(coordinates).toContainEqual({ x: 3, y: 0 });
  expect(coordinates).toContainEqual({ x: 4, y: 0 });
  expect(coordinates.length).toBe(5);
});

test(`When passed argument random, a function that returns 0 ten times and 1 after that and after having placed a ship at
  the origin for the origin, generateRandomShipCoordinates(random, 'user', 5) should return an array
  without the origin`, () => {
  const random = jest.fn();
  for (let i = 0; i < 10; i += 1) {
    random.mockReturnValueOnce(0);
  }
  random.mockReturnValue(1);
  game.placeShip('user', [{ x: 0, y: 0 }]);
  const coordinates = game.generateRandomShipCoordinates(random, 'user', 5);
  expect(coordinates).not.toContainEqual({ x: 0, y: 0 });
});
