import { useNavigate } from 'react-router-dom'
import { Zap, Users, Trophy, ArrowRight } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-green-500">&lt;/&gt;</span>{' '}
          <span className="text-white">Mzansi</span>
          <span className="text-green-500">Builds</span>
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white text-sm transition">
            Sign in
          </button>
          <button onClick={() => navigate('/register')} className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition">
            Join now
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-16 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm text-green-400 mb-8">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Build in public. Grow together.
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Where SA developers<br />
          <span className="text-green-500">ship publicly</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Share your projects, track your progress, and connect with developers across Mzansi who are building right now.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-lg transition">
            Start building <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/login')}
            className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-lg text-sm transition">
            Browse projects
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-gray-950">
        <div className="w-full px-16 py-12 grid grid-cols-2 md:grid-cols-4 text-center">
          {[
            { num: '1,240+', label: 'Active builders' },
            { num: '3,580+', label: 'Projects posted' },
            { num: '892+', label: 'Projects completed' },
            { num: '14K+', label: 'Collaborations' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-green-500">{stat.num}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-16 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to build in public</h2>
        <div className="grid md:grid-cols-3 gap-8 w-full">
          {[
            {
              icon: <Zap size={20} className="text-green-500" />,
              title: 'Live Developer Feed',
              desc: 'See what other developers are building in real time. Comment, like, and raise your hand to collaborate.'
            },
            {
              icon: <Users size={20} className="text-green-500" />,
              title: 'Find Collaborators',
              desc: 'Looking for a co-founder, designer or developer? Post your project and let the community come to you.'
            },
            {
              icon: <Trophy size={20} className="text-green-500" />,
              title: 'Celebration Wall',
              desc: 'When you ship, you get celebrated. Join the wall of developers who built and launched their projects.'
            },
          ].map(f => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to build in public?</h2>
          <p className="text-gray-400 mb-8">Join thousands of SA developers sharing their journey.</p>
          <button onClick={() => navigate('/register')}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-8 py-3 rounded-lg transition">
            Create your free account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-6 text-center text-gray-500 text-sm">
        <p>© 2026 MzansiBuilds — Built for the Derivco Graduate Programme</p>
      </footer>
    </div>
  )
}