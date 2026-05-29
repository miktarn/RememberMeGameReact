import React, {JSX, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {SubmitHandler, useForm} from "react-hook-form";
import {GameContext} from "../../GameContext";
import {GameState} from "../../model/GameState";
import {addDoc, collection} from "firebase/firestore";
import {firestore} from "../../config/firebase";
import {COLLECTION_PATH} from "../../model/CommonUtil";

type CreateGameFormData = {
    nickname: string,
    cardsAmount: string,
    timer: string
}

export function CreateNewGameForm(): JSX.Element {
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors}} = useForm<CreateGameFormData>({
        defaultValues: {cardsAmount: "24"}
    });
    const {setContextData} = useContext(GameContext)

    const processSubmitEventData: SubmitHandler<CreateGameFormData> = async (data) => {
        const newGameState: GameState = {
            cardsLayout: Array.from({length: Number(data.cardsAmount)}, () =>
                Math.floor(Math.random() * 52)
            ),
            removedCards: [],
            playerScore: [{name: data.nickname, score: 0}],
            activePlayerName: data.nickname,
            timer: Number(data.timer)
        };
        const docRef = await addDoc(collection(firestore, COLLECTION_PATH), newGameState);
        setContextData(data.nickname, docRef.id)
        navigate("/game")
    }

    return <form onSubmit={handleSubmit(processSubmitEventData)}>
        <br/>
        <input {...register("nickname", {required: "Username should not be empty"})} type="text"
               placeholder="Enter your nickname">
        </input><br/><br/>
        {errors.nickname && <>
            <div style={{color: "red"}}>{errors.nickname.message}</div>
            <br/></>}
        <label>
            <input type="radio" {...register("cardsAmount")} value="12"/>
            Easy 4х3
        </label><br/>
        <label>
            <input type="radio" {...register("cardsAmount")} value="24"/>
            Medium 6х4
        </label><br/>
        <label>
            <input type="radio" {...register("cardsAmount")} value="40"/>
            Big 8х5
        </label><br/>
        <label>
            <input type="radio" {...register("cardsAmount")} value="60"/>
            Enormous 12х5
        </label><br/><br/>

        <input type="number" placeholder="Select Timer"
               {...register("timer", {
                   valueAsNumber: true,
                   min: {value: 1, message: "Timer must be at least 1 second"},
                   max: {value: 60, message: "Timer cannot exceed 60 seconds"},
                   validate: (value) => Number.isInteger(value) || "Must be a whole number",
                   required: "This field is required",
               })} />
        <br/><br/>
        {errors.timer && <>
            <div style={{color: "red"}}>{errors.timer.message}</div>
            <br/></>}
        <button type="submit">New Game</button>
    </form>
}