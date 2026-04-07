import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { MessageCircle, Plus, Zap, Trophy, LogOut, User, Search, Bookmark, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, profile, signOut, fetchProfile } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [followingIds, setFollowingIds] = useState([])
  const [savedIds, setSavedIds] = useState([])
  const [counts, setCounts] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
    if (user) fetchProfile(user.id)
  }, [])

  const fetchProjects = async () => {
    const [{ data: projectsData }, { data: followData }, { data: savedData }] = await Promise.all([
      supabase.from('projects').select(`*, profiles(full_name, username, avatar_url)`).order('created_at', { ascending: false }),
      supabase.from('follows').select('following_id').eq('follower_id', user?.id),
      supabase.from('saved_projects').select('project_id').eq('user_id', user?.id),
    ])
    if (projectsData) {
      setProjects(projectsData)
      fetchCounts(projectsData)
    }
    if (followData) setFollowingIds(followData.map(f => f.following_id))
    if (savedData) setSavedIds(savedData.map(s => s.project_id))
    setLoading(false)
  }

  const fetchCounts = async (projectsList) => {
    const ids = projectsList.map(p => p.id)
    const [{ data: likesData }, { data: commentsData }, { data: collabsData }] = await Promise.all([
      supabase.from('likes').select('project_id').in('project_id', ids),
      supabase.from('comments').select('project_id').in('project_id', ids),
      supabase.from('collaborations').select('project_id').in('project_id', ids),
    ])
    const newCounts = {}
    ids.forEach(id => {
      newCounts[id] = {
        likes: likesData?.filter(l => l.project_id === id).length || 0,
        comments: commentsData?.filter(c => c.project_id === id).length || 0,
        collabs: collabsData?.filter(c => c.project_id === id).length || 0,
      }
    })
    setCounts(newCounts)
  }

  const handleSaveFromFeed = async (e, projectId) => {
    e.stopPropagation()
    if (savedIds.includes(projectId)) {
      await supabase.from('saved_projects').delete().eq('project_id', projectId).eq('user_id', user.id)
      setSavedIds(savedIds.filter(id => id !== projectId))
      toast.success('Removed from saved')
    } else {
      await supabase.from('saved_projects').insert({ project_id: projectId, user_id: user.id })
      setSavedIds([...savedIds, projectId])
      toast.success('Project saved!')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const filteredProjects = projects.filter(p => {
    const matchesFilter = activeFilter === 'All' ? true :
      activeFilter === 'Following' ? followingIds.includes(p.user_id) :
      activeFilter === 'Collab' ? p.need_help === true :
      activeFilter === 'Saved' ? savedIds.includes(p.id) : true
    const matchesSearch = searchQuery === '' ? true :
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tech_stack?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const stageColor = (stage) => {
    const colors = {
      Planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Building: 'bg-green-500/10 text-green-400 border-green-500/20',
      Testing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      Completed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }
    return colors[stage] || colors.Planning
  }

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">
            <span className="text-green-500">&lt;/&gt;</span>{' '}
            <span className="text-white">Mzansi</span>
            <span className="text-green-500">Builds</span>
          </h1>
        </div>

        {/* Profile */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            onClick={() => navigate(`/profile/${user?.id}`)}>
            {profile?.avatar_url ? (
              <img src={`${profile.avatar_url}?t=${Date.now()}`} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                {initials(profile?.full_name || user?.email)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">{profile?.full_name || 'Builder'}</p>
              <p className="text-xs text-gray-500">@{profile?.username || 'user'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 flex-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm">
            <Zap size={16} /> Feed
          </button>
          <button onClick={() => setShowCreateModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 text-sm transition">
            <Plus size={16} /> Create Project
          </button>
          <button onClick={() => navigate('/celebration')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 text-sm transition">
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

      {/* Main content */}
      <div className="ml-64 flex-1 flex flex-col">

        {/* Sticky search header */}
        <div className="sticky top-0 z-10 bg-black border-b border-gray-800 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search projects, developers, skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 transition"
              />
            </div>
            {/* Notification bell */}
            <NotificationBell userId={user?.id} onClick={() => navigate('/notifications')} />
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition">
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>

        {/* Main feed */}
        <div className="flex-1 flex">
          <div className="flex-1 px-6 py-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Zap size={20} className="text-green-500" /> Developer Feed
                </h2>
                <p className="text-gray-500 text-sm mt-1">See what developers are building</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {['All', 'Following', 'Collab', 'Saved'].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition ${activeFilter === f ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'text-gray-400 border-gray-700 hover:border-gray-500'}`}>
                  {f === 'Collab' ? 'Seeking Collab' : f === 'Saved' ? <span className="flex items-center gap-1"><Bookmark size={12} /> Saved</span> : f}
                </button>
              ))}
            </div>

            {/* Feed */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg mb-2">No projects yet</p>
                <p className="text-sm">
                  {activeFilter === 'Following' ? 'Follow some developers to see their projects here!' :
                   activeFilter === 'Saved' ? 'Save some projects to see them here!' :
                   "Be the first to share what you're building!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map(project => (
                  <div key={project.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition cursor-pointer"
                    onClick={() => navigate(`/project/${project.id}`)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
                          {initials(project.profiles?.full_name || 'U')}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{project.profiles?.full_name}</p>
                          <p className="text-xs text-gray-500">@{project.profiles?.username} · {timeAgo(project.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Bookmark icon */}
                        <button
                          onClick={e => handleSaveFromFeed(e, project.id)}
                          className={`p-1.5 rounded-lg transition ${savedIds.includes(project.id) ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}>
                          <Bookmark size={16} fill={savedIds.includes(project.id) ? 'currentColor' : 'none'} />
                        </button>
                        <span className={`text-xs px-2 py-1 rounded-full border ${stageColor(project.stage)}`}>
                          {project.stage}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-white mb-1">{project.title}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>

                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tech_stack.map(tech => (
                          <span key={tech} className="text-xs text-gray-400 border border-gray-700 rounded px-2 py-0.5">#{tech}</span>
                        ))}
                      </div>
                    )}

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span><span>{project.progress}%</span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full">
                        <div className="h-1 bg-green-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>

                    {project.need_help && (
                      <div className="flex items-center gap-2 mb-3 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                        ✋ Needs collaborators
                        {project.help_description && <span className="text-gray-400">— {project.help_description}</span>}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                      <div className="flex items-center gap-4 text-gray-500 text-sm">
                        <button className="flex items-center gap-1 hover:text-red-400 transition" onClick={e => { e.stopPropagation(); navigate(`/project/${project.id}`) }}>
                          ❤️ <span>{counts[project.id]?.likes || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-400 transition" onClick={e => { e.stopPropagation(); navigate(`/project/${project.id}`) }}>
                          <MessageCircle size={14} /> <span>{counts[project.id]?.comments || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-green-400 transition" onClick={e => { e.stopPropagation(); navigate(`/project/${project.id}`) }}>
                          ✋ <span>{counts[project.id]?.collabs || 0}</span>
                        </button>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/project/${project.id}`) }}
                        className="text-xs border border-gray-700 hover:border-green-500 hover:text-green-400 text-gray-400 px-3 py-1.5 rounded-lg transition">
                        View Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-72 px-6 py-8 hidden lg:block">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
              <h3 className="font-semibold text-white mb-4">Trending Skills</h3>
              {['React', 'Next.js', 'TypeScript', 'Python', 'Tailwind CSS'].map((skill, i) => (
                <div key={skill} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                  <span className="text-sm text-gray-300">{skill}</span>
                  <span className="text-xs text-gray-500">{(5 - i) * 120 + 200} projects</span>
                </div>
              ))}
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-2">Build in public.</h3>
              <p className="text-gray-400 text-sm mb-4">Share your progress, get feedback, and find your next collaborator.</p>
              <button onClick={() => setShowCreateModal(true)} className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-2 rounded-lg text-sm transition">
                Start a Project
              </button>
            </div>

            <WhoToFollow currentUserId={user?.id} followingIds={followingIds} onFollow={fetchProjects} navigate={navigate} />
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} onCreated={() => { setShowCreateModal(false); fetchProjects() }} userId={user?.id} />}
    </div>
  )
}


function NotificationBell({ userId, onClick }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!userId) return
    const fetchCount = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('read', false)
      setCount(data?.length || 0)
    }
    fetchCount()

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, () => fetchCount())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  return (
    <button onClick={onClick} className="relative p-2 rounded-lg border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white transition">
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-black text-xs font-bold flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}



function CreateProjectModal({ onClose, onCreated, userId }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState('Planning')
  const [techStack, setTechStack] = useState('')
  const [needHelp, setNeedHelp] = useState(false)
  const [helpDescription, setHelpDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    const techArray = techStack.split(',').map(t => t.trim()).filter(Boolean)
    const { error } = await supabase.from('projects').insert({
      user_id: userId,
      title,
      description,
      stage,
      tech_stack: techArray,
      need_help: needHelp,
      help_description: helpDescription,
      progress: 0,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Project created!')
      onCreated()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold">Create New Project</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Project Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. AI Chat App"
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What are you building?"
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500">
                <option>Planning</option>
                <option>Building</option>
                <option>Testing</option>
                <option>Completed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Tech Stack</label>
              <input value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="React, Node.js, ..."
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setNeedHelp(!needHelp)}
              className={`w-10 h-6 rounded-full transition-colors ${needHelp ? 'bg-green-500' : 'bg-gray-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full mx-auto transition-transform ${needHelp ? 'translate-x-2' : '-translate-x-2'}`} />
            </button>
            <label className="text-sm text-gray-400">I'm looking for collaborators</label>
          </div>
          {needHelp && (
            <input value={helpDescription} onChange={e => setHelpDescription(e.target.value)} placeholder="e.g. Frontend Developer, Designer, Tester"
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  )
}

function WhoToFollow({ currentUserId, followingIds, onFollow, navigate }) {
  const [suggestions, setSuggestions] = useState([])
  const [localFollowing, setLocalFollowing] = useState([])

  useEffect(() => {
    setLocalFollowing(followingIds)
  }, [followingIds])

  useEffect(() => {
    if (!currentUserId) return
    const fetchSuggestions = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUserId)
        .limit(5)
      setSuggestions(data || [])
    }
    fetchSuggestions()
  }, [currentUserId])

  const handleFollow = async (profileId) => {
    if (localFollowing.includes(profileId)) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', profileId)
      setLocalFollowing(prev => prev.filter(id => id !== profileId))
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: profileId })
      await supabase.from('notifications').insert({
        user_id: profileId,
        from_user_id: currentUserId,
        type: 'follow',
        project_id: null
      })
      setLocalFollowing(prev => [...prev, profileId])
    }
    onFollow()
  }

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'

  if (suggestions.length === 0) return null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-white">Who to Follow</h3>
        <button onClick={() => navigate('/builders')} className="text-green-400 text-sm hover:underline">
          View all
        </button>
      </div>
      {suggestions.map(profile => (
        <div key={profile.id} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${profile.id}`)}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
                {initials(profile.full_name)}
              </div>
            )}
            <div>
              <p className="text-sm text-white font-medium">{profile.full_name}</p>
              <p className="text-xs text-gray-400">@{profile.username}</p>
            </div>
          </div>
          <button
            onClick={() => handleFollow(profile.id)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${localFollowing.includes(profile.id) ? 'bg-gray-700 text-gray-400' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
            {localFollowing.includes(profile.id) ? 'Following' : 'Follow'}
          </button>
        </div>
      ))}
    </div>
  )
}