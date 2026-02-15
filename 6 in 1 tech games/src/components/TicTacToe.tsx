import { useState, useCallback } from 'react';

interface TicTacToeProps {
  onBack: () => void;
}

type Player = 'X' | 'O' | null;
type Board = Player[];
type UltimateBoard = {
  boards: Board[];
  mainBoard: Player[];
  activeBoard: number | null;
};

const checkWinner = (board: Player[]): Player => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const isBoardFull = (board: Player[]): boolean => {
  return board.every(cell => cell !== null);
};

export function TicTacToe({ onBack }: TicTacToeProps) {
  const [mode, setMode] = useState<'classic' | 'ultimate'>('classic');
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  
  // Classic mode state
  const [classicBoard, setClassicBoard] = useState<Board>(Array(9).fill(null));
  const [classicWinner, setClassicWinner] = useState<Player>(null);
  
  // Ultimate mode state
  const [ultimateState, setUltimateState] = useState<UltimateBoard>({
    boards: Array(9).fill(null).map(() => Array(9).fill(null)),
    mainBoard: Array(9).fill(null),
    activeBoard: null,
  });
  const [ultimateWinner, setUltimateWinner] = useState<Player>(null);

  const resetGame = useCallback(() => {
    setCurrentPlayer('X');
    setClassicBoard(Array(9).fill(null));
    setClassicWinner(null);
    setUltimateState({
      boards: Array(9).fill(null).map(() => Array(9).fill(null)),
      mainBoard: Array(9).fill(null),
      activeBoard: null,
    });
    setUltimateWinner(null);
  }, []);

  const handleClassicClick = (index: number) => {
    if (classicBoard[index] || classicWinner) return;
    
    const newBoard = [...classicBoard];
    newBoard[index] = currentPlayer;
    setClassicBoard(newBoard);
    
    const winner = checkWinner(newBoard);
    if (winner) {
      setClassicWinner(winner);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const handleUltimateClick = (boardIndex: number, cellIndex: number) => {
    if (ultimateWinner) return;
    if (ultimateState.mainBoard[boardIndex]) return; // This small board is already won
    if (ultimateState.activeBoard !== null && ultimateState.activeBoard !== boardIndex) return;
    if (ultimateState.boards[boardIndex][cellIndex]) return;

    const newBoards = ultimateState.boards.map((board, i) => 
      i === boardIndex ? board.map((cell, j) => j === cellIndex ? currentPlayer : cell) : [...board]
    );
    
    const newMainBoard = [...ultimateState.mainBoard];
    const smallBoardWinner = checkWinner(newBoards[boardIndex]);
    if (smallBoardWinner) {
      newMainBoard[boardIndex] = smallBoardWinner;
    } else if (isBoardFull(newBoards[boardIndex])) {
      newMainBoard[boardIndex] = 'X'; // Draw goes to X (or could be null)
    }

    // Determine next active board
    let nextActiveBoard: number | null = cellIndex;
    if (newMainBoard[cellIndex] || isBoardFull(newBoards[cellIndex])) {
      nextActiveBoard = null; // Can play anywhere
    }

    setUltimateState({
      boards: newBoards,
      mainBoard: newMainBoard,
      activeBoard: nextActiveBoard,
    });

    const overallWinner = checkWinner(newMainBoard);
    if (overallWinner) {
      setUltimateWinner(overallWinner);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const renderClassicCell = (index: number) => {
    const value = classicBoard[index];
    return (
      <button
        key={index}
        onClick={() => handleClassicClick(index)}
        disabled={!!value || !!classicWinner}
        className={`w-20 h-20 md:w-24 md:h-24 bg-slate-700/50 border-2 border-slate-600 rounded-xl flex items-center justify-center text-4xl md:text-5xl font-bold transition-all hover:bg-slate-600/50 hover:border-slate-500 ${
          value === 'X' ? 'text-cyan-400' : value === 'O' ? 'text-pink-400' : 'text-transparent'
        } ${!value && !classicWinner ? 'hover:scale-105 cursor-pointer' : ''}`}
      >
        {value || '·'}
      </button>
    );
  };

  const renderUltimateSmallBoard = (boardIndex: number) => {
    const isActive = ultimateState.activeBoard === null || ultimateState.activeBoard === boardIndex;
    const boardWinner = ultimateState.mainBoard[boardIndex];
    
    return (
      <div
        key={boardIndex}
        className={`p-1 rounded-lg transition-all ${
          isActive && !boardWinner && !ultimateWinner
            ? 'bg-purple-500/20 border-2 border-purple-500/50'
            : 'bg-slate-800/50 border-2 border-slate-700'
        } ${boardWinner ? 'opacity-80' : ''}`}
      >
        {boardWinner ? (
          <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${
            boardWinner === 'X' ? 'text-cyan-400' : 'text-pink-400'
          }`}>
            {boardWinner}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {ultimateState.boards[boardIndex].map((cell, cellIndex) => (
              <button
                key={cellIndex}
                onClick={() => handleUltimateClick(boardIndex, cellIndex)}
                disabled={!isActive || !!cell || !!ultimateWinner}
                className={`w-6 h-6 md:w-8 md:h-8 bg-slate-700/30 rounded flex items-center justify-center text-sm md:text-base font-bold transition-all ${
                  cell === 'X' ? 'text-cyan-400' : cell === 'O' ? 'text-pink-400' : ''
                } ${isActive && !cell && !ultimateWinner ? 'hover:bg-slate-600/50 cursor-pointer' : ''}`}
              >
                {cell || ''}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
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
            ⭕ Tic Tac Toe
          </h1>
          <p className="text-slate-400">Choose your mode and play!</p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => { setMode('classic'); resetGame(); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              mode === 'classic'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Classic 3×3
          </button>
          <button
            onClick={() => { setMode('ultimate'); resetGame(); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              mode === 'ultimate'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Ultimate 9-Grid
          </button>
        </div>

        {/* Game Status */}
        <div className="text-center mb-6">
          {(mode === 'classic' ? classicWinner : ultimateWinner) ? (
            <div className="text-2xl font-bold">
              <span className={mode === 'classic' && classicWinner === 'X' || mode === 'ultimate' && ultimateWinner === 'X' ? 'text-cyan-400' : 'text-pink-400'}>
                {mode === 'classic' ? classicWinner : ultimateWinner}
              </span>
              {' '}Wins! 🎉
            </div>
          ) : isBoardFull(mode === 'classic' ? classicBoard : ultimateState.mainBoard) ? (
            <div className="text-2xl font-bold text-yellow-400">It's a Draw! 🤝</div>
          ) : (
            <div className="text-xl">
              Current Turn:{' '}
              <span className={`font-bold ${currentPlayer === 'X' ? 'text-cyan-400' : 'text-pink-400'}`}>
                {currentPlayer}
              </span>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          {mode === 'classic' ? (
            <div className="grid grid-cols-3 gap-2">
              {Array(9).fill(null).map((_, i) => renderClassicCell(i))}
            </div>
          ) : (
            <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700">
              <div className="grid grid-cols-3 gap-2">
                {Array(9).fill(null).map((_, i) => renderUltimateSmallBoard(i))}
              </div>
            </div>
          )}
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
            Reset Game
          </button>
        </div>

        {/* Mode Info */}
        {mode === 'ultimate' && (
          <div className="mt-8 bg-slate-800/30 rounded-xl p-4 border border-slate-700 max-w-lg mx-auto">
            <h3 className="text-sm font-semibold text-purple-400 mb-2">🎮 Ultimate Rules:</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Win a small 3×3 to claim that cell in the main grid</li>
              <li>• Your move determines which board your opponent plays in</li>
              <li>• Highlighted board = where you must play next</li>
              <li>• Win 3 small boards in a row to win the game!</li>
            </ul>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 text-slate-500 text-sm pb-6">
          <p>Build by Pavan Kumar</p>
        </footer>
      </div>
    </div>
  );
}
