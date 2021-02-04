import createShip from '../modules/createShip';

test('isSunk returns true when all positions are hit', () => {
  const ship = createShip(5);
  ship.hit(0);
  ship.hit(1);
  ship.hit(2);
  ship.hit(3);
  ship.hit(4);
  expect(ship.isSunk()).toBe(true);
});

test('isSunk returns false when not all positions are hit', () => {
  const ship = createShip(10);
  ship.hit(5);
  expect(ship.isSunk()).toBe(false);
});

describe('Error is thrown when a Ship is created or its methods are called with invalid arguments', () => {
  test('Error when hit is called with a position beyond that of the length passed in createShip', () => {
    const ship = createShip(5);
    expect(() => ship.hit(200)).toThrow(Error);
  });

  test('Error when createShip is called with a 0 length', () => {
    expect(() => {
      createShip(0);
    }).toThrow(Error);
  });

  test('Error when createShip is called with a negative length', () => {
    expect(() => {
      createShip(-5);
    }).toThrow(Error);
  });

  test('Error when createShip is called with a null length', () => {
    expect(() => {
      createShip(null);
    }).toThrow(Error);
  });
});
