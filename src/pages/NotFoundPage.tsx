import {Link} from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div>
            <h1>404 Not Found</h1><br/>
            <Link to="/"><button>Back to home page</button></Link>
        </div>
    );
}