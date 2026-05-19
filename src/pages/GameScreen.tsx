import {JSX, useEffect, useState} from 'react';
import {PlayingCard} from "../model/PlayingCard";
import {useNavigate} from "react-router-dom";
import {deck} from "../model/PlayingCard";
import {doc, onSnapshot, setDoc, DocumentReference, deleteDoc} from "firebase/firestore";
import {firestore, rtdb} from "../config/firebase.js"
import {GameState, getNextActivePlayerName, increasePoints} from "../model/GameState";
import {COLLECTION_PATH, NICKNAME, CURRENT_GAME} from "../model/CommonUtil";
import {ref, onValue, set} from "firebase/database";

let gameId: string;
let docRef: DocumentReference;
let playerNickname: string

const handleFlipStart = (cardId: number, thisGameId: string) => {
    const playerFlipRef = ref(rtdb, `rooms/${thisGameId}/flips/${cardId}`);
    set(playerFlipRef, true);
};

const handleFlipEnd = (thisGameId: string) => {
    const playerFlipRef = ref(rtdb, `rooms/${thisGameId}/flips`);
    set(playerFlipRef, null);
};

export default function GameScreen(): JSX.Element {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<GameState | undefined | null>();
    const [isMatchingBySuit, setIsMatchingBySuit] = useState(true)

    useEffect(() => {
        gameId = localStorage.getItem(CURRENT_GAME) as string;
        playerNickname = localStorage.getItem(NICKNAME) as string;
        docRef = doc(firestore, COLLECTION_PATH, gameId);
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

    if (gameState === undefined) {
        return <div>Game is loading...</div>;
    }

    if (gameState === null) {
        return <div>Error during game info fetching...</div>;
    }

    async function handleLeave() {
        const nextPlayers = (gameState as GameState).playerScore.filter(p => p.name !== playerNickname);
        const docRef = doc(firestore, COLLECTION_PATH, gameId);
        if (nextPlayers.length === 0) {
            await deleteDoc(docRef)
        } else if (gameState?.activePlayerName === playerNickname) {
            const nextActivePlayerName: string = getNextActivePlayerName(gameState?.playerScore, playerNickname)
            await setDoc(docRef, {...gameState, playerScore: nextPlayers, activePlayerName: nextActivePlayerName})
        } else {
            await setDoc(docRef, {...gameState, playerScore: nextPlayers})
        }
        localStorage.removeItem(CURRENT_GAME)
        localStorage.removeItem(NICKNAME)
        navigate("/")
    }

    return (
        <div className="game">

            <div className="board">
                <Board gameState={gameState} isMatchingBySuit={isMatchingBySuit}/>
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

const revealTimeout = 700;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

interface BoardProps {
    gameState: GameState,
    isMatchingBySuit: Boolean;
}

function Board({gameState, isMatchingBySuit}: BoardProps): JSX.Element {
    const [flipped, setFlipped] = useState<number[]>(Array());
    const [isLocked, setIsLocked] = useState(false);
    const isActivePlayer = gameState.activePlayerName === playerNickname;

    useEffect(() => {
        const hoversRef = ref(rtdb, `rooms/${gameId}/flips`);

        // Слушаем изменения всей ветки hovers для этой комнаты
        const unsubscribe = onValue(hoversRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setFlipped(Object.keys(data).map(Number));
            } else {
                setFlipped(Array());
            }
        });

        // Отписываемся при размонтировании компонента
        return () => unsubscribe();
    }, []);


    async function processMatch(updatedFlipped: number[], pointsGained: number) {
        try {
            const nextPlayerScore = increasePoints(gameState.playerScore, playerNickname, pointsGained);
            await setDoc(docRef, {...gameState, playerScore: nextPlayerScore})
            await delay(700)
            const nextRemovedCards = [...gameState.removedCards, updatedFlipped[0], updatedFlipped[1]]
            await setDoc(docRef, {...gameState, removedCards: nextRemovedCards, playerScore: nextPlayerScore})
            handleFlipEnd(gameId)
            setIsLocked(false)
        } catch (error) {
            console.error("Error during save to Firebase:", error);
            setIsLocked(false);
        }
    }

    async function processMismatch() {
        await delay(revealTimeout);
        handleFlipEnd(gameId)
        const nextActivePlayerName: string = getNextActivePlayerName(gameState.playerScore, playerNickname)
        await setDoc(docRef, {...gameState, activePlayerName: nextActivePlayerName})
        setIsLocked(false)
    }

    function checkIfMatching(updatedFlipped: number[]) {
        const firstCard: PlayingCard = deck[gameState.cardsLayout[updatedFlipped[0]]];
        const secondCard: PlayingCard = deck[gameState.cardsLayout[updatedFlipped[1]]];

        if (isMatchingBySuit && firstCard.isMatchingSuit(secondCard)) {
            processMatch(updatedFlipped, 1);
        } else if (!isMatchingBySuit && firstCard.isMatchingValue(secondCard)) {
            processMatch(updatedFlipped, 2);
        } else {
            processMismatch();
        }
    }

    function handleClick(index: number) {
        if (isLocked || !isActivePlayer) {
            return;
        }
        const updatedFlipped = [...flipped, index];
        handleFlipStart(index, gameId)
        if (updatedFlipped.length === 2) {
            setIsLocked(true)
            checkIfMatching(updatedFlipped);
        }
    }

    function buildCardProps(index: number, isHoverEnabled: boolean): CardProps {
        return {
            card: deck[gameState.cardsLayout[index]],
            isFlipped: flipped.includes(index),
            isRemoved: gameState.removedCards.includes(index),
            onClick: () => handleClick(index),
            isHoverEnabled: isHoverEnabled
        };
    }

    return (
        <>
            <div className="board-row">
                <Card {...buildCardProps(0, isActivePlayer)}/>
                <Card {...buildCardProps(1, isActivePlayer)}/>
                <Card {...buildCardProps(2, isActivePlayer)}/>
                <Card {...buildCardProps(3, isActivePlayer)}/>
            </div>
            <div className="board-row">
                <Card {...buildCardProps(4, isActivePlayer)}/>
                <Card {...buildCardProps(5, isActivePlayer)}/>
                <Card {...buildCardProps(6, isActivePlayer)}/>
                <Card {...buildCardProps(7, isActivePlayer)}/>
            </div>
            <div className="board-row">
                <Card {...buildCardProps(8, isActivePlayer)}/>
                <Card {...buildCardProps(9, isActivePlayer)}/>
                <Card {...buildCardProps(10, isActivePlayer)}/>
                <Card {...buildCardProps(11, isActivePlayer)}/>
            </div>
        </>
    );
}


interface CardProps {
    onClick: () => void,
    isFlipped: boolean,
    isRemoved: boolean,
    card: PlayingCard,
    isHoverEnabled: boolean;
}

function Card({isFlipped, isRemoved, card, onClick, isHoverEnabled}: CardProps): JSX.Element {
    if (isRemoved) {
        return <div className="card"/>
    }

    const [isHover, setIsHover] = useState(false)
    const hoverStatus = isHover && isHoverEnabled ? 'is-hovered' : '';
    if (!isFlipped) {
        return <button className={`card ${hoverStatus}`} onClick={onClick}
                       onMouseEnter={() => setIsHover(true)}
                       onMouseLeave={() => setIsHover(false)}>
            ***
        </button>;
    }

    const colorClass = card.isRed() ? "darkred-font-color" : "black-font-color";
    return (<button className={`card ${hoverStatus}`}
                    onMouseEnter={() => setIsHover(true)}
                    onMouseLeave={() => setIsHover(false)}>
        <div className={`${colorClass}`}>
            {card.toString()}
        </div>
    </button>);
}