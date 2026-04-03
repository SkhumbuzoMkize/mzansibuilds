import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Plus, Heart, HandMetal, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [comments, setComments] = useState([])
  const [milestones, setMilestones] = useState([])
  const [newComment, setNewComment] = useState('')
  const [newMilestone, setNewMilestone] = useState('')
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [raised, setRaised] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    const [{ data: proj }, { data: comms }, { data: miles }, { data: likeData }, { data: collabData }] = await Promise.all([
      supabase.from('projects').select('*, profiles(full_name, username)').eq('id', id).single(),
      supabase.from('comments').select('*, profiles(full_name, username)').eq('project_id', id).order('created_at'),
      supabase.from('milestones').select('*').eq('project_id', id).order('created_at'),
      supabase.from('likes').select('id').eq('project_id', id).eq('user_id', user?.id),
      supabase.from('collaborations').select('id').eq('project_id', id).eq('user_id', user?.id),
    ])
    setProject(proj)
    setComments(comms || [])
    setMilestones(miles || [])
    setLiked(likeData?.length > 0)
    setRaised(collabData?.length > 0)
    setLoading(false)
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const { error } = await supabase.from('comments').insert({
      project_id: id, user_id: user.id, content: newComment
    })
    if (!error) { setNewComment(''); fetchAll() }
    else toast.error(error.message)
  }

  const handleAddMilestone = async (e) => {
    e.preventDefault()
    if (!newMilestone.trim()) return
    const { error } = await supabase.from('milestones').insert({
      project_id: id, title: newMilestone
    })
    if (!error) { setNewMilestone(''); fetchAll() }
    else toast.error(error.message)
  }

  const handleMilestoneStatus = async (milestone) => {
    const next = { Planned: 'In Progress', 'In Progress': 'Completed', Completed: 'Planned' }
    await supabase.from('milestones').update({ status: next[milestone.status] }).eq('id', milestone.id)
    fetchAll()
  }

  const handleLike = async () => {
    if (liked) {
      await supabase.from('likes').delete().eq('project_id', id).eq('user_id', user.id)
    } else {
      await supabase.from('likes').insert({ project_id: id, user_id: user.id })
    }
    setLiked(!liked)
  }

  const handleRaiseHand = async () => {
    if (raised) return
    const { error } = await supabase.from('collaborations').insert({ project_id: id, user_id: user.id })
    if (!error) { setRaised(true); toast.success('Collaboration request sent!') }
    else toast.error(error.message)
  }

  const handleComplete = async () => {
    await supabase.from('projects').update({ stage: 'Completed', progress: 100 }).eq('id', id)
    toast.success('Project marked as completed! 🎉')
    fetchAll()
  }

  const updateProgress = async (progress) => {
    await supabase.from('projects').update({ progress }).eq('id', id)
    fetchAll()
  }

  const stageColor = (stage) => {
    const colors = {
      Planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Building: 'bg-green-500/10 text-green-400 border-green-500/20',
      Testing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      Completed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }
    return colors[stage] || colors.Planning
  }

  const milestoneColor = (status) => {
    const colors = {
      Planned: 'text-gray-400 border-gray-700',
      'In Progress': 'text-yellow-400 border-yellow-500/30',
      Completed: 'text-green-400 border-green-500/30',
    }
    return colors[status]
  }

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const isOwner = user?.id === project?.user_id

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!project) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Project not found
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Back */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
          <ArrowLeft size={16} /> Back to Feed
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main */}
          <div className="lg:col-span-2 space-y-5">

            {/* Project header */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                    {initials(project.profiles?.full_name)}
                  </div>
                  <div>
                    <p className="font-medium">{project.profiles?.full_name}</p>
                    <p className="text-xs text-gray-500">@{project.profiles?.username}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border ${stageColor(project.stage)}`}>
                  {project.stage}
                </span>
              </div>

              <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
              <p className="text-gray-400 mb-4">{project.description}</p>

              {project.tech_stack?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech_stack.map(tech => (
                    <span key={tech} className="text-xs text-gray-400 border border-gray-700 rounded px-2 py-1">#{tech}</span>
                  ))}
                </div>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-green-400 font-medium">{project.progress}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full mb-2">
                  <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                </div>
                {isOwner && (
                  <input type="range" min="0" max="100" value={project.progress}
                    onChange={e => updateProgress(parseInt(e.target.value))}
                    className="w-full accent-green-500" />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition ${liked ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-gray-400 border-gray-700 hover:border-gray-500'}`}>
                  <Heart size={14} /> Like
                </button>
                <button onClick={handleRaiseHand} disabled={raised} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition ${raised ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-gray-400 border-gray-700 hover:border-gray-500'}`}>
                  <HandMetal size={14} /> {raised ? 'Hand Raised!' : 'Raise Hand'}
                </button>
                {isOwner && project.stage !== 'Completed' && (
                  <button onClick={handleComplete} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border text-sm text-purple-400 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition">
                    Mark Complete 🎉
                  </button>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
              <div className="space-y-4 mb-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
                ) : comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0">
                      {initials(comment.profiles?.full_name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.profiles?.full_name}</span>
                        <span className="text-xs text-gray-500">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleComment} className="flex gap-3">
                <input value={newComment} onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
                <button type="submit" className="bg-green-500 hover:bg-green-400 text-black px-4 py-2.5 rounded-lg transition">
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* Milestones */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Milestones</h3>
              <div className="space-y-2 mb-4">
                {milestones.length === 0 ? (
                  <p className="text-gray-500 text-sm">No milestones yet</p>
                ) : milestones.map(m => (
                  <button key={m.id} onClick={() => isOwner && handleMilestoneStatus(m)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border text-sm transition ${milestoneColor(m.status)} ${isOwner ? 'hover:bg-gray-800 cursor-pointer' : ''}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === 'Completed' ? 'bg-green-400' : m.status === 'In Progress' ? 'bg-yellow-400' : 'bg-gray-600'}`} />
                    <span className="flex-1">{m.title}</span>
                    <span className="text-xs opacity-70">{m.status}</span>
                  </button>
                ))}
              </div>
              {isOwner && (
                <form onSubmit={handleAddMilestone} className="flex gap-2">
                  <input value={newMilestone} onChange={e => setNewMilestone(e.target.value)}
                    placeholder="Add milestone..."
                    className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                  <button type="submit" className="bg-green-500 hover:bg-green-400 text-black p-2 rounded-lg transition">
                    <Plus size={14} />
                  </button>
                </form>
              )}
            </div>

            {/* About */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-3">About this project</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Stage</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${stageColor(project.stage)}`}>{project.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Started</span>
                  <span className="text-gray-300">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                {project.need_help && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-xs font-medium mb-1">Needs Collaborators</p>
                    <p className="text-gray-400 text-xs">{project.help_description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}