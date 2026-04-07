import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Home, Search } from 'lucide-react'

export default function Builders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [builders, setBuilders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [followingIds, setFollowingIds] = useState([])

  useEffect(() => {
    fetchBuilders()
  }, [])

  const fetchBuilders = async () => {
    const [{ data: profiles }, { data: follows }] = await Promise.all([
      supabase.from('profiles').select('*, projects(count)').neq('id', user?.id),
      supabase.from('follows').select('following_id').eq('follower_id', user?.id)
    ])
    setBuilders(profiles || [])
    setFollowingIds(follows?.map(f => f.following_id) || [])
    setLoading(false)
  }

  const handleFollow = async (profileId) => {
    if (followingIds.includes(profileId)) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profileId)
      setFollowingIds(prev => prev.filter(id => id !== profileId))
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profileId })
      await supabase.from('notifications').insert({
        user_id: profileId,
        from_user_id: user.id,
        type: 'follow',
        project_id: null
      })
      setFollowingIds(prev => [...prev, profileId])
    }
  }

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'

  const filtered = builders.filter(b =>
    b.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">

        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
          <Home size={16} /> Home
        </button>

        <h1 className="text-2xl font-bold mb-6">All Builders</h1>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search builders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(builder => (
              <div key={builder.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${builder.id}`)}>
                    {builder.avatar_url ? (
                      <img src={builder.avatar_url} alt={builder.full_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                        {initials(builder.full_name)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{builder.full_name}</p>
                      <p className="text-xs text-gray-400">@{builder.username}</p>
                      {builder.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{builder.bio}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow(builder.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex-shrink-0 ${followingIds.includes(builder.id) ? 'bg-gray-700 text-gray-400' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                    {followingIds.includes(builder.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}