import { GameType } from '../../App';

interface GameMenuProps {
  onSelectGame: (game: GameType) => void;
}

const games = [
  {
    id: 'tictactoe' as GameType,
    title: 'Tic Tac Toe',
    subtitle: 'Classic + Ultimate 9-Grid Mode',
    icon: '⭕',
    color: 'from-cyan-500 to-blue-600',
    description: 'Two modes: Classic 3x3 or Ultimate with 9 grids!',
    tags: ['2 Player', 'Strategy'],
  },
  {
    id: 'memory' as GameType,
    title: 'Circuit Memory',
    subtitle: 'Match Electronic Components',
    icon: '🔌',
    color: 'from-green-500 to-emerald-600',
    description: 'Match resistors, capacitors, ICs and more!',
    tags: ['Memory', 'ECE'],
  },
  {
    id: 'binary' as GameType,
    title: 'Binary Challenge',
    subtitle: 'Decimal ↔ Binary Conversion',
    icon: '💻',
    color: 'from-purple-500 to-violet-600',
    description: 'Convert numbers between binary and decimal!',
    tags: ['Math', 'Digital Logic'],
  },
  {
    id: 'logic' as GameType,
    title: 'Logic Gate Master',
    subtitle: 'AND, OR, NOT, XOR Quiz',
    icon: '🔲',
    color: 'from-orange-500 to-red-600',
    description: 'Test your digital logic knowledge!',
    tags: ['Digital', 'ECE'],
  },
  {
    id: 'simon' as GameType,
    title: 'LED Simon Says',
    subtitle: 'Pattern Memory Game',
    icon: '💡',
    color: 'from-yellow-500 to-amber-600',
    description: 'Remember and repeat the LED pattern!',
    tags: ['Memory', 'Reflex'],
  },
  {
    id: 'circuit' as GameType,
    title: 'Wire Connect',
    subtitle: 'Complete the Circuit',
    icon: '⚡',
    color: 'from-pink-500 to-rose-600',
    description: 'Connect wires to complete the circuit path!',
    tags: ['Puzzle', 'ECE'],
  },
];

export function GameMenu({ onSelectGame }: GameMenuProps) {
  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-4">
          <span className="animate-pulse">🎮</span>
          ECE Gaming Hub
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            6-in-1 Tech Games
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Fun games designed for ECE students and tech enthusiasts!
          Test your digital logic, memory, and problem-solving skills.
        </p>
      </header>

      {/* Games Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className="group relative bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-left hover:border-slate-500 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
            
            {/* Icon */}
            <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {game.icon}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
              {game.title}
            </h3>
            <p className="text-sm text-purple-400 mb-2">{game.subtitle}</p>
            <p className="text-sm text-slate-400 mb-4">{game.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-700/50 rounded-full text-xs text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Play arrow */}
            <div className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 text-slate-500 text-sm pb-6">
        <p>Build by Pavan Kumar</p>
      </footer>
    </div>
  );
}
