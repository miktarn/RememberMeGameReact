import {useEffect, useState} from "react";
import {GameState, getNextActivePlayerName, increasePoints} from "../model/GameState";
import {deleteDoc, doc, DocumentReference, onSnapshot, setDoc} from "firebase/firestore";
import {firestore} from "../config/firebase";
import {COLLECTION_PATH, CURRENT_GAME, NICKNAME} from "../model/CommonUtil";
import {useNavigate} from "react-router-dom";
import {deck, PlayingCard} from "../model/PlayingCard";

let docRef: DocumentReference;
const revealTimeout = 700;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const useGameState = (currentGameId: string, playerName: string) => {
    const [gameState, setGameState] = useState<GameState>();
    const navigate = useNavigate();

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
        localStorage.removeItem(CURRENT_GAME)
        localStorage.removeItem(NICKNAME)
        navigate("/")
    }

    async function processMatch(updatedFlipped: number[], pointsGained: number) {
        if (!gameState) return;
        try {
            const nextPlayerScore = increasePoints(gameState.playerScore, playerName, pointsGained);
            await setDoc(docRef, {...gameState, playerScore: nextPlayerScore})
            await delay(revealTimeout)
            const nextRemovedCards = [...gameState.removedCards, updatedFlipped[0], updatedFlipped[1]]
            await setDoc(docRef, {...gameState, removedCards: nextRemovedCards, playerScore: nextPlayerScore})
        } catch (error) {
            console.error("Error during save to Firebase:", error);
        }
    }

    async function processMismatch() {
        if (!gameState) return;
        await delay(revealTimeout);
        const nextActivePlayerName: string = getNextActivePlayerName(gameState.playerScore, playerName)
        await setDoc(docRef, {...gameState, activePlayerName: nextActivePlayerName})
    }

    async function checkIfMatching(updatedFlipped: number[], isMatchingBySuit: Boolean) {
        if (!gameState) return;
        const firstCard: PlayingCard = deck[gameState.cardsLayout[updatedFlipped[0]]];
        const secondCard: PlayingCard = deck[gameState.cardsLayout[updatedFlipped[1]]];

        if (isMatchingBySuit && firstCard.isMatchingSuit(secondCard)) {
            await processMatch(updatedFlipped, 1);
        } else if (!isMatchingBySuit && firstCard.isMatchingValue(secondCard)) {
            await processMatch(updatedFlipped, 2);
        } else {
            await processMismatch();
        }
    }

    return {gameState, handleLeave, checkIfMatching};
}