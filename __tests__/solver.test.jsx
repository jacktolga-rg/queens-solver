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