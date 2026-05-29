import {Link} from 'react-router-dom';
import {JSX} from "react";

export default function NotFoundPage(): JSX.Element {
    return (
        <div>
            <h1>404 Not Found</h1><br/>
            <Link to="/"><button>Back to home page</button></Link>
        </div>
    );
}