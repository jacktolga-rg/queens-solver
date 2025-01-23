'use client';

import { useState, useEffect, useCallback } from 'react';
import BoardModel from './board';
import BoardSolver from './solver'

const BoardControl = ({ size, newSize, setNewSize, boardIsFullyDefined, reset, solve, isEditable, isResettable, isDoneSolving }) => {
    return (
        <div className='settings'>
            <div className='boardSizeSettings'>
                <h3>{`Set board size: ${newSize}`}<em>{`${size !== newSize ? ' (reset to update!)' : ''}`}</em></h3>
                <input  className='sizeSlider' type='range' min='5' max='16' value={newSize}
                onChange={(e) => setNewSize(parseInt(e.target.value))} disabled={!isEditable} />
            </div>
            <div className='buttons'>
                <button className='resetBtn' onClick={reset} disabled={(!isEditable || (!isResettable && size === newSize)) && !isDoneSolving}>Reset</button>
                <button className='solveBtn' onClick={solve} disabled={!boardIsFullyDefined || !isEditable}>Solve</button>
            </div>
        </div>
    );
}

const RegionSelector = ({ size, selectedRegion, setSelectedRegion, isEditable }) => {
    const regions = []
    for (let i = 0; i < size; i++) regions.push(i);
    return (
        <div className='regionSelector'>
        {regions.map((index) => (
            <input
                style={{backgroundColor: `var(--queens-board-colour${index + 1})`}}
                type='radio'
                name='selectRegion'
                value={index}
                checked={index === selectedRegion ? true : false}
                onChange={(e) => {if (e.target.checked) setSelectedRegion(index)}}
                disabled={!isEditable}
                key={index}
            />
        ))}
        </div>
    );
}

const Square = ({ x, y, region, isQueen, isUnsolvable, selectedRegion, updateRegion, mouseIsDown, isEditable, id }) => {
    const [isHovered, setIsHovered] = useState(false);

    const renderSvg = useCallback(() => {
        if (isQueen) return (
            <path d="M256 0a56 56 0 1 1 0 112A56 56 0 1 1 256 0zM134.1 143.8c3.3-13 15-23.8 30.2-23.8c12.3 0 22.6 7.2 27.7 17c12 23.2 36.2 39 64 39s52-15.8 64-39c5.1-9.8 15.4-17 27.7-17c15.3 0 27 10.8 30.2 23.8c7 27.8 32.2 48.3 62.1 48.3c10.8 0 21-2.7 29.8-7.4c8.4-4.4 18.9-4.5 27.6 .9c13 8 17.1 25 9.2 38L399.7 400 384 400l-40.4 0-175.1 0L128 400l-15.7 0L5.4 223.6c-7.9-13-3.8-30 9.2-38c8.7-5.3 19.2-5.3 27.6-.9c8.9 4.7 19 7.4 29.8 7.4c29.9 0 55.1-20.5 62.1-48.3zM256 224s0 0 0 0s0 0 0 0s0 0 0 0zM112 432l288 0 41.4 41.4c4.2 4.2 6.6 10 6.6 16c0 12.5-10.1 22.6-22.6 22.6L86.6 512C74.1 512 64 501.9 64 489.4c0-6 2.4-11.8 6.6-16L112 432z"/>
        );
        if (isUnsolvable) return (
            <g><polygon points="512,59.076 452.922,0 256,196.922 59.076,0 0,59.076 196.922,256 0,452.922 59.076,512 256,315.076 452.922,512 512,452.922 315.076,256"/></g>
        );
    }, [isQueen, isUnsolvable]);

    const handleInteraction = useCallback((e) => {
        if (isEditable && e.button === 0) {
            updateRegion(x, y, selectedRegion);
        }
    }, [isEditable, updateRegion, x, y, selectedRegion]);

    useEffect(() => {
        if (!mouseIsDown) {
            setIsHovered(false);
        }
    }, [mouseIsDown]);

    return (
        <div
            id={id}
            className={`square${isQueen ? ' isQueen' : ''}${isUnsolvable ? ' isUnsolvable' : ''}`}
            style={{
                backgroundColor: `var(--queens-board-colour${region + 1})`,
                opacity: isHovered ? 0.9 : 1
            }}
            onMouseDown={(e) => handleInteraction(e)}
            onMouseEnter={(e) => {
                if (isEditable) {
                    setIsHovered(true);
                    if (mouseIsDown) handleInteraction(e);
                }
            }}
            onMouseLeave={() => setIsHovered(false)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{renderSvg()}</svg>
        </div>
    );
}

const Board = ({ model, isEditable, selectedRegion, updateRegion, mouseIsDown }) => {
    return (
        <div className='board'
        style={{gridTemplate: `repeat(${model.size}, 1fr) / repeat(${model.size}, 1fr)`}}>
            {model.getAllSquares().map(({x, y, region, isQueen, isUnsolvable, _}) => (
                <Square
                    x={x}
                    y={y}
                    region={region}
                    isQueen={isQueen}
                    isUnsolvable={isUnsolvable}
                    selectedRegion={selectedRegion}
                    updateRegion={updateRegion}
                    mouseIsDown={mouseIsDown}
                    isEditable={isEditable}
                    id={x * model.size + y}
                    key={x * model.size + y}
                />
            ))}
        </div>
    );
}

const StatusMessage = ({ model, solutions }) => {
    let message = model.isSolved ? '🎉 Solved! 🎉' : '\u200b';
    message = model.isUnsolvable ? 'Board is unsolvable 😵' : message;
    message = solutions?.length > 1 ? '🎉 Solved! (multiple solutions found) 🎉' : message;
    return (
        <h2 className='statusMessage'>
            {message}
        </h2>
    )
}

const App = () => {
    const updateRegion = (x, y, region) => {
        const newBoardModel = boardModel.setRegion(x, y, region);
        setBoardModel(newBoardModel);
        setResettable(true);
    }

    const resetBoard = () => {
        setBoardModel(new BoardModel(boardSize));
        setSelectedRegion(0);
        setResettable(false);
        setDoneSolving(false);
        setBoardIsEditable(true);
    }

    const solveBoard = () => {
        setBoardIsEditable(false);
        const solver = new BoardSolver(boardModel);
        const finalBoards = solver.solve();
        setSolutions(finalBoards);
        setBoardModel(finalBoards[0]);
        setDoneSolving(true);
    }

    const [mouseIsDown, setMouseIsDown] = useState(false);
    const [boardSize, setBoardSize] = useState(5);
    const [boardModel, setBoardModel] = useState(new BoardModel(boardSize));
    const [boardIsEditable, setBoardIsEditable] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState(0);
    const [isResettable, setResettable] = useState(false);
    const [isDoneSolving, setDoneSolving] = useState(false);
    const [solutions, setSolutions] = useState([]);
    const [windowWidth, setWindowWidth] = useState(0);
    const [isWidescreen, setisWidescreen] = useState(() => windowWidth > 1050);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
    })

    useEffect(() => {
        const handleResize = () => {
            setisWidescreen(window.innerWidth > 1050);
        };

        setisWidescreen(window.innerWidth > 1050);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    useEffect(() => {
        const handleTouch = (e) => {
            if (!mouseIsDown || !boardIsEditable) return;
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element?.classList.contains('square')) {
                e.preventDefault();
                const x = Math.floor(element.id / boardModel.size);
                const y = element.id % boardModel.size;
                updateRegion(x, y, selectedRegion);
            }
        };

        window.addEventListener('touchmove', handleTouch, {passive: false});
        window.addEventListener('touchstart', handleTouch, {passive: false});

        return () => {
            window.removeEventListener('touchmove', handleTouch);
            window.removeEventListener('touchstart', handleTouch);
        }
    }, [mouseIsDown, boardIsEditable, boardModel, selectedRegion, updateRegion]);

    return (
        <div
            className='appContainer'
            onMouseDown={(e) => e.button === 0 && setMouseIsDown(true)}
            onMouseUp={() => setMouseIsDown(false)}
            onMouseLeave={() => setMouseIsDown(false)}
            onTouchStart={() => setMouseIsDown(true)}
            onTouchEnd={() => setMouseIsDown(false)}
            onTouchCancel={() => setMouseIsDown(false)}
            onDragStart={(e) => {
                e.preventDefault();
                return false;
            }}
        >
            <div className='appContent controls'>
                <h1>Queens Solver</h1>
                <h2>Create and solve Queens boards in seconds.</h2>
                <BoardControl
                    size={boardModel.size}
                    newSize={boardSize}
                    setNewSize={setBoardSize}
                    boardIsFullyDefined={boardModel.isFullyDefined}
                    reset={resetBoard}
                    solve={solveBoard}
                    isEditable={boardIsEditable}
                    isResettable={isResettable}
                    isDoneSolving={isDoneSolving}
                />
                <h3>Select region to draw:</h3>
                <RegionSelector
                    size={boardSize}
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    isEditable={boardIsEditable}
                />
                {isWidescreen && <StatusMessage model={boardModel} solutions={solutions} />}
            </div>
            <div className='appContent'>
                <Board
                        model={boardModel}
                        isEditable={boardIsEditable}
                        selectedRegion={selectedRegion}
                        updateRegion={updateRegion}
                        mouseIsDown={mouseIsDown}
                    />
                {!isWidescreen && <StatusMessage model={boardModel} />}
            </div>
        </div>
    );
}

export default App;