export default class BoardSolver {
    #board;

    constructor(board) {
        this.#board = board;
    }

    solve() {
        for (let n = 1; n < this.#board.size; n++) {
            const indexGroups = this.generateIndexGroups(n);
            let numQueensPlaced = 1;
            while (numQueensPlaced > 0) {
                for (let indices of indexGroups) {
                    numQueensPlaced = this.placeQueens();
                    if (this.#board.isSolved || this.#board.isUnsolvable)
                        return this.#board.clone();

                    this.setNoGosCoveringRegions();

                    numQueensPlaced += this.placeQueens();
                    if (this.#board.isSolved || this.#board.isUnsolvable)
                        return this.#board.clone();
    
                    // Check row group
                    let containedRegions = this.getContainedRegions(indices, 0);
                    this.setNoGosByGroup(indices, containedRegions, 0);
                    numQueensPlaced += this.placeQueens();
                    if (this.#board.isSolved || this.#board.isUnsolvable)
                        return this.#board.clone();
    
                    // Check column group
                    containedRegions = this.getContainedRegions(indices, 1);
                    this.setNoGosByGroup(indices, containedRegions, 1);
                }
            }
        }
        this.placeQueens();
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
        
        const squaresInGroup = rowsOrCols.filter((_, i) => indices.includes(i))
            .flatMap(rc => rc.squares);

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
        // if (containedRegions.length > indices.length) return;
        // if (containedRegions.length === indices.length) {
        //     for (let i = 0; i < this.#board.size; i++) {
        //         if (axis === 0 && !indices.includes(i)) continue;
        //         for (let j = 0; j < this.#board.size; j++) {
        //             if (axis === 1 && !indices.includes(j)) continue;
        //             if (!containedRegions.includes(this.#board.getSquare(i, j).region))
        //                 this.#board.setNoGo(i, j);
        //         }
        //     }
        // }

        
    }

    setNoGosCoveringRegions() {
        for (let i = 0; i < this.#board.size; i++) {
            for (let j = 0; j < this.#board.size; j++) {
                const regionsAreContained = new Array(this.#board.size).fill(true);
                const adjacentIndices1d = [];
                for (let x = i - 1; x <= i + 1; x++) {
                    for (let y = j - 1; y <= j + 1; y++) {
                        if (x >= 0 && x < this.#board.size && y >= 0 && y < this.#board.size)
                            adjacentIndices1d.push(x * this.#board.size + y);
                    }
                }
                for (let x = 0; x < this.#board.size; x++) {
                    for (let y = 0; y < this.#board.size; y++) {
                        if (adjacentIndices1d.includes(x * this.#board.size + y)) continue;
                        let square = this.#board.getSquare(x, y);
                        if (!square.isNoGo)
                            regionsAreContained[square.region] = false;
                    }
                }
                if (regionsAreContained.includes(true))
                    this.#board.setNoGo(i, j);
            }
        }
    }

    placeQueens() {
        let solvedRegions = this.#board.numNoGosPerRegion
            .map((value, index) => value === 1 ? index : null)
            .filter(index => index !== null)
        if (solvedRegions.length > 0) {
            for (let i = 0; i < this.#board.size; i++) {
                for (let j = 0; j < this.#board.size; j++) {
                    let square = this.#board.getSquare(i, j);
                    if (solvedRegions.includes(square.region)) {
                        this.#board.setQueen(i, j);
                        solvedRegions = this.#board.numNoGosPerRegion
                            .map((value, index) => value === 1 ? index : null)
                            .filter(index => index !== null)
                    }
                }
            }
        }
    }
}