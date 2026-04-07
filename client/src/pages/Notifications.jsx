import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Home, Heart, MessageCircle, UserPlus, HandMetal, Bell } from 'lucide-react'

export default function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    markAllRead()
  }, [])

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, from_user:from_user_id(full_name, username, avatar_url), project:project_id(title)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    if (!error) setNotifications(data || [])
    setLoading(false)
  }

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user?.id)
      .eq('read', false)
  }

  const getIcon = (type) => {
    const icons = {
      like: <Heart size={16} className="text-red-400" />,
      comment: <MessageCircle size={16} className="text-blue-400" />,
      collab: <span className="text-sm">✋</span>,
      follow: <UserPlus size={16} className="text-green-400" />,
    }
    return icons[type] || <Bell size={16} />
  }

  const getMessage = (n) => {
    const name = n.from_user?.full_name || 'Someone'
    const messages = {
      like: `${name} liked your project "${n.project?.title}"`,
      comment: `${name} commented on "${n.project?.title}"`,
      collab: `${name} raised their hand on "${n.project?.title}"`,
      follow: `${name} started following you`,
    }
    return messages[n.type] || 'New notification'
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-8">

        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
          <Home size={16} /> Home
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Bell size={20} className="text-green-500" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Bell size={40} className="mx-auto mb-4 text-gray-700" />
            <p className="text-lg mb-1">No notifications yet</p>
            <p className="text-sm">When someone likes or comments on your projects, you'll see it here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id}
                onClick={() => n.project_id && navigate(`/project/${n.project_id}`)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition cursor-pointer ${!n.read ? 'bg-gray-900 border-green-500/20' : 'bg-gray-900 border-gray-800'} hover:border-gray-600`}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
                    {initials(n.from_user?.full_name)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                    {getIcon(n.type)}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{getMessage(n)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}