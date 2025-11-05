import './app.css';
import { Button } from '@ui';

export function App() {
    return (
        <div className="app-shell">
            <header>
                <h1>DAEx Admin</h1>
            </header>
            <main>
                <p>
                    This scaffold lives in <code>apps/admin</code> and ships with its own Vite
                    configuration. Add routes, layout primitives, and fetch data from the API
                    project as needed.
                </p>
                <div className="demo-actions">
                    <Button>Primary action</Button>
                    <Button variant="secondary">Secondary action</Button>
                </div>
            </main>
        </div>
    );
}

export default App;
