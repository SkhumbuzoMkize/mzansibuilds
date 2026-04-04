import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Edit2, Save, X, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { id } = useParams()
  const { user, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarKey, setAvatarKey] = useState(Date.now())
  const [form, setForm] = useState({ full_name: '', username: '', bio: '' })

  const isOwner = user?.id === id

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    const [{ data: prof }, { data: projs }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('projects').select('*').eq('user_id', id).order('created_at', { ascending: false })
    ])
    setProfile(prof)
    setProjects(projs || [])
    setForm({ full_name: prof?.full_name || '', username: prof?.username || '', bio: prof?.bio || '' })
    setLoading(false)
  }

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, username: form.username, bio: form.bio })
      .eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated!')
      setEditing(false)
      fetchAll()
      fetchProfile(id)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })
      if (uploadError) {
        toast.error(uploadError.message)
        return
      }
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)
      if (updateError) {
        toast.error(updateError.message)
        return
      }
      toast.success('Profile picture updated!')
      setAvatarKey(Date.now())
      fetchAll()
      fetchProfile(user.id)
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'

  const stageColor = (stage) => {
    const colors = {
      Planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Building: 'bg-green-500/10 text-green-400 border-green-500/20',
      Testing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      Completed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }
    return colors[stage] || colors.Planning
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-10 py-8">

        {/* Back */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
          <ArrowLeft size={16} /> Back to Feed
        </button>

        {/* Profile card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">

              {/* Avatar */}
              <div className="relative w-24 h-24">
                {profile?.avatar_url ? (
                  <img
                    key={avatarKey}
                    src={`${profile.avatar_url}?t=${avatarKey}`}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-3xl">
                    {initials(profile?.full_name)}
                  </div>
                )}
                {isOwner && (
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center cursor-pointer transition border-2 border-black">
                    {uploading ? (
                      <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera size={12} className="text-black" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                )}
              </div>

              <div>
                {editing ? (
                  <div className="space-y-2">
                    <input
                      value={form.full_name}
                      onChange={e => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Full name"
                      className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 block w-full"
                    />
                    <input
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      placeholder="Username"
                      className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 block w-full"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">{profile?.full_name}</h2>
                    <p className="text-gray-400">@{profile?.username}</p>
                    <p className="text-xs text-gray-500 mt-1">Member since {new Date(profile?.created_at).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition">
                      <Save size={14} /> Save
                    </button>
                    <button onClick={() => setEditing(false)} className="flex items-center gap-2 border border-gray-700 text-gray-400 px-4 py-2 rounded-lg text-sm transition">
                      <X size={14} /> Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-400 px-4 py-2 rounded-lg text-sm transition">
                    <Edit2 size={14} /> Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bio */}
          {editing ? (
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell the community about yourself..."
              rows={3}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500 resize-none mb-4"
            />
          ) : (
            <p className="text-gray-400 text-sm mb-6">{profile?.bio || 'No bio yet. Click Edit Profile to add one!'}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{projects.length}</p>
              <p className="text-xs text-gray-500 mt-1">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-400">{projects.filter(p => p.stage === 'Completed').length}</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-blue-400">{projects.filter(p => p.need_help).length}</p>
              <p className="text-xs text-gray-500 mt-1">Seeking collab</p>
            </div>
          </div>
        </div>

        {/* Projects */}
        <h3 className="text-lg font-semibold mb-4">Projects</h3>
        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No projects yet.</p>
            {isOwner && (
              <button onClick={() => navigate('/dashboard')} className="mt-4 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-2 rounded-lg text-sm transition">
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {projects.map(project => (
              <div key={project.id} onClick={() => navigate(`/project/${project.id}`)}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{project.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full border ${stageColor(project.stage)}`}>{project.stage}</span>
                </div>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
                {project.tech_stack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tech_stack.map(tech => (
                      <span key={tech} className="text-xs text-gray-400 border border-gray-700 rounded px-2 py-0.5">#{tech}</span>
                    ))}
                  </div>
                )}
                <div className="h-1 bg-gray-800 rounded-full">
                  <div className="h-1 bg-green-500 rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{project.progress}% complete</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}