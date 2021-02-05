import createPlayer from '../modules/createPlayer';

const gameboard = {
  getXLength: jest.fn(),
  getYLength: jest.fn(),
  receiveAttack: jest.fn(),
  getHitCoordinates: jest.fn(),
  getMissedCoordinates: jest.fn(),
};

afterEach(() => {
  gameboard.getXLength.mockReset();
  gameboard.getYLength.mockReset();
  gameboard.receiveAttack.mockReset();
  gameboard.getHitCoordinates.mockReset();
  gameboard.getMissedCoordinates.mockReset();
});

test('makeMove calls receiveAttack of passed gameboard with the same coordinates as makeMove was called with', () => {
  const player = createPlayer('player');
  player.makeMove(gameboard, { x: 1, y: 2 });
  expect(gameboard.receiveAttack).toHaveBeenCalledWith({ x: 1, y: 2 });
});

test(`autoMakeMove calls receiveAttack of the passed gameboard with the farthest coordinates from origin when
  random returns a value close to 1 and receiveAttack has not been called before`, () => {
  gameboard.getXLength.mockReturnValue(10);
  gameboard.getYLength.mockReturnValue(20);
  gameboard.getHitCoordinates.mockReturnValue([]);
  gameboard.getMissedCoordinates.mockReturnValue([]);
  const random = jest.fn();
  random.mockReturnValue(0.99999);
  const player = createPlayer('computer');
  player.autoMakeMove(gameboard, random);
  expect(gameboard.receiveAttack).toHaveBeenCalledWith({ x: 9, y: 19 });
});

test(`autoMakeMove calls receiveAttack of the passed gameboard with the origin when
  random returns 0 and receiveAttack has not been called before`, () => {
  gameboard.getXLength.mockReturnValue(10);
  gameboard.getYLength.mockReturnValue(20);
  gameboard.getHitCoordinates.mockReturnValue([]);
  gameboard.getMissedCoordinates.mockReturnValue([]);
  const random = jest.fn();
  random.mockReturnValue(0);
  const player = createPlayer('computer');
  player.autoMakeMove(gameboard, random);
  expect(gameboard.receiveAttack).toHaveBeenCalledWith({ x: 0, y: 0 });
});

test(`autoMakeMove will call random of the passed gameboard four times
  when getMissedCoordinates of the gameboard returns the origin and the
  first two calls to random return 0 but not the third or fourth calls`, () => {
  gameboard.getXLength.mockReturnValue(10);
  gameboard.getYLength.mockReturnValue(20);
  gameboard.getHitCoordinates.mockReturnValue([]);
  gameboard.getMissedCoordinates.mockReturnValue([{ x: 0, y: 0 }]);
  const random = jest.fn();
  random.mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValue(0.5);
  const player = createPlayer('computer');
  player.autoMakeMove(gameboard, random);
  expect(random.mock.calls.length).toBe(4);
});

test(`autoMakeMove will receiveAttack with coordinates that are not the origin
  when getHitCoordinates of the gameboard returns the origin and the
  first two call to random return 0 but not the third or fourth calls`, () => {
  gameboard.getXLength.mockReturnValue(10);
  gameboard.getYLength.mockReturnValue(20);
  gameboard.getHitCoordinates.mockReturnValue([{ x: 0, y: 0 }]);
  gameboard.getMissedCoordinates.mockReturnValue([]);
  const random = jest.fn();
  random.mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValue(0.2);
  const player = createPlayer('computer');
  player.autoMakeMove(gameboard, random);
  expect(gameboard.receiveAttack).not.toHaveBeenCalledWith({ x: 0, y: 0 });
});
