export default class BoardSolver {
    #board;

    constructor(board) {
        this.#board = board;
    }

    *solve() {
        while (!this.#board.isSolved && !this.#board.isUnsolvable) {
            for (let i = 1; i < this.#board.size; i++) {
                this.setNoGosCoveringRegions();
                let indexSeqs = this.generateIndexSequences(i);
                for (let seq of indexSeqs) {
                    let containedRegions = this.getContainedRegions(seq, 0);
                    this.setNoGosInSlice(seq, containedRegions, 0);
                    if (containedRegions.length > i) yield this.#board.clone();
                    containedRegions = this.getContainedRegions(seq, 1);
                    this.setNoGosInSlice(seq, containedRegions, 1);
                    if (containedRegions.length > i) yield this.#board.clone();
                    this.setQueens();
                }
            }
            yield this.#board.clone();
        }
        yield this.#board.clone();
    }

    generateIndexSequences(n) {
        const seqs = [];
        for (let i = 0; i <= this.#board.size - n; i++) {
            const seq = [];
            for (let j = i; j < i + n; j++) seq.push(j);
            seqs.push(seq);
        }
        return seqs;
    }

    getContainedRegions(seq, axis) {
        const regionsAreContained = new Array(this.#board.size).fill(true);
        for (let i = 0; i < this.#board.size; i++) {
            if (axis === 0 && seq.includes(i)) continue;
            for (let j = 0; j < this.#board.size; j++) {
                if (axis === 1 && seq.includes(j)) continue;
                let square = this.#board.getSquare(i, j);
                if (!square.isNoGo)
                    regionsAreContained[square.region] = false;
            }
        }
        const numValidSquaresPerRegion = new Array(this.#board.size).fill(0);
        for (let i = 0; i < this.#board.size; i++) {
            if (axis === 0 && !seq.includes(i)) continue;
            for (let j = 0; j < this.#board.size; j++) {
                if (axis === 1 && !seq.includes(j)) continue;
                let square = this.#board.getSquare(i, j);
                if (!square.isNoGo)
                    numValidSquaresPerRegion[square.region]++;
            }
        }
        const regionsWithValidSquares = numValidSquaresPerRegion
            .map((value) => value > 0);
        return regionsAreContained.map((value, index) => value ? index : null)
            .filter(index => index !== null)
            .map((value, index) => value && regionsWithValidSquares[index]);
        
    }

    setNoGosInSlice(seq, containedRegions, axis) {
        if (containedRegions.length > seq.length) return;
        if (containedRegions.length === seq.length) {
            for (let i = 0; i < this.#board.size; i++) {
                if (axis === 0 && !seq.includes(i)) continue;
                for (let j = 0; j < this.#board.size; j++) {
                    if (axis === 1 && !seq.includes(j)) continue;
                    if (!containedRegions.includes(this.#board.getSquare(i, j).region))
                        this.#board.setNoGo(i, j);
                }
            }
        }
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

    setQueens() {
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