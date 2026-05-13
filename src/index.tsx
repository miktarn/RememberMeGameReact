import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {GameStateRoutingFilter} from "./RouterUtill";
// @ts-ignore
import "./styles.css";
import NotFoundPage from './pages/NotFoundPage';
import GameScreen from "./pages/GameScreen";
import HomePage from "./pages/HomePage";

const root = createRoot(document.getElementById("root") as HTMLElement);

const router = createBrowserRouter([
    {
        element: <GameStateRoutingFilter requiredGameState={true} redirectTo={"/"}/>,
        children: [
            {path: '/game', element: <GameScreen/>}
        ]
    },
    {
        element: <GameStateRoutingFilter requiredGameState={false} redirectTo={"/game"}/>,
        children: [
            {path: '/', element: <HomePage/>, errorElement: <NotFoundPage/>}
        ]
    }
]);


root.render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
);