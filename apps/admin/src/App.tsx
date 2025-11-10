import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { useTheme } from './hooks/useTheme';

function App() {
    // Initialize theme hook to set up dark mode class
    useTheme();

    declare const __BASE_PATH__: string;

    return (
        <BrowserRouter basename={__BASE_PATH__}>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;
