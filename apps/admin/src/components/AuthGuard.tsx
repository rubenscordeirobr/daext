import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceAuth from '../services/AuthService';
import { useToast } from '../hooks/useToast';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard(props: AuthGuardProps) {
    const { children = null } = props ?? {};
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        const checkAuth = () => {
            const session = ServiceAuth.getSession();

            if (!session) {
                addToast({ message: 'Sessão expirada, faça login novamente', type: 'info' });
                navigate('/login');
                return;
            }

            // Verificar se a sessão está próxima do vencimento (30 minutos antes)
            const expiresAt = new Date(session.expiresAt);
            const now = new Date();
            const thirtyMinutes = 30 * 60 * 1000;

            if (expiresAt.getTime() - now.getTime() < thirtyMinutes) {
                // Aqui poderia renovar a sessão automaticamente
                console.log('Sessão próxima do vencimento');
            }
        };

        checkAuth();

        // Verificar a cada 5 minutos
        const interval = setInterval(checkAuth, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [navigate, addToast]);

    // Verificação inicial
    if (!ServiceAuth.isAuthenticated()) {
        return null; // O useEffect já redirecionará
    }

    return <>{children}</>;
}
