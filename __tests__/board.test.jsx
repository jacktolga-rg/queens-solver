import { expect, test } from 'vitest'
import BoardModel from '../app/board'
 
test('BoardIsFullyDefined', () => {
  let board = new BoardModel(3);
  const updates = [
    {x: 0, y: 0, region: 0},
    {x: 0, y: 1, region: 0},
    {x: 0, y: 2, region: 0},
    {x: 1, y: 0, region: 1},
    {x: 1, y: 1, region: 1},
    {x: 1, y: 2, region: 1},
    {x: 2, y: 0, region: 1},
    {x: 2, y: 1, region: 1}
  ]
  for (let { x, y, region } of updates) board = board.setRegion(x, y, region);
  expect(board.isFullyDefined).toBe(false);
  board = board.setRegion(2, 2, 1);
  expect(board.isFullyDefined).toBe(false);
  board = board.setRegion(2, 2, 2);
  expect(board.isFullyDefined).toBe(true);
})

test('BoardUpdateWhenQueenPlaced', () => {
  const size = 4;
  let board = new BoardModel(size);
  const queenIndex = [1, 1];
  const expectedNoGos = [
    [true, true, true, false],
    [true, false, true, true],
    [true, true, true, true],
    [false, true, false, false]
  ];
  const updates = [
    {x: 0, y: 0, region: 0},
    {x: 0, y: 1, region: 0},
    {x: 0, y: 2, region: 0},
    {x: 0, y: 3, region: 0},
    {x: 1, y: 0, region: 1},
    {x: 1, y: 1, region: 1},
    {x: 1, y: 2, region: 1},
    {x: 1, y: 3, region: 1},
    {x: 2, y: 0, region: 2},
    {x: 2, y: 1, region: 2},
    {x: 2, y: 2, region: 2},
    {x: 2, y: 3, region: 1},
    {x: 3, y: 0, region: 2},
    {x: 3, y: 1, region: 3},
    {x: 3, y: 2, region: 3},
    {x: 3, y: 3, region: 3},
  ];
  for (let { x, y, region } of updates) board = board.setRegion(x, y, region);
  board = board.setQueen(...queenIndex);
  expect(board.getSquare(...queenIndex).isQueen).toBe(true);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      expect(board.getSquare(i, j).isNoGo).toBe(expectedNoGos[i][j]);
    }
  }
})