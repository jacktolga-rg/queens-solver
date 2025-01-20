export default class BoardModel {
    #squares;
    #regions;
    #rows;
    #columns;

    constructor(size, squares = null) {
        this.size = size;
        this.#squares = squares || new Array(size*size).fill(null).map(() =>
            new SquareModel()
        );

        if (this.size * this.size !== this.#squares.length)
            throw new Error("Board size must match squares array (size*size === squares.length)");

        const regions = [];
        const rows = [];
        const columns = [];

        // const squaresGroupedByRegion = Object.groupBy(this.#squares, s => s.region);
        // const squaresGroupedByRow = Object.groupBy(this.#squares, (_, i) => Math.floor(i / this.size));
        // const squaresGroupedByColumn = Object.groupBy(this.#squares, (_, i) => i % this.size);

        // Workaround for unsupported Object.groupBy()
        const squaresGroupedByRegion = {};
        const squaresGroupedByRow = {};
        const squaresGroupedByColumn = {};

        for (let i = 0; i < this.size; i++) {
            squaresGroupedByRegion[i] = [];
            squaresGroupedByRow[i] = [];
            squaresGroupedByColumn[i] = [];
        }

        this.#squares.forEach((square, index) => {
            const row = Math.floor(index / this.size);
            const col = index % this.size;
            
            if (square.region >= 0) {
                squaresGroupedByRegion[square.region].push(square);
            }
            squaresGroupedByRow[row].push(square);
            squaresGroupedByColumn[col].push(square);
        });
        

        for (let i = 0; i < this.size; i++) {
            regions.push(new SquareCollection(squaresGroupedByRegion[i.toString()]));
            rows.push(new SquareCollection(squaresGroupedByRow[i.toString()]));
            columns.push(new SquareCollection(squaresGroupedByColumn[i.toString()]));
        }
        this.#regions = regions;
        this.#rows = rows;
        this.#columns = columns;
    }

    get isFullyDefined() {
        return (
            this.#regions.reduce(
                (accumulator, currentRegion) => accumulator + currentRegion.size, 0
            ) === this.size * this.size &&
            this.#regions.every((r) => r.size > 0)
        );
    }

    get isSolved() {
        return (
            this.#regions.every(r => r.isSolved)
            && this.#rows.every(r => r.isSolved)
            && this.#columns.every(r => r.isSolved)
        );
    }

    get isUnsolvable() {
        return (
            this.#regions.every(r => r.isUnsolvable)
            && this.#rows.every(r => r.isUnsolvable)
            && this.#columns.every(r => r.isUnsolvable)
        );
    }

    get regions() {
        return this.#regions;
    }

    get rows() {
        return this.#rows;
    }

    get columns() {
        return this.#columns;
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
        this.getSquare(x, y).region = region;
        const newBoard = this.clone();
        return newBoard;
    }

    setQueen(x, y) {
        const square = this.getSquare(x, y);
        square.isQueen = true;
        this.#regions[square.region].update();
        this.#rows[x].update;
        this.#columns[y].update();

        const adjacentIndices = [
            {x: x - 1, y: y - 1},
            {x: x, y: y - 1},
            {x: x + 1, y: y - 1},
            {x: x - 1, y: y},
            {x: x + 1, y: y},
            {x: x - 1, y: y + 1},
            {x: x, y: y + 1},
            {x: x + 1, y: y + 1},
        ]

        adjacentIndices.forEach(({ x, y }) => {
            if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
            this.setNoGo(x, y);
        });
    }

    setNoGo(x, y) {
        const square = this.getSquare(x, y);
        square.isNoGo = true;
    }

    clone() {
        const clonedSquares = this.#squares.map(square => 
            new SquareModel(square.region, square.isQueen, square.isNoGo)
        );
        return new BoardModel(this.size, clonedSquares);
    }

    print() {
        let repr = '';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const square = this.getSquare(i, j);
                if (square.isQueen) repr += 'Q';
                else if (square.isNoGo) repr += 'x';
                else repr += '#';
            }
            repr += '\n';
        }
        console.log(repr);
    }

    #get1dIndex(x, y) {
        return x * this.size + y;
    }
}

class SquareModel {
    constructor(region = -1, isQueen = false, isNoGo = false) {
        this.region = region;
        this.isQueen = isQueen;
        this.isNoGo = isNoGo;
    }
}

class SquareCollection {
    #squares;

    constructor(squares) {
        this.#squares = squares;
    }

    get size() {
        if (this.#squares === undefined) return 0;
        return this.#squares.length;
    }

    get squares() {
        return this.#squares;
    }

    get queens() {
        if (this.#squares === undefined) return [];
        return this.#squares.filter(s => s.isQueen);
    }

    get noGos() {
        if (this.#squares === undefined) return [];
        return this.#squares.filter(s => s.isNoGo);
    }

    get isSolved() {
        if (this.#squares === undefined) return false;
        return this.queens.length === 1;
    }

    get isUnsolvable() {
        if (this.#squares === undefined) return false;
        return this.noGos === this.size;
    }

    update() {
        if (this.isSolved) {
            this.#squares.forEach(s => {
                if (s.isQueen) return;
                s.isNoGo = true;
            });
        }
    }
}