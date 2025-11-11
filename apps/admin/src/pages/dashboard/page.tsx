import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Dashboard Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                Bem-vindo de volta! Aqui está um resumo das suas atividades.
                            </p>
                        </div>

                        {/* Stats Cards */}
                        {/* <StatsCards /> */}

                        {/* Charts and Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                            <div className="lg:col-span-2">{/* <Charts /> */}</div>
                            <div>{/* <RecentActivity /> */}</div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
