import {JSX, useState} from 'react';
import {deck, PlayingCard} from "../model/PlayingCard";
import {GameState} from "../model/GameState";
import {CURRENT_GAME, NICKNAME} from "../model/CommonUtil";
import {useExternalHoverState} from "../hooks/useExternalHoverState";
import {useFlipState} from "../hooks/useFlipState";
import {useGameState} from "../hooks/useGameState";

export default function GameScreen(): JSX.Element {
    const [isMatchingBySuit, setIsMatchingBySuit] = useState(true)
    const [gameId] = useState(localStorage.getItem(CURRENT_GAME) as string);
    const [playerNickname] = useState(localStorage.getItem(NICKNAME) as string)

    const {gameState, handleLeave, checkIfMatching} = useGameState(gameId, playerNickname);

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
                       gameId={gameId} currentPlayerName={playerNickname}/>
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
    gameId: string,
    currentPlayerName: string
}

function Board({gameState, isMatchingBySuit, checkIfMatching, gameId, currentPlayerName}: BoardProps): JSX.Element {
    const [isLocked, setIsLocked] = useState(false);
    const isActivePlayer = gameState.activePlayerName === currentPlayerName;
    const {flipped, handleFlipStart, handleFlipEnd} = useFlipState(gameId)

    function handleClick(cardIndex: number) {
        if (isLocked || !isActivePlayer) {
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
            isHoverEnabled: isActivePlayer,
            cardIndex: index,
            gameId: gameId,
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
    isHoverEnabled: boolean,
    cardIndex: number
    gameId: string
}

function Card({isFlipped, isRemoved, card, onClick, isHoverEnabled, cardIndex, gameId}: CardProps): JSX.Element {
    const {isExternalHover, handleHoverStart, handleHoverEnd} = useExternalHoverState(gameId, cardIndex);
    const [isHover, setIsHover] = useState(false)

    if (isRemoved) {
        return <div className="card"/>

    }
    const hoverStatus = isHover && isHoverEnabled || isExternalHover ? 'is-hovered' : '';

    function handleOnMouseEnter() {
        setIsHover(true);
        if (isHoverEnabled) {
            handleHoverStart();
        }
    }

    function handleOnMouseLeave() {
        setIsHover(false);
        if (isHoverEnabled) {
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