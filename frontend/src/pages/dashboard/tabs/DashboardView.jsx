import React, { useState, useEffect } from 'react';
import { Activity, Users, Award, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';

const DashboardView = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('token');
        // Menggunakan endpoint yang ada di main.py Anda
        const response = await axios.get('/api/dashboard/user/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Fallback jika data kosong
  const user = stats?.user || {};
  const finance = stats?.financial || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Halo, {user.name || 'User'}! 👋</h2>
            <p className="text-blue-100 mt-1">
              Hari ke-{user.progress_day || 1} dari tantangan kesehatan Anda.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
            <span className="font-semibold">{user.badge || 'Newbie'} Member</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Challenge Progress */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Activity className="h-6 w-6" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Challenge Day</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{user.challenge_day || 1} <span className="text-sm font-normal text-gray-400">/ 30</span></h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${Math.min(((user.challenge_day || 1) / 30) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Referrals */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Total Referral</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{finance.total_referrals || 0} <span className="text-sm font-normal text-gray-400">Orang</span></h3>
          <p className="text-xs text-gray-400 mt-2">Kode: {user.referral_code || '-'}</p>
        </div>

        {/* Card 3: Commission */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <Award className="h-6 w-6" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Komisi Diterima</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            Rp {(finance.commission_approved || 0).toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-green-500 mt-2 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" /> Siap dicairkan
          </p>
        </div>
      </div>

      {/* Recent Activity / Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          Status Kesehatan
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600 text-sm">Target Harian</span>
            <span className="text-green-600 font-medium text-sm bg-green-100 px-3 py-1 rounded-full">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600 text-sm">Missed Days</span>
            <span className="text-red-500 font-medium text-sm">{user.missed_days || 0} Hari</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
