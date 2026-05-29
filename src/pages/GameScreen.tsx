import {JSX, useContext, useState} from 'react';
import {deck, PlayingCard} from "../model/PlayingCard";
import {GameState} from "../model/GameState";
import {useExternalHoverState} from "../hooks/useExternalHoverState";
import {useFlipState} from "../hooks/useFlipState";
import {useGameState} from "../hooks/useGameState";
import {GameContext} from "../GameContext";

export default function GameScreen(): JSX.Element {
    const [isMatchingBySuit, setIsMatchingBySuit] = useState(true)
    const {gameId, playerName} = useContext(GameContext)
    const {gameState, handleLeave, checkIfMatching} = useGameState(gameId, playerName);

    if (gameState === undefined) {
        return <div>Game is loading...</div>;
    }

    if (gameState === null) {
        return <div>Error during game info fetching...</div>;
    }

    return (
        <div className="game">

            <div className="board">
                <Board gameState={gameState} isMatchingBySuit={isMatchingBySuit} checkIfMatching={checkIfMatching}/>
            </div>
            <div className="game-info">
                <div>Current room: {gameId}</div>
                <br/>
                {gameState.playerScore.map((player) => (
                    <div className="status" key={player.name}>
                        {player.name}: {player.score} {player.name === gameState.activePlayerName ? "<-" : ""}
                    </div>
                ))}
                <button className="change-matching-rule" onClick={() => setIsMatchingBySuit(!isMatchingBySuit)}>
                    {isMatchingBySuit ? "Change to match by value" : "Change to match by suit"}
                </button>
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
}

function Board({gameState, isMatchingBySuit, checkIfMatching}: BoardProps): JSX.Element {
    const {playerName, gameId} = useContext(GameContext)
    const [isLocked, setIsLocked] = useState(false);
    const isPlayerTurn = gameState.activePlayerName === playerName;
    const {flipped, handleFlipStart, handleFlipEnd} = useFlipState(gameId)

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
            card: deck[gameState.cardsLayout[index]],
            isFlipped: flipped.includes(index),
            isRemoved: gameState.removedCards.includes(index),
            onClick: () => handleClick(index),
            isPlayerTurn: isPlayerTurn,
            cardIndex: index,
        };
    }

    return (
        <>
            <div className="board-row">
                <Card {...buildCardProps(0)}/>
                <Card {...buildCardProps(1)}/>
                <Card {...buildCardProps(2)}/>
                <Card {...buildCardProps(3)}/>
            </div>
            <div className="board-row">
                <Card {...buildCardProps(4)}/>
                <Card {...buildCardProps(5)}/>
                <Card {...buildCardProps(6)}/>
                <Card {...buildCardProps(7)}/>
            </div>
            <div className="board-row">
                <Card {...buildCardProps(8)}/>
                <Card {...buildCardProps(9)}/>
                <Card {...buildCardProps(10)}/>
                <Card {...buildCardProps(11)}/>
            </div>
        </>
    );
}

interface CardProps {
    onClick: () => void,
    isFlipped: boolean,
    isRemoved: boolean,
    card: PlayingCard,
    isPlayerTurn: boolean,
    cardIndex: number
}

export function Card({isFlipped, isRemoved, card, onClick, isPlayerTurn, cardIndex}: CardProps): JSX.Element {
    const {gameId} = useContext(GameContext)
    const {isExternalHover, handleHoverStart, handleHoverEnd} = useExternalHoverState(gameId, cardIndex);
    const [isHover, setIsHover] = useState(false)

    if (isRemoved) {
        return <div className="card"/>
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
            ***
        </button>;
    }

    const colorClass = card.isRed() ? "darkred-font-color" : "black-font-color";

    return <button className={`card ${hoverStatus}`} onMouseEnter={handleOnMouseEnter}
                   onMouseLeave={handleOnMouseLeave}>
        <div className={`${colorClass}`}>
            {card.toString()}
        </div>
    </button>;
}