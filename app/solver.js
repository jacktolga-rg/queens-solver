export default class BoardSolver {
    #board;

    constructor(board) {
        this.#board = board;
    }

    solve() {
        for (let n = 1; n < this.#board.size; n++) {
            const indexGroups = this.generateIndexGroups(n);
            let numQueensPlaced = 0;
            while (numQueensPlaced < this.#board.size) {
                for (let indices of indexGroups) {
                    numQueensPlaced = this.placeQueens(numQueensPlaced);
                    if (this.#board.isSolved || this.#board.isUnsolvable)
                        return this.#board.clone();

                    this.setNoGosCoveringRegions();

                    numQueensPlaced = this.placeQueens(numQueensPlaced);
                    if (this.#board.isSolved || this.#board.isUnsolvable)
                        return this.#board.clone();
    
                    // Check row group
                    let containedRegions = this.getContainedRegions(indices, 0);
                    this.setNoGosByGroup(indices, containedRegions, 0);
                    numQueensPlaced = this.placeQueens(numQueensPlaced);
                    if (this.#board.isSolved || this.#board.isUnsolvable)
                        return this.#board.clone();
    
                    // Check column group
                    containedRegions = this.getContainedRegions(indices, 1);
                    this.setNoGosByGroup(indices, containedRegions, 1);
                }
            }
        }
        return this.#board.clone();
    }

    generateIndexGroups(n) {
        const groups = [];
        for (let i = 0; i <= this.#board.size - n; i++) {
            const indices = [];
            for (let j = i; j < i + n; j++) indices.push(j);
            groups.push(indices);
        }
        return groups;
    }

    getContainedRegions(indices, axis) {
        const squaresPerRegion = this.#board.regions.map(r => r.size - r.noGos.length);
        const rowsOrCols = axis === 0 ? this.#board.rows : this.#board.columns;
        let squaresInGroup;
        
        if (axis === -1) {
            squaresInGroup = indices.map(({ x, y }) => (
                this.#board.getSquare(x, y)
            ))
        }
        else {
            squaresInGroup = rowsOrCols.filter((_, i) => indices.includes(i))
            .flatMap(rc => rc.squares);
        }

        const containedSquaresPerRegion = squaresInGroup.reduce((accumulator, square) => {
            if (!square.isNoGo && !square.isQueen) {
                accumulator[square.region]++;
            }
            return accumulator;
        }, new Array(this.#board.size).fill(0));

        const fullyContainedRegions = containedSquaresPerRegion.map((n, i) => {
            return n === squaresPerRegion[i] && n !== 0 ? i : null
        }).filter(i => i !== null);
        
        const partiallyContainedRegions = containedSquaresPerRegion.map((n, i) => {
            return n < squaresPerRegion[i] && n !== 0 ? i : null
        }).filter(i => i !== null);

        return { full: fullyContainedRegions, partial: partiallyContainedRegions };
    }

    setNoGosByGroup(indices, containedRegions, axis) {
        if (containedRegions.full.length > indices.length) {
            for (let i of indices) {
                for (let j = 0; j < this.#board.size; j++) {
                    if (axis === 0) this.#board.setNoGo(i, j);
                    else if (axis === 1) this.#board.setNoGo(j, i);
                }
            }
        }
        else if (containedRegions.full.length === indices.length) {
            for (let i of indices) {
                for (let j = 0; j < this.#board.size; j++) {
                    if (axis === 0 && containedRegions.partial.includes(this.#board.getSquare(i, j).region)) {
                        this.#board.setNoGo(i, j);
                    }
                    else if (axis === 1 && containedRegions.partial.includes(this.#board.getSquare(j, i).region)) {
                        this.#board.setNoGo(j, i);
                    }
                }
            }
        }
        else if (containedRegions.full.length + containedRegions.partial.length === indices.length) {
            for (let i = 0; i < this.#board.size; i++) {
                if (indices.includes(i)) continue;
                for (let j = 0; j < this.#board.size; j++) {
                    if (axis === 0 && containedRegions.partial.includes(this.#board.getSquare(i, j).region)) {
                        this.#board.setNoGo(i, j);
                    }
                    else if (axis === 1 && containedRegions.partial.includes(this.#board.getSquare(j, i).region)) {
                        this.#board.setNoGo(j, i);
                    }
                }
            }
        }
    }

    setNoGosCoveringRegions() {
        for (let i = 0; i < this.#board.size; i++) {
            for (let j = 0; j < this.#board.size; j++) {
                const adjacentIndices = this.#board.getAdjacentIndices(i, j).filter(({ x, y }) => (
                    x >= 0 && x < this.#board.size && y >= 0 && y < this.#board.size
                ));
                const containedRegions = this.getContainedRegions(adjacentIndices, -1);
                if (containedRegions.full.length > 0) {
                    this.#board.setNoGo(i, j);
                }
            }
        }
    }

    placeQueens(numQueensPlaced) {
        const lastNumQueensPlaced = numQueensPlaced;
        for (let i = 0; i < this.#board.size; i++) {
            for (let j = 0; j < this.#board.size; j++) {
                const square = this.#board.getSquare(i, j);
                const region = this.#board.regions[square.region];
                if (!square.isNoGo && !square.isQueen && (
                    region.noGos.length === region.size - 1
                    || this.#board.rows[i].noGos.length === this.#board.size - 1
                    || this.#board.columns[j].noGos.length === this.#board.size - 1
                )) {
                    this.#board.setQueen(i, j);
                    numQueensPlaced++;
                }
            }
        }

        if (numQueensPlaced > lastNumQueensPlaced) {
            numQueensPlaced = this.placeQueens(numQueensPlaced);
        }
        return numQueensPlaced;
    }
}