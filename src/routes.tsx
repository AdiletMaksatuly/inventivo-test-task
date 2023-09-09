import {RouteProps} from "react-router-dom";
import HomePage from "./pages/Home";
import CameraPage from "./pages/Camera";

export const routes: RouteProps[] = [
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/camera',
        element: <CameraPage />,
    }
]
