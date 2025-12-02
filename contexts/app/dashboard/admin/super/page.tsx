// app/dashboard/admin/super/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Invitation {
  id: string;
  email: string;
  adminLevel: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/admin/invitations');
      const data = await response.json();
      setInvitations(data.invitations);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  const sendInvitation = async (formData: { email: string; adminLevel: string; ttl: number }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to send invitation');
      
      setShowInviteForm(false);
      fetchInvitations();
    } catch (error) {
      console.error('Failed to send invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-600">Welcome, {user?.firstName}!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-indigo-600">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Markets</h3>
          <p className="text-3xl font-bold text-green-600">45</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Pending KYC</h3>
          <p className="text-3xl font-bold text-yellow-600">23</p>
        </div>
      </div>

      {/* Invitations Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Admin Invitations</h2>
            <button
              onClick={() => setShowInviteForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Invite Admin
            </button>
          </div>
        </div>

        {showInviteForm && (
          <InviteForm
            onSubmit={sendInvitation}
            onCancel={() => setShowInviteForm(false)}
            isLoading={isLoading}
          />
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invitation.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invitation.adminLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${invitation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${invitation.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : ''}
                      ${invitation.status === 'EXPIRED' ? 'bg-red-100 text-red-800' : ''}`}
                    >
                      {invitation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InviteForm({ onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    email: '',
    adminLevel: 'MARKET_MASTER',
    ttl: 24,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Admin Level</label>
          <select
            value={formData.adminLevel}
            onChange={(e) => setFormData({ ...formData, adminLevel: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="NATIONAL_ADMIN">National Admin</option>
            <option value="DISTRICT_ADMIN">District Admin</option>
            <option value="CITY_ADMIN">City Admin</option>
            <option value="MARKET_MASTER">Market Master</option>
            <option value="PSEUDO_MARKET_MASTER">Pseudo Market Master</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Link Expiry (Hours)
          </label>
          <input
            type="number"
            value={formData.ttl}
            onChange={(e) => setFormData({ ...formData, ttl: parseInt(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}