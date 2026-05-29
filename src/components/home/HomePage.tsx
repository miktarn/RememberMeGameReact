import React, {JSX, useState} from "react";
import {CreateNewGameForm} from "./CreateNewGameForm";
import {JoinNewGameForm} from "./JoinNewGameForm";

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