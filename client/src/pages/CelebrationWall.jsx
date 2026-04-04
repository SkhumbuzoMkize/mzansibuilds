import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Trophy, ArrowLeft, Zap, Plus, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function CelebrationWall() {
  const { user, profile, signOut } = useAuth()
  const [completed, setCompleted] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCompleted()
  }, [])

  const fetchCompleted = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles(full_name, username)')
      .eq('stage', 'Completed')
      .order('updated_at', { ascending: false })
    if (!error) setCompleted(data)
    setLoading(false)
  }

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">
            <span className="text-green-500">&lt;/&gt;</span> MzansiBuilds
          </h1>
        </div>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
              {initials(profile?.full_name || user?.email)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{profile?.full_name || 'Builder'}</p>
              <p className="text-xs text-gray-500">@{profile?.username || 'user'}</p>
            </div>
          </div>
        </div>
        <nav className="p-4 flex-1 space-y-1">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 text-sm transition">
            <Zap size={16} /> Feed
          </button>
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 text-sm transition">
            <Plus size={16} /> Create Project
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm">
            <Trophy size={16} /> Celebration Wall
          </button>
          <button onClick={() => navigate(`/profile/${user?.id}`)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 text-sm transition">
            <User size={16} /> My Profile
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 text-sm transition">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-64 flex-1 px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <Trophy size={20} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Celebration Wall</h2>
            <p className="text-gray-500 text-sm">Honouring developers who ship and inspire others</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{completed.length}</p>
            <p className="text-gray-400 text-sm mt-1">Projects shipped</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{new Set(completed.map(p => p.user_id)).size}</p>
            <p className="text-gray-400 text-sm mt-1">Builders celebrated</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{completed.reduce((acc, p) => acc + (p.tech_stack?.length || 0), 0)}</p>
            <p className="text-gray-400 text-sm mt-1">Technologies used</p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : completed.length === 0 ? (
          <div className="text-center py-20">
            <Trophy size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No completed projects yet</p>
            <p className="text-gray-500 text-sm mb-6">Be the first to ship and get celebrated!</p>
            <button onClick={() => navigate('/dashboard')}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-2 rounded-lg text-sm transition">
              Start a project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {completed.map((project, index) => (
              <div key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-yellow-500/30 transition cursor-pointer relative overflow-hidden">

                {/* Top glow for first 3 */}
                {index < 3 && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500/0 via-yellow-500/60 to-yellow-500/0" />
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                    {initials(project.profiles?.full_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{project.profiles?.full_name}</p>
                    <p className="text-xs text-gray-500">@{project.profiles?.username}</p>
                  </div>
                  {index < 3 && (
                    <span className="ml-auto text-yellow-400 text-lg">★</span>
                  )}
                </div>

                <h3 className="font-semibold text-white mb-2">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>

                {project.tech_stack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tech_stack.map(tech => (
                      <span key={tech} className="text-xs text-gray-400 border border-gray-700 rounded px-2 py-0.5">#{tech}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-full">
                    Completed ✓
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">Want to be here?</p>
          <p className="text-gray-400 text-sm mb-4">Keep building and share your progress!</p>
          <button onClick={() => navigate('/dashboard')}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-2 rounded-lg text-sm transition">
            + New Project
          </button>
        </div>
      </div>
    </div>
  )
}