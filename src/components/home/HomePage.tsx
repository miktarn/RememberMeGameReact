import React, {JSX, useState} from "react";
import {CreateNewGameForm} from "./CreateNewGameForm";
import {JoinNewGameForm} from "./JoinNewGameForm";

export default function HomePage(): JSX.Element {

    const [isJoinGameFormActive, setIsJoinGameFormActive] = useState(true)

    return <div className={`form centered-container`}>
        <p><h1>This is a Home Page</h1></p>

        <div className={`centered-container`}>
            {isJoinGameFormActive ?
                    <p className={`mode-row-container`}>
                        <button className={"grey-button"}>Join</button>
                        <button onClick={() => setIsJoinGameFormActive(!isJoinGameFormActive)}>Create</button>
                    </p>
                :
                    <p className={`mode-row-container`}>
                        <button onClick={() => setIsJoinGameFormActive(!isJoinGameFormActive)}>Join</button>
                        <button className={"grey-button"}>Create</button>
                    </p>
            }
            {isJoinGameFormActive ? <JoinNewGameForm/> : <CreateNewGameForm/>}
        </div>
    </div>
}