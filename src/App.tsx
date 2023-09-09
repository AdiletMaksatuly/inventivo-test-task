import './App.css'
import {Route, Routes} from "react-router-dom";
import {routes} from "./routes.tsx";

function App() {
  return (
    <main>
        <Routes>
            {routes.map((route) =>
                <Route key={route.path} {...route} />)}
        </Routes>
    </main>
  )
}

export default App
