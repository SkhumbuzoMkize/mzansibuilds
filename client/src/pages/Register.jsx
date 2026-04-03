import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username.toLowerCase(),
        })
        .eq('id', data.user.id)

      toast.success('Account created! Welcome to MzansiBuilds!')
      navigate('/dashboard')
      
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-green-500">&lt;/&gt;</span> MzansiBuilds
          </h1>
          <p className="text-gray-400">Create your account and start building</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your_username"
                required
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-green-500 hover:text-green-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}