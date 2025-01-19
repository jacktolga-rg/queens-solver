export class BoardModel {
    #squares;
    #numSquaresPerRegion;
    #numQueens;
    #numNoGosPerRegion;
    #numNoGosPerRow;
    #numNoGosPerColumn;

    constructor(
        size,
        squares = null,
        numSquaresPerRegion = null,
        numQueens = null,
        numNoGosPerRegion = null,
        numNoGosPerRow = null,
        numNoGosPerColumn = null
    ) {
        this.size = size;
        this.#squares = squares || new Array(size*size).fill(null).map(() =>
            new SquareModel()
        );
        this.#numSquaresPerRegion = numSquaresPerRegion || new Array(size).fill(0);
        this.#numQueens = numQueens || 0;
        this.#numNoGosPerRegion = numNoGosPerRegion || new Array(size).fill(0);
        this.#numNoGosPerRow = numNoGosPerRow || new Array(size).fill(0);
        this.#numNoGosPerColumn = numNoGosPerColumn || new Array(size).fill(0);
    }

    get numSquaresPerRegion() {
        return this.#numSquaresPerRegion;
    }

    get numNoGosPerRegion() {
        return this.#numNoGosPerRegion;
    }

    get isFullyDefined() {
        return (
            this.#numSquaresPerRegion.reduce(
                (accumulator, currentValue) => accumulator + currentValue, 0
            ) === this.size * this.size &&
            this.#numSquaresPerRegion.every((n) => n > 0)
        );
    }

    get isSolved() {
        return this.#numQueens === this.size;
    }

    get isUnsolvable() {
        return this.#numNoGosPerRow.includes(this.size)
            || this.#numNoGosPerColumn.includes(this.size)
            || this.#numNoGosPerRegion.every((n, i) => n === this.#numSquaresPerRegion[i]);
    }

    getSquare(x, y) {
        return this.#squares[this.#get1dIndex(x, y)];
    }

    getAllSquares() {
        return this.#squares.map((square, i) => (
            {
                x: Math.floor(i / this.size),
                y: i % this.size,
                region: square.region,
                isQueen: square.isQueen,
                isNoGo: square.isNoGo
            }
        ));
    }

    setRegion(x, y, region) {
        if (region < 0 || region >= this.size)
            throw new RangeError(`Region must be an integer greater 
                than 0 and less than or equal to ${this.size}`);
        const square = this.getSquare(x, y);
        if (square.region !== -1)
            this.#numSquaresPerRegion[square.region]--;
        this.#numSquaresPerRegion[region]++;
        square.region = region;

        const newBoard = this.clone();
        return newBoard;
    }

    setQueen(x, y) {
        const square = this.getSquare(x, y);
        if (!square.isQueen) this.#numQueens++;
        square.isQueen = true;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (
                    (i === x != j === y)
                    || (i === x - 1 && j === y - 1)
                    || (i === x + 1 && j === y - 1)
                    || (i === x - 1 && j === y + 1)
                    || (i === x + 1 && j === y + 1)
                )
                    this.setNoGo(i, j);
            }
        }
    }

    setNoGo(x, y) {
        const square = this.getSquare(x, y);
        if (!square.isNoGo) {
            this.#numNoGosPerRegion[square.region]++;
            this.#numNoGosPerRow[x]++;
            this.#numNoGosPerColumn[y]++;
        }
        square.isNoGo = true;
    }

    clone() {
    const clonedSquares = this.#squares.map(square => 
        new SquareModel(square.region, square.isQueen, square.isNoGo)
    );
    
    const clonedNumSquaresPerRegion = [...this.#numSquaresPerRegion];
    const clonedNumNoGosPerRegion = [...this.#numNoGosPerRegion];
    const clonedNumNoGosPerRow = [...this.#numNoGosPerRow];
    const clonedNumNoGosPerColumn = [...this.#numNoGosPerColumn];
    
    return new BoardModel(
        this.size,
        clonedSquares,
        clonedNumSquaresPerRegion,
        this.#numQueens,
        clonedNumNoGosPerRegion,
        clonedNumNoGosPerRow,
        clonedNumNoGosPerColumn
    );
    }

    #get1dIndex(x, y) {
        return x * this.size + y;
    }
}

export class SquareModel {
    constructor(region = -1, isQueen = false, isNoGo = false) {
        this.region = region;
        this.isQueen = isQueen;
        this.isNoGo = isNoGo;
    }
}