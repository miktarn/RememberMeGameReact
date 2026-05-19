import React, {JSX, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {SubmitHandler, useForm} from "react-hook-form";
import {firestore} from "../config/firebase.js"
import {collection, addDoc, getDoc, doc, setDoc} from "firebase/firestore";
import {GameState} from "../model/GameState";
import {COLLECTION_PATH, CURRENT_GAME, NICKNAME} from "../model/CommonUtil";

type CreateGameFormData = {
    nickname: string
}

type JoinGameFormData = {
    gameId: string,
    nickname: string
}

export default function HomePage(): JSX.Element {

    const [isJoinGameFormActive, setIsJoinGameFormActive] = useState(true)

    return <div>
        <h1>This is a Home Page</h1><br/>
        <br/><br/>

        {isJoinGameFormActive ?
            <>
                <button className={"grey-button"}>Join</button>
                <button onClick={() => setIsJoinGameFormActive(!isJoinGameFormActive)}>Create</button>
                <JoinNewGameForm/>
            </>
            :
            <>
                <button onClick={() => setIsJoinGameFormActive(!isJoinGameFormActive)}>Join</button>
                <button className={"grey-button"}>Create</button>
                <CreateNewGameForm/>
            </>
        }
    </div>
}

function CreateNewGameForm(): JSX.Element {
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors}} = useForm<CreateGameFormData>();

    const onSubmit: SubmitHandler<CreateGameFormData> = async (data) => {
        const newGameState: GameState = {
            cardsLayout: Array.from({length: 12}, () =>
                Math.floor(Math.random() * 52)
            ),
            removedCards: [],
            playerScore: [{name: data.nickname, score: 0}],
            activePlayerName: data.nickname
        };

        console.log("Game state " + newGameState)
        const docRef = await addDoc(collection(firestore, COLLECTION_PATH), newGameState);
        localStorage.setItem(CURRENT_GAME, docRef.id)
        localStorage.setItem(NICKNAME, data.nickname)

        navigate("/game")
    }

    return <form onSubmit={handleSubmit(onSubmit)}>
        <br/>
        <input {...register("nickname", {required: "Username should not be empty"})} type="text"
               placeholder="Enter your nickname"></input><br/><br/>
        {errors.nickname && <>
            <div style={{color: "red"}}>{errors.nickname.message}</div>
            <br/></>}
        <button type="submit">New Game</button>
    </form>
}

function JoinNewGameForm(): JSX.Element {
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors}, setError} = useForm<JoinGameFormData>();

    const onSubmit: SubmitHandler<JoinGameFormData> = async (data) => {
        const docRef = doc(firestore, COLLECTION_PATH, data.gameId);
        const docSnapshot = await getDoc(docRef);

        if (!docSnapshot.exists()) {
            setError("gameId", {message: "Game room not found"})
            return null;
        }

        const gameState: GameState = docSnapshot.data() as GameState;
        if (gameState.playerScore.find(p => p.name === data.nickname)) {
            setError("nickname", {message: "Nickname already taken"})
            return null;
        }

        const playerScore = gameState.playerScore;
        const nextPlayerScore = [...playerScore, {name: data.nickname, score: 0}]
        await setDoc(docRef, {...gameState, playerScore: nextPlayerScore});
        localStorage.setItem(CURRENT_GAME, docRef.id)
        localStorage.setItem(NICKNAME, data.nickname)

        navigate("/game")
    }

    return <form onSubmit={handleSubmit(onSubmit)}>
        <br/>
        <input {...register("gameId", {required: "Game id should not be empty"})} type="text"
               placeholder="Enter rooms game ID"></input><br/><br/>
        {errors.gameId && <>
            <div style={{color: "red"}}>{errors.gameId.message}</div>
            <br/></>}
        <input {...register("nickname", {required: "Username should not be empty"})} type="text"
               placeholder="Enter your nickname"></input><br/><br/>
        {errors.nickname && <>
            <div style={{color: "red"}}>{errors.nickname.message}</div>
            <br/></>}
        <button type="submit">Join Game</button>
    </form>
}