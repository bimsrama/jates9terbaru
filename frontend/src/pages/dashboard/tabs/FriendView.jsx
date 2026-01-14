import React, { useState } from 'react';
import { Search, UserPlus, MoreHorizontal, MessageCircle } from 'lucide-react';

const FriendView = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy data untuk teman
  const friends = [
    { id: 1, name: 'Sarah Wilson', role: 'UI Designer', status: 'online', avatar: 'SW' },
    { id: 2, name: 'Budi Santoso', role: 'Developer', status: 'offline', avatar: 'BS' },
    { id: 3, name: 'Jessica Lee', role: 'Project Manager', status: 'online', avatar: 'JL' },
    { id: 4, name: 'Mike Chen', role: 'DevOps', status: 'busy', avatar: 'MC' },
  ];

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Friends</h2>
          <p className="text-gray-500 text-sm">Manage your connections</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search friends..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Friend</span>
          </button>
        </div>
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFriends.map((friend) => (
          <div key={friend.id} className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {friend.avatar}
                  </div>
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    friend.status === 'online' ? 'bg-green-500' : 
                    friend.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{friend.name}</h3>
                  <p className="text-sm text-gray-500">{friend.role}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <MessageCircle className="h-4 w-4" />
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendView;
