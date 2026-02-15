import { useState, useEffect } from 'react';

interface MemoryMatchProps {
  onBack: () => void;
}

interface Card {
  id: number;
  component: string;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const components = [
  { component: 'Resistor', icon: '⚡' },
  { component: 'Capacitor', icon: '🔋' },
  { component: 'LED', icon: '💡' },
  { component: 'Transistor', icon: '🔌' },
  { component: 'Diode', icon: '➡️' },
  { component: 'IC Chip', icon: '🖥️' },
  { component: 'Inductor', icon: '🔁' },
  { component: 'Relay', icon: '🔀' },
];

const createCards = (): Card[] => {
  const cards: Card[] = [];
  components.forEach((comp, index) => {
    cards.push({
      id: index * 2,
      component: comp.component,
      icon: comp.icon,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: index * 2 + 1,
      component: comp.component,
      icon: comp.icon,
      isFlipped: false,
      isMatched: false,
    });
  });
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};

export function MemoryMatch({ onBack }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>(createCards());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !gameComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameComplete]);

  const handleCardClick = (cardId: number) => {
    if (isLocked) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      const [first, second] = newFlipped;
      const firstCard = newCards.find(c => c.id === first);
      const secondCard = newCards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.component === secondCard.component) {
        // Match!
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === first || c.id === second ? { ...c, isMatched: true } : c
            )
          );
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === components.length) {
              setGameComplete(true);
            }
            return newMatches;
          });
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === first || c.id === second ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(createCards());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
    setGameComplete(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            🔌 Circuit Memory Match
          </h1>
          <p className="text-slate-400">Match the electronic components!</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Moves</div>
            <div className="text-2xl font-bold text-cyan-400">{moves}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Matches</div>
            <div className="text-2xl font-bold text-green-400">{matches}/{components.length}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Time</div>
            <div className="text-2xl font-bold text-purple-400">{formatTime(elapsedTime)}</div>
          </div>
        </div>

        {/* Game Complete Modal */}
        {gameComplete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center max-w-md mx-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
              <p className="text-slate-400 mb-4">You matched all components!</p>
              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg px-4 py-2">
                  <div className="text-xs text-slate-400">Moves</div>
                  <div className="text-xl font-bold text-cyan-400">{moves}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg px-4 py-2">
                  <div className="text-xs text-slate-400">Time</div>
                  <div className="text-xl font-bold text-purple-400">{formatTime(elapsedTime)}</div>
                </div>
              </div>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-medium hover:from-green-400 hover:to-emerald-500 transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Card Grid */}
        <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto mb-8">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped || isLocked}
              className={`aspect-square rounded-xl transition-all duration-300 transform ${
                card.isFlipped || card.isMatched
                  ? 'rotate-y-180'
                  : 'hover:scale-105'
              }`}
              style={{ perspective: '1000px' }}
            >
              <div
                className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                  card.isMatched
                    ? 'bg-green-500/30 border-2 border-green-500'
                    : card.isFlipped
                    ? 'bg-slate-700 border-2 border-cyan-500'
                    : 'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 hover:border-slate-500 cursor-pointer'
                }`}
              >
                {card.isFlipped || card.isMatched ? (
                  <>
                    <span className="text-2xl md:text-3xl mb-1">{card.icon}</span>
                    <span className="text-[10px] md:text-xs text-slate-300 font-medium">{card.component}</span>
                  </>
                ) : (
                  <span className="text-2xl text-slate-500">?</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Reset Button */}
        <div className="text-center">
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-white font-medium transition-all flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>
        </div>

        {/* Component Legend */}
        <div className="mt-8 bg-slate-800/30 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-green-400 mb-3">🔧 Electronic Components:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {components.map((comp) => (
              <div key={comp.component} className="flex items-center gap-2 text-slate-400">
                <span>{comp.icon}</span>
                <span>{comp.component}</span>
              </div>
            ))}
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
