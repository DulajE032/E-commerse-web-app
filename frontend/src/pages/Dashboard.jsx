import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
                <p className="text-gray-600 mb-8">Welcome to your placeholder dashboard! You have successfully logged in.</p>
                <div className="p-6 bg-blue-50 text-blue-800 rounded-xl mb-8 border border-blue-100">
                    <p className="font-mono text-sm break-all">Token: {localStorage.getItem('token') || 'None'}</p>
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