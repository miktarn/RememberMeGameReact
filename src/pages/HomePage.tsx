import {JSX} from "react";
import {Link, useNavigate} from "react-router-dom";
import {SubmitHandler, useForm} from "react-hook-form";
import {db} from "../config/firebase.js"
import { collection, addDoc } from "firebase/firestore";
import {GameState} from "../model/GameState";
type FormData = {
    nickname: string
}

const CURRENT_GAME = "current_game";


export default function HomePage(): JSX.Element {
    const navigate = useNavigate();

    const {register, handleSubmit, formState: {errors}} = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        localStorage.setItem("username", data.nickname)
        const newGameUuid: string = crypto.randomUUID();
        localStorage.setItem(CURRENT_GAME, newGameUuid)
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

const saveNewGameAndRedirect = async (gameState: GameState) => {
    try {

    } catch (e) {
        console.error("Error adding document: ", e);
    }
};