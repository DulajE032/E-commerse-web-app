"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { FiUsers, FiSearch } from 'react-icons/fi';

const Users = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await api.getUsers(token);
        if (isMounted) {
          setUsers(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load users.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (token) {
      loadUsers();
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        (user.full_name || '').toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query)
    );
  }, [users, search]);

  if (!token) {
    return <div className="text-gray-300">Please log in as an admin to view users.</div>;
  }

  if (loading) {
    return <div className="text-gray-300">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiUsers /> Users
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg pl-10 pr-4 py-2 w-full md:w-64 focus:outline-none focus:border-indigo-500"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="text-left px-6 py-4 font-medium">ID</th>
                <th className="text-left px-6 py-4 font-medium">Name</th>
                <th className="text-left px-6 py-4 font-medium">Email</th>
                <th className="text-left px-6 py-4 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="text-gray-200 hover:bg-gray-700/30 transition">
                  <td className="px-6 py-4 font-mono text-gray-400">#{user.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{user.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        user.role === 'admin'
                          ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                          : 'bg-green-500/10 text-green-300 border border-green-500/20'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredUsers.length && (
            <div className="text-center text-gray-400 py-8">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
