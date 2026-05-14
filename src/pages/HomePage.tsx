import {JSX} from "react";
import {Link, useNavigate} from "react-router-dom";
import {SubmitHandler, useForm} from "react-hook-form";
import {db} from "../config/firebase.js"
import { collection, addDoc } from "firebase/firestore";
import {GameState} from "../model/GameState";
import {COLLECTION_PATH, CURRENT_GAME} from "../model/CommonUtil";

type FormData = {
    nickname: string
}

export default function HomePage(): JSX.Element {
    const navigate = useNavigate();

    const {register, handleSubmit, formState: {errors}} = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const newGameState: GameState = {
            score: 0,
            cardsLayout: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11],
            removedCards: [],
            playerNames: [data.nickname]
        };
        const docRef = await addDoc(collection(db, COLLECTION_PATH), newGameState);
        localStorage.setItem(CURRENT_GAME, docRef.id)
        navigate("/game")
    }

    return <div>
        <h1>This is a Home Page</h1><br/>
        <br/><br/>
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register("nickname", {required: "Username should not be empty"})} type="text" placeholder="Enter your nickname"></input><br/><br/>
            {errors.nickname && <><div style={{ color: "red" }}>{errors.nickname.message}</div><br/></>}
            <button type="submit">New Game</button>
        </form>
    </div>
}