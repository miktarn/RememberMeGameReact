import {Context, createContext, ReactNode, useState} from "react";

interface GameContextData {
    playerName: string,
    gameId: string,
    setContextData: (playerName: string, gameId: string) => void,
    clearContext: () => void
}

export const CURRENT_GAME = "current_game";
export const NICKNAME = "nickname";

export const GameContext: Context<GameContextData> = createContext({
    playerName: "",
    gameId: "",
    setContextData: (a, b) => {
    },
    clearContext: () => {
    }
})

export function GameContextProvider({children}: { children: ReactNode }) {
    const [playerName, setPlayerName] = useState<string>(localStorage.getItem(NICKNAME) ?? "")
    const [gameId, setGameId] = useState<string>(localStorage.getItem(CURRENT_GAME) ?? "")

    function setContextData(playerName: string, gameId: string) {
        setPlayerName(playerName)
        setGameId(gameId)
        localStorage.setItem(NICKNAME, playerName)
        localStorage.setItem(CURRENT_GAME, gameId)
    }

    function clearContext() {
        setPlayerName("")
        setGameId("")
        localStorage.removeItem(NICKNAME)
        localStorage.removeItem(CURRENT_GAME)
    }

    return (
        <GameContext value={{playerName, gameId, setContextData, clearContext}}>
            {children}
        </GameContext>
    )
}