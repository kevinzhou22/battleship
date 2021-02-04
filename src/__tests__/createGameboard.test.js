import createGameBoard from '../modules/createGameboard';

test('Calling createGameBoard with negative-value Number arguments results in an error', () => {
  expect(() => createGameBoard(-1, -1)).toThrow(Error);
});

test('Calling createGameBoard with zero-value Number arguments results in an error', () => {
  expect(() => createGameBoard(0, 0)).toThrow(Error);
});

test(`When receiveAttack is called on coordinates where a ship is placed,
  getHitCoordinates returns an array with those coordinates`, () => {
  const board = createGameBoard(10, 20);
  board.placeShip([{ x: 1, y: 4 }, { x: 1, y: 3 }]);
  board.receiveAttack({ x: 1, y: 3 });
  expect(board.getHitCoordinates()).toEqual([{ x: 1, y: 3 }]);
});

test(`When receiveAttack  is called on coordinates without a ship, 
  getHitCoordinates returns an empty array`, () => {
  const board = createGameBoard(25, 50);
  board.placeShip([{ x: 20, y: 4 }, { x: 21, y: 4 }]);
  board.receiveAttack({ x: 1, y: 3 });
  expect(board.getHitCoordinates()).toEqual([]);
});

test(`When receiveAttack is called on coordinates without a ship, 
  getMissedCoordinates returns an array with those coordinates`, () => {
  const board = createGameBoard(25, 50);
  board.placeShip([{ x: 20, y: 4 }, { x: 21, y: 4 }]);
  board.receiveAttack({ x: 1, y: 3 });
  expect(board.getMissedCoordinates()).toEqual([{ x: 1, y: 3 }]);
});

test('When all ships are sunk, areAllShipsSunk should return true', () => {
  const board = createGameBoard(25, 50);
  board.placeShip([{ x: 20, y: 4 }, { x: 21, y: 4 }]);
  board.receiveAttack({ x: 20, y: 4 });
  board.receiveAttack({ x: 21, y: 4 });
  expect(board.areAllShipsSunk()).toBe(true);
});

test('When all ships are not sunk, areAllShipsSunk should return false', () => {
  const board = createGameBoard(25, 50);
  board.placeShip([{ x: 20, y: 4 }, { x: 21, y: 4 }]);
  board.receiveAttack({ x: 20, y: 4 });
  expect(board.areAllShipsSunk()).toBe(false);
});

test('When passing coordinates that do not exist on the board, placeShip throws an error', () => {
  const board = createGameBoard(3, 3);
  expect(() => board.placeShip([{ x: 3, y: 3 }, { x: 2, y: 3 }])).toThrow(Error);
});

test('When passing coordinates that do not exist on the board, receiveAttack throws an error', () => {
  const board = createGameBoard(3, 3);
  expect(() => board.receiveAttack({ x: 3, y: 3 })).toThrow(Error);
});

test('When calling with coordinates already missed, receiveAttack throws an error', () => {
  const board = createGameBoard(3, 3);
  board.receiveAttack({ x: 2, y: 2 });
  expect(() => board.receiveAttack({ x: 2, y: 2 })).toThrow(Error);
});

test('When calling with coordinates already hit, receiveAttack throws an error', () => {
  const board = createGameBoard(3, 3);
  board.placeShip([{ x: 2, y: 2 }]);
  board.receiveAttack({ x: 2, y: 2 });
  expect(() => board.receiveAttack({ x: 2, y: 2 })).toThrow(Error);
});
