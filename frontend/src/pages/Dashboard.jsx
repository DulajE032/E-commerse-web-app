import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
                <p className="text-gray-600 mb-8">Welcome back, {user?.full_name || 'User'}.</p>
                <div className="p-6 bg-blue-50 text-blue-800 rounded-xl mb-8 border border-blue-100 text-left space-y-1">
                    <p className="text-sm"><span className="font-semibold">Name:</span> {user?.full_name}</p>
                    <p className="text-sm"><span className="font-semibold">Email:</span> {user?.email}</p>
                    <p className="text-sm"><span className="font-semibold">Role:</span> {user?.role}</p>
                    <p className="font-mono text-xs break-all pt-2">Token: {token || 'None'}</p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="w-full bg-gray-900 text-white rounded-lg py-3 font-medium hover:bg-gray-800 transition-colors"
                >
                    Log Out
                </button>
            </div>
        </div>
    )
}

export default Dashboard;
