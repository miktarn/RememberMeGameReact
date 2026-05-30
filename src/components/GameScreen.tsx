import {JSX, useContext, useEffect, useMemo, useState} from 'react';
import {deck} from "../model/PlayingCard";
import {GameState} from "../model/GameState";
import {useExternalHoverState} from "../hooks/useExternalHoverState";
import {useFlipState} from "../hooks/useFlipState";
import {useGameState} from "../hooks/useGameState";
import {GameContext} from "../GameContext";

export default function GameScreen(): JSX.Element {
    const [isMatchingBySuit, setIsMatchingBySuit] = useState(true)
    const {gameId, playerName} = useContext(GameContext)
    const {
        gameState,
        handleLeave,
        checkIfMatching,
        seconds,
        isGameOver,
        gameOverMessage
    } = useGameState(gameId, playerName);

    if (gameState === undefined) {
        return <div>Game is loading...</div>;
    }

    if (gameState === null) {
        return <div>Error during game info fetching...</div>;
    }

    return (
        <div className="game">
            <div className="board">
                <Board gameState={gameState} isMatchingBySuit={isMatchingBySuit} checkIfMatching={checkIfMatching}
                       isGameOver={isGameOver}/>
            </div>
            <div className="game-info">
                {isGameOver ? <div className="game-over-title">{gameOverMessage}</div> : <div>Current room: {gameId}</div>}
                <br/>
                {gameState.playerScore.map((player) => {
                    const shouldBeMarkedActive: boolean = player.name === gameState.activePlayerName;
                    const shouldHighlightRed: boolean = shouldBeMarkedActive && player.name === playerName
                    return (
                        <div className={`status`} key={player.name}>
                            {player.name}: {player.score}
                            {!isGameOver &&
                                <label className={`status ${shouldHighlightRed ? 'darkred-font-color' : ''}`}>
                                    {shouldBeMarkedActive ? "<- " + seconds : ""}
                                </label>
                            }
                        </div>
                    );
                })}
                <div className="mode-row-container">
                    <label className="mode-info">{!isMatchingBySuit ? "Matching by value" : "Matching by suit"}</label>

                    <button className="change-matching-rule" onClick={() => setIsMatchingBySuit(!isMatchingBySuit)}>
                        Change mode
                    </button>
                </div>
            </div>
            <div>
                <button className="not-important-button" onClick={handleLeave}>Leave the game</button>
            </div>
        </div>
    );
}

interface BoardProps {
    gameState: GameState,
    isMatchingBySuit: Boolean,
    checkIfMatching: (updatedFlipped: number[], isMatchingBySuit: Boolean) => Promise<void>,
    isGameOver: boolean,
}

function defineBoardSize(layoutSize: number): [number, number] {
    if (layoutSize == 12) {
        return [4, 3]
    } else if (layoutSize == 24) {
        return [6, 4]
    } else if (layoutSize == 40) {
        return [8, 5]
    }
    return [12, 5]
}

function Board({gameState, isMatchingBySuit, checkIfMatching, isGameOver}: BoardProps): JSX.Element {
    const {playerName, gameId} = useContext(GameContext)
    const [isLocked, setIsLocked] = useState(false);
    const isPlayerTurn = gameState.activePlayerName === playerName;
    const {flipped, handleFlipStart, handleFlipEnd} = useFlipState(gameId)
    const [columns, rows] = useMemo<[number, number]>(
        () => defineBoardSize(gameState.cardsLayout.length), [gameState.cardsLayout.length]
    )

    useEffect(() => {
        if (isGameOver) {
            setIsLocked(true);
        }
    }, [isGameOver]);

    function handleClick(cardIndex: number) {
        if (isLocked || !isPlayerTurn) {
            return;
        }
        const updatedFlipped = [...flipped, cardIndex];
        handleFlipStart(cardIndex)
        if (updatedFlipped.length === 2) {
            setIsLocked(true)
            checkIfMatching(updatedFlipped, isMatchingBySuit).then(() => {
                    handleFlipEnd()
                    setIsLocked(false)
                }
            )
        }
    }

    function buildCardProps(index: number): CardProps {
        return {
            cardId: gameState.cardsLayout[index],
            isFlipped: flipped.includes(index) || isGameOver,
            onClick: () => handleClick(index),
            isPlayerTurn: isPlayerTurn,
            cardIndex: index,
        };
    }

    return (
        <>
            {Array.from({length: rows}).map((_, rowIndex) => (
                <div className="board-row" key={rowIndex}>
                    {Array.from({length: columns}).map((_, cardIndex) => {
                        const globalIndex = rowIndex * columns + cardIndex;
                        return <Card key={globalIndex} {...buildCardProps(globalIndex)} />;
                    })}
                </div>
            ))}
        </>
    );
}

interface CardProps {
    onClick: () => void,
    isFlipped: boolean,
    cardId: number,
    isPlayerTurn: boolean,
    cardIndex: number
}

export function Card({isFlipped, cardId, onClick, isPlayerTurn, cardIndex}: CardProps): JSX.Element {
    const {gameId} = useContext(GameContext)
    const {isExternalHover, handleHoverStart, handleHoverEnd} = useExternalHoverState(gameId, cardIndex);
    const [isHover, setIsHover] = useState(false)

    useEffect(() => {
        if (isHover && !isPlayerTurn) {
            handleHoverEnd()
        }
    }, [isPlayerTurn]);

    const isRemoved = cardId === -1;
    if (isRemoved) {
        return <button className="card"/>
    }

    const hoverStatus = isHover && isPlayerTurn || isExternalHover ? 'is-hovered' : '';

    function handleOnMouseEnter() {
        setIsHover(true);
        if (isPlayerTurn) {
            handleHoverStart();
        }
    }

    function handleOnMouseLeave() {
        setIsHover(false);
        if (isPlayerTurn) {
            handleHoverEnd();
        }
    }

    if (!isFlipped) {
        return <button className={`card ${hoverStatus}`} onClick={onClick} onMouseEnter={handleOnMouseEnter}
                       onMouseLeave={handleOnMouseLeave}>
            <div className={`card-background`}></div>
        </button>;
    }

    const colorClass = deck[cardId].isRed() ? "darkred-font-color" : "black-font-color";

    return <button className={`card ${hoverStatus}`} onMouseEnter={handleOnMouseEnter}
                   onMouseLeave={handleOnMouseLeave}>
        <div className={`${colorClass}`}>
            {deck[cardId].toString()}
        </div>
    </button>;
}