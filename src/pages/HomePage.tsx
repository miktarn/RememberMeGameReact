import {JSX} from "react";
import {Link, useNavigate} from "react-router-dom";
import {SubmitHandler, useForm} from "react-hook-form";

type FormData = {
    nickname: string
}

export default function HomePage(): JSX.Element {
    const {register, handleSubmit, formState: {errors}} = useForm<FormData>();
    const navigate = useNavigate();


    const onSubmit: SubmitHandler<FormData> = (data) => {
        localStorage.setItem("username", data.nickname)
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