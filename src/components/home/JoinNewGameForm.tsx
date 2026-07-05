import React, {JSX, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {SubmitHandler, useForm} from "react-hook-form";
import {GameContext} from "../../GameContext";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {firestore} from "../../config/firebase";
import {COLLECTION_PATH} from "../../model/CommonUtil";
import {GameState} from "../../model/GameState";

type JoinGameFormData = {
    gameId: string,
    nickname: string
}

export function JoinNewGameForm(): JSX.Element {
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors}, setError} = useForm<JoinGameFormData>();
    const {setContextData} = useContext(GameContext)

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
        setContextData(data.nickname, docRef.id)

        navigate("/game")
    }

    return <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("nickname", {
            required: "Username should not be empty", maxLength: {
                value: 14,
                message: "Nickname must be at most 14 characters long",
            }
        })} type="text"
               placeholder="Enter your nickname"></input><br/><br/>
        {errors.nickname && <>
            <div style={{color: "red"}}>{errors.nickname.message}</div>
            <br/></>}
        <input {...register("gameId", {required: "Game id should not be empty"})} type="text"
               placeholder="Enter rooms game ID"></input><br/><br/>
        {errors.gameId && <>
            <div style={{color: "red"}}>{errors.gameId.message}</div>
            <br/></>}
        <div className={`centered-container`}>
            <button type="submit">Join Game</button>
        </div>
    </form>
}