import {Navigate, Outlet} from 'react-router-dom';
import {useContext} from "react";
import {GameContext} from "./GameContext";

interface GameGuardProps {
    requiredGameState: boolean;
    redirectTo: string;
}

export const GameStateRoutingFilter = ({requiredGameState, redirectTo}: GameGuardProps) => {
    const GameContextData = useContext(GameContext)
    const hasGame = GameContextData.playerName !== ""
    if (hasGame !== requiredGameState) {
        return <Navigate to={redirectTo} replace/>;
    }

    return <Outlet/>;
};
