import {JSX, useState} from 'react';
import {PlayingCard, CardSuit, CardValue} from "../model/PlayingCard";
import {Link, useNavigate} from "react-router-dom";
import {deck} from "../model/PlayingCard";
import { doc, getDoc } from "firebase/firestore";
import {db} from "../config/firebase.js"
import {GameState} from "../model/GameState";

const CURRENT_GAME = "current_game";

export default function GameScreen(): JSX.Element {
    const navigate = useNavigate();
    const [userName] = useState(localStorage.getItem("username"))
    const [gameState, setGameState] = useState(initialGameState);
    const [isMatchingBySuit, setIsMatchingBySuit] = useState(true)



    function handleLeave() {
        localStorage.removeItem(CURRENT_GAME)
        navigate("/")
    }

    return (
        <div className="game">

            <div className="board">
                <Board gameState={gameState} setGameState={setGameState} isMatchingBySuit={isMatchingBySuit}/>
            </div>
            <div className="game-info">
                <div className="status">
                   Player 1: <span className="score">{userName}</span>
                </div>
                <div className="status">
                    Your score is <span className="score">{gameState.score}</span>
                </div>
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

const revealTimeout = 700;

interface BoardProps {
    gameState: GameState,
    setGameState: (points: GameState) => void,
    isMatchingBySuit: Boolean;
}

function Board({gameState, setGameState, isMatchingBySuit}: BoardProps): JSX.Element {
    const [isFlipped, setIsFlipped] = useState<number[]>(Array());
    const [isLocked, setIsLocked] = useState(false);

    function processMatch(updatedFlipped: number[], pointsGained: number) {
        const nextScore = gameState.score + pointsGained;
        setGameState({...gameState, score: nextScore});
        setTimeout(() => {
            const nextRemovedCards = [...gameState.removedCards, updatedFlipped[0], updatedFlipped[1]]
            setGameState({...gameState, removedCards: nextRemovedCards, score: nextScore});
            setIsFlipped(Array())
            setIsLocked(false)
        }, revealTimeout);
    }

    function checkIfMatching(updatedFlipped: number[]) {
        const firstCard : PlayingCard = deck[gameState.cardsLayout[updatedFlipped[0]]];
        const secondCard : PlayingCard = deck[gameState.cardsLayout[updatedFlipped[1]]];

        console.log("First " + firstCard)
        console.log("Second " + secondCard)
        if (isMatchingBySuit && firstCard.isMatchingSuit(secondCard)) {
            processMatch(updatedFlipped, 1);
        } else if (!isMatchingBySuit && firstCard.isMatchingValue(secondCard)) {
            processMatch(updatedFlipped, 2);
        } else {
            setTimeout(() => {
                setIsFlipped(Array());
                setIsLocked(false)
            }, revealTimeout);
        }
    }

    function handleClick(index: number) {
        if (isLocked) {
            return;
        }
        const updatedFlipped = [...isFlipped, index];
        setIsFlipped(updatedFlipped);

        if (updatedFlipped.length === 2) {
            setIsLocked(true)
            checkIfMatching(updatedFlipped);
        }
    }

    function buildCardProps(index: number): CardProps {
        return {
            card: deck[gameState.cardsLayout[index]],
            isFlipped: isFlipped.includes(index),
            isRemoved: gameState.removedCards.includes(index),
            onClick: () => handleClick(index),
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
    card: PlayingCard;
}

function Card({isFlipped, isRemoved, card, onClick}: CardProps): JSX.Element {
    if (isRemoved) {
        return <div className="card"/>
    }
    if (!isFlipped) {
        return <button className="card" onClick={onClick}>***</button>;
    }

    const colorClass = card.isRed() ? "darkred-font-color" : "black-font-color";
    return (<button className="card">
        <div className={`${colorClass}`}>
            {card.toString()}
        </div>
    </button>);
}

const initialGameState: GameState = {
    score: 0,
    cardsLayout: [
        0,1,2,3,4,5,13,14,15,16,17,18
    ].sort(() => Math.random() - 0.5),
    removedCards: []
};