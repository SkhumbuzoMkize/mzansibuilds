import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Home, User, Lock, Bell, Trash2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('account')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({
    likes: true,
    comments: true,
    follows: true,
    collabs: true,
  })

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure? This will permanently delete your account and all your projects. This cannot be undone.')
    if (!confirmed) return
    toast.error('Please contact support to delete your account.')
  }

  const sections = [
    { id: 'account', label: 'Account', icon: <User size={16} /> },
    { id: 'password', label: 'Password', icon: <Lock size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'danger', label: 'Danger Zone', icon: <Trash2 size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-10 py-8">

        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
          <Home size={16} /> Home
        </button>

        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 h-fit">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition mb-1 ${activeSection === s.id ? 'bg-green-500/10 text-green-400' : 'text-gray-400 hover:bg-gray-800'} ${s.id === 'danger' ? 'text-red-400 hover:bg-red-500/10 mt-4 border-t border-gray-800 pt-4' : ''}`}>
                <span className="flex items-center gap-2">{s.icon} {s.label}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">

            {/* Account */}
            {activeSection === 'account' && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <div>
                      <p className="text-sm text-gray-400">Full Name</p>
                      <p className="text-white mt-0.5">{profile?.full_name}</p>
                    </div>
                    <button onClick={() => navigate(`/profile/${user?.id}`)} className="text-xs text-green-400 hover:underline">Edit</button>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <div>
                      <p className="text-sm text-gray-400">Username</p>
                      <p className="text-white mt-0.5">@{profile?.username}</p>
                    </div>
                    <button onClick={() => navigate(`/profile/${user?.id}`)} className="text-xs text-green-400 hover:underline">Edit</button>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white mt-0.5">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="text-sm text-gray-400">Member since</p>
                      <p className="text-white mt-0.5">{new Date(profile?.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            {activeSection === 'password' && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <button type="submit" disabled={loading}
                    className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50">
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'likes', label: 'Likes', desc: 'When someone likes your project' },
                    { key: 'comments', label: 'Comments', desc: 'When someone comments on your project' },
                    { key: 'follows', label: 'Follows', desc: 'When someone follows you' },
                    { key: 'collabs', label: 'Collaborations', desc: 'When someone raises their hand on your project' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                      <div>
                        <p className="text-sm text-white">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifPrefs(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`w-10 h-6 rounded-full transition-colors ${notifPrefs[item.key] ? 'bg-green-500' : 'bg-gray-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full mx-auto transition-transform ${notifPrefs[item.key] ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => toast.success('Preferences saved!')}
                  className="mt-4 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition">
                  Save Preferences
                </button>
              </div>
            )}

            {/* Danger Zone */}
            {activeSection === 'danger' && (
              <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-xl bg-red-500/5">
                    <div>
                      <p className="text-sm font-medium text-white">Sign out of all devices</p>
                      <p className="text-xs text-gray-500 mt-0.5">This will sign you out everywhere</p>
                    </div>
                    <button onClick={signOut} className="text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition">
                      Sign out
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-xl bg-red-500/5">
                    <div>
                      <p className="text-sm font-medium text-white">Delete account</p>
                      <p className="text-xs text-gray-500 mt-0.5">Permanently delete your account and all data</p>
                    </div>
                    <button onClick={handleDeleteAccount} className="text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}