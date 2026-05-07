import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider} from "react-router-dom";
// @ts-ignore
import "./styles.css";
import NotFoundPage from './pages/NotFoundPage';
import GameScreen from "./pages/GameScreen";
import HomePage from "./pages/HomePage";

const root = createRoot(document.getElementById("root") as HTMLElement);

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
        errorElement: <NotFoundPage />
    },
    {
        path: '/game',
        element: <GameScreen />
    }
]);


root.render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);