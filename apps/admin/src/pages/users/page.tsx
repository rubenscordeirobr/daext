import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import UserTable from './components/UserTable';
import UserModal from './components/UserModal';
import UserFilters from './components/UserFilters';

export default function Users() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-primary-50">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Users Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-primary-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
                                <p className="text-gray-600 mt-2">
                                    Gerencie todos os usuários do sistema
                                </p>
                            </div>
                            <button
                                onClick={handleAddUser}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer"
                            >
                                <i className="ri-add-line"></i>
                                Adicionar Usuário
                            </button>
                        </div>

                        {/* Filters */}
                        <UserFilters
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                        />

                        {/* Users Table */}
                        <UserTable
                            searchTerm={searchTerm}
                            statusFilter={statusFilter}
                            onEditUser={handleEditUser}
                        />
                    </div>
                </main>
            </div>

            {/* User Modal */}
            {modalOpen && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setModalOpen(false)}
                    onSave={() => {
                        setModalOpen(false);
                        // Refresh table data
                    }}
                />
            )}
        </div>
    );
}
