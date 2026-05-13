import {Navigate, Outlet} from 'react-router-dom';

const CURRENT_GAME = "current_game";

interface GameGuardProps {
    requiredGameState: boolean;
    redirectTo: string;
}

export const GameStateRoutingFilter = ({requiredGameState, redirectTo}: GameGuardProps) => {
    const hasGame = localStorage.getItem(CURRENT_GAME) !== null;

    if (hasGame !== requiredGameState) {
        return <Navigate to={redirectTo} replace/>;
    }

    return <Outlet/>;
};
