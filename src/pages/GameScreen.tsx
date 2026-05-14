import {JSX, useEffect, useState} from 'react';
import {PlayingCard} from "../model/PlayingCard";
import {useNavigate} from "react-router-dom";
import {deck} from "../model/PlayingCard";
import {doc, onSnapshot, setDoc} from "firebase/firestore";
import {db} from "../config/firebase.js"
import {GameState} from "../model/GameState";
import {COLLECTION_PATH, CURRENT_GAME} from "../model/CommonUtil";

export default function GameScreen(): JSX.Element {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<GameState | undefined | null>();
    const [isMatchingBySuit, setIsMatchingBySuit] = useState(true)

    useEffect(() => {
        const gameId = localStorage.getItem(CURRENT_GAME) as string;
        const docRef = doc(db, COLLECTION_PATH, gameId);

        const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setGameState(docSnapshot.data() as GameState);
            } else {
                console.log("Game is not founded by id! " + gameId);
                setGameState(undefined);
            }
        });

        return () => unsubscribe();
    }, []);

    function handleLeave() {
        localStorage.removeItem(CURRENT_GAME)
        navigate("/")
    }

    if (gameState === undefined) {
        return <div>Game is loading...</div>;
    }

    if (gameState === null) {
        return <div>Error during game info fetching...</div>;
    }

    return (
        <div className="game">

            <div className="board">
                <Board gameState={gameState} setGameState={setGameState} isMatchingBySuit={isMatchingBySuit}/>
            </div>
            <div className="game-info">
                {gameState.playerNames.map((name, index) => (
                    <div key={index} className="status">
                        Player {index + 1}: <span className="score">{name}</span>
                    </div>
                ))}
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
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

interface BoardProps {
    gameState: GameState,
    setGameState: (points: GameState) => void,
    isMatchingBySuit: Boolean;
}

function Board({gameState, isMatchingBySuit}: BoardProps): JSX.Element {
    const [flipped, setFlipped] = useState<number[]>(Array());
    const [isLocked, setIsLocked] = useState(false);

    async function processMatch(updatedFlipped: number[], pointsGained: number) {
        try {
            const nextScore = gameState.score + pointsGained;
            const docRef = doc(db, COLLECTION_PATH, localStorage.getItem(CURRENT_GAME) as string);
            await setDoc(docRef, {...gameState, score: nextScore})
            await delay(700)
            const nextRemovedCards = [...gameState.removedCards, updatedFlipped[0], updatedFlipped[1]]
            await setDoc(docRef, {...gameState, removedCards: nextRemovedCards, score: nextScore})
            setFlipped(Array())
            setIsLocked(false)
        } catch (error) {
            console.error("Error during save to Firebase:", error);
            setIsLocked(false);
        }
    }

    function checkIfMatching(updatedFlipped: number[]) {
        const firstCard: PlayingCard = deck[gameState.cardsLayout[updatedFlipped[0]]];
        const secondCard: PlayingCard = deck[gameState.cardsLayout[updatedFlipped[1]]];

        if (isMatchingBySuit && firstCard.isMatchingSuit(secondCard)) {
            processMatch(updatedFlipped, 1);
        } else if (!isMatchingBySuit && firstCard.isMatchingValue(secondCard)) {
            processMatch(updatedFlipped, 2);
        } else {
            setTimeout(() => {
                setFlipped(Array());
                setIsLocked(false)
            }, revealTimeout);
        }
    }

    function handleClick(index: number) {
        if (isLocked) {
            return;
        }
        const updatedFlipped = [...flipped, index];
        setFlipped(updatedFlipped);

        if (updatedFlipped.length === 2) {
            setIsLocked(true)
            checkIfMatching(updatedFlipped);
        }
    }

    function buildCardProps(index: number): CardProps {
        return {
            card: deck[gameState.cardsLayout[index]],
            isFlipped: flipped.includes(index),
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