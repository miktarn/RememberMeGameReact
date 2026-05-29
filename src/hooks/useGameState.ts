import {useContext, useEffect, useState} from "react";
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


export const useGameState = (currentGameId: string, playerName: string) => {
    const [gameState, setGameState] = useState<GameState>();
    const {seconds, resetCountdown} = useCountdown(gameState?.timer ?? 6)
    const navigate = useNavigate();
    const {clearContext}= useContext(GameContext)

    useEffect(() => {
        resetCountdown()
    }, [gameState?.activePlayerName]);

    useEffect(() => {
        if (seconds === 0 && gameState?.activePlayerName === playerName && gameState.playerScore.length > 1) {
            passTurn(gameState)
        }
    }, [seconds, gameState?.playerScore.length]);

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
            const nextRemovedCards = [...gameState.removedCards, updatedFlipped[0], updatedFlipped[1]]
            await setDoc(docRef, {...gameState, removedCards: nextRemovedCards, playerScore: nextPlayerScore})
            resetCountdown()
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

    return {gameState, handleLeave, checkIfMatching, seconds};
}