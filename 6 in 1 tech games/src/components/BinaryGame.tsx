import { useState, useEffect, useCallback } from 'react';

interface BinaryGameProps {
  onBack: () => void;
}

type GameMode = 'dec-to-bin' | 'bin-to-dec';

const generateProblem = (mode: GameMode): { question: string; answer: string; decimal: number } => {
  const decimal = Math.floor(Math.random() * 256);
  const binary = decimal.toString(2).padStart(8, '0');
  
  if (mode === 'dec-to-bin') {
    return { question: decimal.toString(), answer: binary, decimal };
  } else {
    return { question: binary, answer: decimal.toString(), decimal };
  }
};

export function BinaryGame({ onBack }: BinaryGameProps) {
  const [mode, setMode] = useState<GameMode>('dec-to-bin');
  const [problem, setProblem] = useState(() => generateProblem('dec-to-bin'));
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const newProblem = useCallback(() => {
    setProblem(generateProblem(mode));
    setUserAnswer('');
    setFeedback(null);
    setShowHint(false);
  }, [mode]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    newProblem();
  }, [newProblem]);

  useEffect(() => {
    if (!isPlaying) return;
    
    if (timeLeft <= 0) {
      setIsPlaying(false);
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, highScore]);

  const checkAnswer = () => {
    const correct = userAnswer.trim() === problem.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      const points = 10 + streak * 2;
      setScore(s => s + points);
      setStreak(s => s + 1);
      setTimeout(() => {
        newProblem();
      }, 500);
    } else {
      setStreak(0);
    }
  };

  const toggleBit = (position: number) => {
    const bits = userAnswer.padStart(8, '0').split('');
    bits[position] = bits[position] === '1' ? '0' : '1';
    setUserAnswer(bits.join(''));
  };

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    setIsPlaying(false);
    setScore(0);
    setStreak(0);
    setUserAnswer('');
    setFeedback(null);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Menu
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            💻 Binary Challenge
          </h1>
          <p className="text-slate-400">Convert between binary and decimal!</p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => handleModeChange('dec-to-bin')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              mode === 'dec-to-bin'
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Decimal → Binary
          </button>
          <button
            onClick={() => handleModeChange('bin-to-dec')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              mode === 'bin-to-dec'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Binary → Decimal
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Score</div>
            <div className="text-2xl font-bold text-purple-400">{score}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Streak</div>
            <div className="text-2xl font-bold text-yellow-400">🔥 {streak}</div>
          </div>
          <div className={`rounded-xl px-6 py-3 border ${timeLeft <= 10 ? 'bg-red-500/20 border-red-500' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="text-xs text-slate-400">Time</div>
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'}`}>{timeLeft}s</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Best</div>
            <div className="text-2xl font-bold text-green-400">{highScore}</div>
          </div>
        </div>

        {!isPlaying ? (
          /* Start Screen */
          <div className="text-center bg-slate-800/50 rounded-2xl p-8 border border-slate-700 max-w-lg mx-auto">
            {timeLeft === 0 && score > 0 ? (
              <>
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-2xl font-bold text-white mb-2">Time's Up!</h2>
                <p className="text-slate-400 mb-4">Your score: <span className="text-purple-400 font-bold">{score}</span></p>
                {score === highScore && score > 0 && (
                  <p className="text-yellow-400 mb-4">🏆 New High Score!</p>
                )}
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold text-white mb-2">Ready to Play?</h2>
                <p className="text-slate-400 mb-4">Convert as many numbers as you can in 30 seconds!</p>
              </>
            )}
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl text-white font-medium hover:from-purple-400 hover:to-violet-500 transition-all text-lg"
            >
              {timeLeft === 0 ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        ) : (
          /* Game Area */
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 max-w-lg mx-auto">
            {/* Question */}
            <div className="text-center mb-6">
              <div className="text-sm text-slate-400 mb-2">
                Convert this {mode === 'dec-to-bin' ? 'decimal' : 'binary'} number:
              </div>
              <div className={`text-4xl font-mono font-bold ${mode === 'dec-to-bin' ? 'text-purple-400' : 'text-cyan-400'}`}>
                {problem.question}
              </div>
            </div>

            {/* Binary Bit Toggle (for dec-to-bin) */}
            {mode === 'dec-to-bin' && (
              <div className="mb-6">
                <div className="text-xs text-slate-400 text-center mb-2">Click bits to toggle:</div>
                <div className="flex justify-center gap-1">
                  {[128, 64, 32, 16, 8, 4, 2, 1].map((value, index) => (
                    <button
                      key={index}
                      onClick={() => toggleBit(index)}
                      className={`w-10 h-12 rounded-lg font-mono text-lg font-bold transition-all ${
                        userAnswer.padStart(8, '0')[index] === '1'
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {userAnswer.padStart(8, '0')[index] || '0'}
                      <div className="text-[8px] font-normal">{value}</div>
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2 font-mono text-slate-400">
                  = {parseInt(userAnswer.padStart(8, '0'), 2)}
                </div>
              </div>
            )}

            {/* Input (for bin-to-dec) */}
            {mode === 'bin-to-dec' && (
              <div className="mb-6">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                  placeholder="Enter decimal number"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center text-2xl font-mono focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`text-center mb-4 py-2 rounded-lg ${
                feedback === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {feedback === 'correct' ? '✓ Correct! +' + (10 + (streak - 1) * 2) + ' points' : '✗ Wrong! Answer: ' + problem.answer}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={checkAnswer}
              disabled={!userAnswer}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-medium hover:from-green-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>

            {/* Hint */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-sm text-slate-400 hover:text-slate-300"
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              {showHint && (
                <div className="mt-2 text-xs text-slate-500 bg-slate-700/50 rounded-lg p-2">
                  {mode === 'dec-to-bin' ? (
                    <>Binary places: 128, 64, 32, 16, 8, 4, 2, 1. Add the "1" positions.</>
                  ) : (
                    <>Multiply each bit by its position value (128, 64, 32...) and add them up.</>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Binary Reference Table */}
        <div className="mt-8 bg-slate-800/30 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-purple-400 mb-3">📚 Binary Reference (8-bit):</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400">
                  <th className="px-2 py-1">Bit Position</th>
                  {[7, 6, 5, 4, 3, 2, 1, 0].map(i => (
                    <th key={i} className="px-2 py-1">{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="text-cyan-400">
                  <td className="px-2 py-1 text-slate-400">Value</td>
                  {[128, 64, 32, 16, 8, 4, 2, 1].map(v => (
                    <td key={v} className="px-2 py-1 font-mono">{v}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Example: 10110 = 16 + 4 + 2 = 22
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-slate-500 text-sm pb-6">
          <p>Build by Pavan Kumar</p>
        </footer>
      </div>
    </div>
  );
}
