import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">

      {/* LEFT SIDE GREEN GLOW (MIRROR OF RIGHT SIDE) */}
      <div className="absolute left-50 top-1/2 -translate-y-1/2 w-[420px] h-[520px]
      bg-gradient-to-t from-green-300 via-green-500 to-transparent
      opacity-20 blur-2xl rounded-full"></div>

      {/* EXTRA SOFT LAYER */}
      <div className="absolute left-25 top-[100%] w-[320px] h-[400px]
      bg-green-300 opacity-20 blur-3xl rounded-full"></div>
      
      {/* RIGHT SIDE GREEN GLOW (LIKE YOUR IMAGE) */}
      <div className="absolute right-70 top-1/2 -translate-y-1/2 w-[420px] h-[520px]
        bg-gradient-to-t from-green-300 via-green-500 to-transparent
        opacity-20 blur-2xl rounded-full"></div>

      {/* EXTRA SOFT LAYER */}
      <div className="absolute right-25 top-[78%] w-[320px] h-[400px]
        bg-green-300 opacity-20 blur-3xl rounded-full"></div>

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            <span className="text-green-500">&lt;/&gt;</span>{' '}
            <span className="text-white">Mzansi</span>
            <span className="text-green-500">Builds</span>
          </h1>
          <p className="text-gray-400 text-sm">Sign in to your account</p>
        </div>

        {/* Glow Border Wrapper */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-green-500 opacity-20 blur rounded-2xl"></div>

          {/* Card */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-8 backdrop-blur-lg">

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 
                  focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 
                  focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 rounded-lg 
                transition duration-200 shadow-lg shadow-green-500/20 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

            </form>

            {/* Footer */}
            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-500 hover:text-green-400">
                Create one
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  )
}