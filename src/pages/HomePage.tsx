import {JSX} from "react";
import {Link} from "react-router-dom";

export default function HomePage(): JSX.Element {
    return <div>
        <h1>This is a Home Page</h1><br/>
        <Link to="/game"><button>New Game</button></Link>
    </div>
}