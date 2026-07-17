import {useContext, useEffect, useMemo, useState} from "react";
import {GameState, getNextActivePlayerName, increasePoints} from "../model/GameState";
import {deleteDoc, doc, DocumentReference, onSnapshot, setDoc} from "firebase/firestore";
import {firestore} from "../config/firebase";
import {COLLECTION_PATH} from "../model/CommonUtil";
import {useNavigate} from "react-router-dom";
import {deck, PlayingCard} from "../model/PlayingCard";
import {GameContext} from "../GameContext";
import {useCountdown} from "./useCountdown";

let docRef: DocumentReference;
const revealTimeout = 700;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function checkIfLegalMoveExist(cardsLayout: Array<number>) {
    const remainingCards = cardsLayout.filter(i => i !== -1);
    if (remainingCards.length > 4) {
        return true
    }

    for (let i = 0; i < remainingCards.length - 1; i++) {
        for (let j = i + 1; j < remainingCards.length; j++) {
            const first = deck[remainingCards[i]];
            const second = deck[remainingCards[j]];
            if (first.isMatchingSuit(second) || first.isMatchingValue(second)) {
                console.log(first + " is matching " + second)
                return true
            }
        }
    }
    return false;
}

export const useGameState = (currentGameId: string, playerName: string) => {
    const [gameState, setGameState] = useState<GameState>();
    const {seconds, resetCountdown} = useCountdown(gameState?.timer)
    const navigate = useNavigate();
    const {clearContext} = useContext(GameContext)
    const [isGameOver, setIsGameOver] = useState<boolean>(false)
    const gameOverMessage = useMemo(() => getGameOverMessage(), [isGameOver])
    const [canPassTurnBecauseOfTimeout, setCanPassTurnBecauseOfTimeout] = useState(true)

    useEffect(() => {
        if (!gameState) return
        if (!checkIfLegalMoveExist(gameState.cardsLayout)) {
            setIsGameOver(true);
        }
    }, [gameState?.cardsLayout]);

    useEffect(() => {
        if (canPassTurnBecauseOfTimeout) {
            if (seconds === 0 && gameState?.activePlayerName === playerName && gameState.playerScore.length > 1) {
                passTurn(gameState)
            }
        }
    }, [seconds, gameState?.playerScore.length, canPassTurnBecauseOfTimeout]);

    useEffect(() => {
        docRef = doc(firestore, COLLECTION_PATH, currentGameId);
        const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setGameState(docSnapshot.data() as GameState);
            } else {
                console.log("Game is not founded by id! " + currentGameId);
                setGameState(undefined);
            }
        });

        return () => unsubscribe();
    }, [currentGameId]);

    async function passTurn(gameState: GameState) {
        const nextActivePlayerName: string = getNextActivePlayerName(gameState.playerScore, playerName)
        await setDoc(docRef, {...gameState, activePlayerName: nextActivePlayerName})
        resetCountdown()
    }

    async function handleLeave() {
        const nextPlayers = (gameState as GameState).playerScore.filter(p => p.name !== playerName);
        const docRef = doc(firestore, COLLECTION_PATH, currentGameId);
        if (nextPlayers.length === 0) {
            await deleteDoc(docRef)
        } else if (gameState?.activePlayerName === playerName) {
            const nextActivePlayerName: string = getNextActivePlayerName(gameState?.playerScore, playerName)
            await setDoc(docRef, {...gameState, playerScore: nextPlayers, activePlayerName: nextActivePlayerName})
        } else {
            await setDoc(docRef, {...gameState, playerScore: nextPlayers})
        }
        clearContext()
        navigate("/")
    }

    async function processMatch(updatedFlipped: number[], pointsGained: number) {
        if (!gameState) return;
        try {
            const nextPlayerScore = increasePoints(gameState.playerScore, playerName, pointsGained);
            await setDoc(docRef, {...gameState, playerScore: nextPlayerScore})
            await delay(revealTimeout)
            const nextCardsLayout = gameState.cardsLayout.slice();
            nextCardsLayout[updatedFlipped[0]] = -1
            nextCardsLayout[updatedFlipped[1]] = -1
            await setDoc(docRef, {...gameState, cardsLayout: nextCardsLayout, playerScore: nextPlayerScore})
            await resetCountdown()
        } catch (error) {
            console.error("Error during save to Firebase:", error);
        }
    }

    async function processMismatch() {
        if (!gameState) return;
        await delay(revealTimeout);
        await passTurn(gameState);
    }

    async function checkIfMatching(updatedFlipped: number[], isMatchingBySuit: Boolean) {
        if (!gameState) return;
        setCanPassTurnBecauseOfTimeout(false)
        const firstCard: PlayingCard = deck[gameState.cardsLayout[updatedFlipped[0]]];
        const secondCard: PlayingCard = deck[gameState.cardsLayout[updatedFlipped[1]]];

        if (isMatchingBySuit && firstCard.isMatchingSuit(secondCard)) {
            await processMatch(updatedFlipped, 1);
        } else if (!isMatchingBySuit && firstCard.isMatchingValue(secondCard)) {
            await processMatch(updatedFlipped, 2);
        } else {
            await processMismatch();
        }
        setCanPassTurnBecauseOfTimeout(true)
    }

    function getGameOverMessage(): string {
        if (!gameState) return "Error: Game not initialized";
        const resultsDesc = gameState.playerScore.toSorted((p1, p2) => p2.score - p1.score);

        if (resultsDesc.length > 1 && resultsDesc[0].score === resultsDesc[1].score) {
            return "Game over: This is a draw"
        }
        return "Game over: The winner is " + resultsDesc[0].name
    }

    return {gameState, handleLeave, checkIfMatching, seconds, isGameOver, gameOverMessage};
}