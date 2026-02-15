import { useState } from 'react';
import { GameMenu } from './src/components/gamemenu';
import { TicTacToe } from './src/components/tictactoe';
import { MemoryMatch } from './src/components/memorymatch';
import { BinaryGame } from './src/components/binarygame';
import { LogicGates } from './src/components/logicgates';
import { SimonSays } from './src/components/simonsays';
import { CircuitPuzzle } from './src/components/circuitpuzzle';

export type GameType = 'tictactoe' | 'memory' | 'binary' | 'logic' | 'simon' | 'circuit';

export function App() {
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);

  const handleBackToMenu = () => {
    setCurrentGame(null);
  };

  if (currentGame === null) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <div className="flex-1">
          <GameMenu onSelectGame={setCurrentGame} />
        </div>
        <footer className="bg-slate-900 text-center py-4 border-t border-slate-800">
          <p className="text-slate-500 text-sm">Build by Pavan Kumar</p>
        </footer>
      </div>
    );
  }

  switch (currentGame) {
    case 'tictactoe':
      return <TicTacToe onBack={handleBackToMenu} />;
    case 'memory':
      return <MemoryMatch onBack={handleBackToMenu} />;
    case 'binary':
      return <BinaryGame onBack={handleBackToMenu} />;
    case 'logic':
      return <LogicGates onBack={handleBackToMenu} />;
    case 'simon':
      return <SimonSays onBack={handleBackToMenu} />;
    case 'circuit':
      return <CircuitPuzzle onBack={handleBackToMenu} />;
    default:
      return <GameMenu onSelectGame={setCurrentGame} />;
  }
}
