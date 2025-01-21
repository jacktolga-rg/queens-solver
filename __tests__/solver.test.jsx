import { expect, test } from 'vitest'
import Solver from '../app/solver'
import BoardModel from '../app/board';

test('GetContainedRegions', () => {
    const size = 4;
    let board = new BoardModel(size);
    const updates = [
        {x: 0, y: 0, region: 0},
        {x: 0, y: 1, region: 1},
        {x: 0, y: 2, region: 3},
        {x: 0, y: 3, region: 3},
        {x: 1, y: 0, region: 0},
        {x: 1, y: 1, region: 1},
        {x: 1, y: 2, region: 3},
        {x: 1, y: 3, region: 3},
        {x: 2, y: 0, region: 1},
        {x: 2, y: 1, region: 1},
        {x: 2, y: 2, region: 2},
        {x: 2, y: 3, region: 2},
        {x: 3, y: 0, region: 1},
        {x: 3, y: 1, region: 2},
        {x: 3, y: 2, region: 2},
        {x: 3, y: 3, region: 2},
      ];
      for (let { x, y, region } of updates) board = board.setRegion(x, y, region);
      let solver = new Solver(board);
      expect(solver.getContainedRegions([0, 1], 1)).toEqual({ full: [0, 1], partial: [2] });
      expect(solver.getContainedRegions([1, 2], 1)).toEqual({ full: [], partial: [1, 2, 3] });
      expect(solver.getContainedRegions([2, 3], 1)).toEqual({ full: [3], partial: [2] });
      expect(solver.getContainedRegions([0, 1], 0)).toEqual({ full: [0, 3], partial: [1] });

      // Now with no-go squares
      board.setNoGo(3, 1);
      solver = new Solver(board);
      expect(solver.getContainedRegions([2, 3], 1)).toEqual({ full: [2, 3], partial: [] });

      // Check that region with all no-go squares is not included
      board.setNoGo(0, 0);
      board.setNoGo(1, 0);
      solver = new Solver(board);
      expect(solver.getContainedRegions([0, 1, 2], 1)).toEqual({ full: [1], partial: [2, 3] })
})

test('SetNoGosByRegion', () => {
  const size = 4;
  const groups = [
    { indices: [0], containedRegions: { full: [0], partial: [1] }, axis: 1 },
    { indices: [0, 1], containedRegions: { full: [0, 3], partial: [1] }, axis: 0 },
    { indices: [2, 3], containedRegions: { full: [3], partial: [2] }, axis: 1 },
  ]
  const expectations = [
      { x: 0, y: 0, region: 0, noGos: [false, false, false] },
      { x: 0, y: 1, region: 1, noGos: [false, true, true] },
      { x: 0, y: 2, region: 3, noGos: [false, false, false] },
      { x: 0, y: 3, region: 3, noGos: [false, false, false] },
      { x: 1, y: 0, region: 0, noGos: [false, false, false] },
      { x: 1, y: 1, region: 1, noGos: [false, true, true] },
      { x: 1, y: 2, region: 3, noGos: [false, false, false] },
      { x: 1, y: 3, region: 3, noGos: [false, false, false] },
      { x: 2, y: 0, region: 1, noGos: [true, true, true] },
      { x: 2, y: 1, region: 1, noGos: [false, false, false] },
      { x: 2, y: 2, region: 2, noGos: [false, false, false] },
      { x: 2, y: 3, region: 2, noGos: [false, false, false] },
      { x: 3, y: 0, region: 1, noGos: [true, true, true] },
      { x: 3, y: 1, region: 2, noGos: [false, false, true] },
      { x: 3, y: 2, region: 2, noGos: [false, false, false] },
      { x: 3, y: 3, region: 2, noGos: [false, false, false] },
    ];
    let board = new BoardModel(size);
    for (let { x, y, region, _ } of expectations) board = board.setRegion(x, y, region);
    let solver = new Solver(board);
    
    groups.forEach(({ indices, containedRegions, axis}, i) => {
      solver.setNoGosByGroup(indices, containedRegions, axis);
      for (let { x, y, _, noGos } of expectations) {
        expect(board.getSquare(x, y).isNoGo).toBe(noGos[i]);
      }
    })
})

test('SetNoGosCoveringRegions', () => {
  const size = 4;
  const expectations = [
      { x: 0, y: 0, region: 0, noGos: [false, false] },
      { x: 0, y: 1, region: 1, noGos: [true, true] },
      { x: 0, y: 2, region: 3, noGos: [false, false] },
      { x: 0, y: 3, region: 3, noGos: [false, false] },
      { x: 1, y: 0, region: 0, noGos: [false, false] },
      { x: 1, y: 1, region: 1, noGos: [true, true] },
      { x: 1, y: 2, region: 3, noGos: [false, true] },
      { x: 1, y: 3, region: 3, noGos: [false, true] },
      { x: 2, y: 0, region: 1, noGos: [false, false] },
      { x: 2, y: 1, region: 1, noGos: [false, false] },
      { x: 2, y: 2, region: 2, noGos: [false, false] },
      { x: 2, y: 3, region: 2, noGos: [false, false] },
      { x: 3, y: 0, region: 1, noGos: [false, false] },
      { x: 3, y: 1, region: 1, noGos: [false, false] },
      { x: 3, y: 2, region: 2, noGos: [false, true] },
      { x: 3, y: 3, region: 2, noGos: [false, true] },
    ];
    let board = new BoardModel(size);
    for (let { x, y, region, _ } of expectations) board = board.setRegion(x, y, region);
    let solver = new Solver(board);
    
    solver.setNoGosCoveringRegions();
    for (let { x, y, _, noGos } of expectations) {
      expect(board.getSquare(x, y).isNoGo).toBe(noGos[0]);
    }

    board.setNoGo(3, 2);
    board.setNoGo(3, 3);
    solver.setNoGosCoveringRegions();
    for (let { x, y, _, noGos } of expectations) {
      expect(board.getSquare(x, y).isNoGo).toBe(noGos[1]);
    }
})

test('PlaceQueens', () => {
  const size = 5;
  const expectations = [
    { x: 0, y: 0, region: 0, isQueen: true, isNoGo: false },
    { x: 0, y: 1, region: 2, isQueen: false, isNoGo: true },
    { x: 0, y: 2, region: 2, isQueen: false, isNoGo: true },
    { x: 0, y: 3, region: 2, isQueen: false, isNoGo: true },
    { x: 0, y: 4, region: 4, isQueen: false, isNoGo: true },
    { x: 1, y: 0, region: 1, isQueen: false, isNoGo: true },
    { x: 1, y: 1, region: 2, isQueen: false, isNoGo: true },
    { x: 1, y: 2, region: 2, isQueen: false, isNoGo: false },
    { x: 1, y: 3, region: 2, isQueen: false, isNoGo: false },
    { x: 1, y: 4, region: 4, isQueen: false, isNoGo: false },
    { x: 2, y: 0, region: 1, isQueen: false, isNoGo: true },
    { x: 2, y: 1, region: 2, isQueen: false, isNoGo: true },
    { x: 2, y: 2, region: 2, isQueen: false, isNoGo: false },
    { x: 2, y: 3, region: 2, isQueen: false, isNoGo: false },
    { x: 2, y: 4, region: 4, isQueen: false, isNoGo: false },
    { x: 3, y: 0, region: 1, isQueen: false, isNoGo: true },
    { x: 3, y: 1, region: 2, isQueen: false, isNoGo: true },
    { x: 3, y: 2, region: 3, isQueen: false, isNoGo: true },
    { x: 3, y: 3, region: 4, isQueen: false, isNoGo: false },
    { x: 3, y: 4, region: 4, isQueen: false, isNoGo: false },
    { x: 4, y: 0, region: 1, isQueen: false, isNoGo: true },
    { x: 4, y: 1, region: 1, isQueen: true, isNoGo: false },
    { x: 4, y: 2, region: 3, isQueen: false, isNoGo: true },
    { x: 4, y: 3, region: 3, isQueen: false, isNoGo: true },
    { x: 4, y: 4, region: 3, isQueen: false, isNoGo: true },
  ];
  let board = new BoardModel(size);
  for (let { x, y, region, _, __ } of expectations) board = board.setRegion(x, y, region);
  let solver = new Solver(board);

  solver.placeQueens(0);

  for (let { x, y, _, isQueen, isNoGo } of expectations) {
    expect(board.getSquare(x, y).isQueen).toBe(isQueen);
    expect(board.getSquare(x, y).isNoGo).toBe(isNoGo);
  }
})