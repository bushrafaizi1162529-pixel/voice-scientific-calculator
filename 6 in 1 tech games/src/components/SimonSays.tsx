import { useState, useEffect, useCallback } from 'react';

interface SimonSaysProps {
  onBack: () => void;
}

type Color = 'red' | 'green' | 'blue' | 'yellow';

const colors: Color[] = ['red', 'green', 'blue', 'yellow'];

const colorStyles: Record<Color, { bg: string; glow: string; active: string }> = {
  red: { bg: 'bg-red-600', glow: 'shadow-red-500/50', active: 'bg-red-400' },
  green: { bg: 'bg-green-600', glow: 'shadow-green-500/50', active: 'bg-green-400' },
  blue: { bg: 'bg-blue-600', glow: 'shadow-blue-500/50', active: 'bg-blue-400' },
  yellow: { bg: 'bg-yellow-500', glow: 'shadow-yellow-400/50', active: 'bg-yellow-300' },
};

export function SimonSays({ onBack }: SimonSaysProps) {
  const [sequence, setSequence] = useState<Color[]>([]);
  const [playerSequence, setPlayerSequence] = useState<Color[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [message, setMessage] = useState('Press Start to Play');
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const speedMs = { slow: 800, normal: 500, fast: 300 };

  const playSound = useCallback((color: Color) => {
    // Create oscillator for sound
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      const frequencies: Record<Color, number> = {
        red: 329.63,
        green: 261.63,
        blue: 392.00,
        yellow: 523.25,
      };
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = frequencies[color];
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio not supported
    }
  }, []);

  const flashColor = useCallback((color: Color) => {
    setActiveColor(color);
    playSound(color);
    setTimeout(() => setActiveColor(null), speedMs[speed] * 0.6);
  }, [playSound, speed]);

  const showSequence = useCallback(async () => {
    setIsShowingSequence(true);
    setMessage('Watch the pattern...');
    
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, speedMs[speed]));
      flashColor(sequence[i]);
    }
    
    await new Promise(resolve => setTimeout(resolve, speedMs[speed]));
    setIsShowingSequence(false);
    setMessage('Your turn! Repeat the pattern');
  }, [sequence, flashColor, speed]);

  const addToSequence = useCallback(() => {
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setSequence(prev => [...prev, newColor]);
  }, []);

  const startGame = useCallback(() => {
    setSequence([]);
    setPlayerSequence([]);
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setMessage('Get ready...');
    
    // Add first color after a delay
    setTimeout(() => {
      const firstColor = colors[Math.floor(Math.random() * colors.length)];
      setSequence([firstColor]);
    }, 1000);
  }, []);

  useEffect(() => {
    if (sequence.length > 0 && isPlaying && !gameOver) {
      setPlayerSequence([]);
      showSequence();
    }
  }, [sequence, isPlaying, gameOver, showSequence]);

  const handleColorClick = (color: Color) => {
    if (isShowingSequence || !isPlaying || gameOver) return;
    
    flashColor(color);
    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;
    
    if (sequence[currentIndex] !== color) {
      // Wrong!
      setGameOver(true);
      setIsPlaying(false);
      setMessage(`Game Over! Score: ${score}`);
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      // Completed this round!
      setScore(s => s + 1);
      setMessage('Correct! Next round...');
      setTimeout(() => {
        addToSequence();
      }, 1000);
    }
  };

  const renderLED = (color: Color, position: string) => {
    const isActive = activeColor === color;
    const styles = colorStyles[color];
    
    return (
      <button
        onClick={() => handleColorClick(color)}
        disabled={isShowingSequence || !isPlaying || gameOver}
        className={`${position} w-28 h-28 md:w-36 md:h-36 rounded-full transition-all duration-100 ${
          isActive ? `${styles.active} shadow-2xl ${styles.glow}` : styles.bg
        } ${
          isPlaying && !isShowingSequence && !gameOver 
            ? 'hover:brightness-125 cursor-pointer' 
            : 'cursor-default'
        } border-4 border-slate-800 flex items-center justify-center`}
      >
        {/* LED center reflection */}
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${
          isActive ? 'bg-white/50' : 'bg-white/20'
        } blur-sm`}></div>
        
        {/* LED label */}
        <span className="absolute text-white/50 font-bold text-sm mt-16">
          {color.toUpperCase()}
        </span>
      </button>
    );
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
            💡 LED Simon Says
          </h1>
          <p className="text-slate-400">Remember and repeat the LED pattern!</p>
        </div>

        {/* Speed Selector */}
        <div className="flex justify-center gap-2 mb-6">
          {(['slow', 'normal', 'fast'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              disabled={isPlaying}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                speed === s
                  ? 'bg-yellow-500 text-black'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Score</div>
            <div className="text-2xl font-bold text-yellow-400">{score}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Round</div>
            <div className="text-2xl font-bold text-cyan-400">{sequence.length}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Best</div>
            <div className="text-2xl font-bold text-green-400">{highScore}</div>
          </div>
        </div>

        {/* Message */}
        <div className={`text-center text-xl font-medium mb-8 ${
          gameOver ? 'text-red-400' : isShowingSequence ? 'text-yellow-400' : 'text-cyan-400'
        }`}>
          {message}
        </div>

        {/* Game Board - Simon Says style */}
        <div className="flex justify-center mb-8">
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            {/* Center circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{sequence.length}</div>
                  <div className="text-xs text-slate-400">LEVEL</div>
                </div>
              </div>
            </div>

            {/* LEDs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
              {renderLED('green', '')}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
              {renderLED('red', '')}
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
              {renderLED('yellow', '')}
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
              {renderLED('blue', '')}
            </div>
          </div>
        </div>

        {/* Start/Restart Button */}
        <div className="text-center">
          <button
            onClick={startGame}
            disabled={isPlaying && !gameOver}
            className={`px-8 py-4 rounded-xl font-medium text-lg transition-all ${
              isPlaying && !gameOver
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:from-yellow-400 hover:to-amber-500 shadow-lg shadow-yellow-500/30'
            }`}
          >
            {gameOver ? '🔄 Play Again' : isPlaying ? '🎮 Playing...' : '▶ Start Game'}
          </button>
        </div>

        {/* Progress indicator */}
        {isPlaying && !gameOver && !isShowingSequence && (
          <div className="mt-6 max-w-xs mx-auto">
            <div className="text-xs text-slate-400 text-center mb-2">
              Progress: {playerSequence.length}/{sequence.length}
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all"
                style={{ width: `${(playerSequence.length / sequence.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-slate-800/30 rounded-xl p-4 border border-slate-700 max-w-lg mx-auto">
          <h3 className="text-sm font-semibold text-yellow-400 mb-2">🎮 How to Play:</h3>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Watch the LED sequence carefully</li>
            <li>• Repeat the pattern by clicking the LEDs in order</li>
            <li>• Each round adds one more light to the sequence</li>
            <li>• One mistake and it's game over!</li>
            <li>• Sound helps - turn on your speakers! 🔊</li>
          </ul>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-slate-500 text-sm pb-6">
          <p>Build by Pavan Kumar</p>
        </footer>
      </div>
    </div>
  );
}
