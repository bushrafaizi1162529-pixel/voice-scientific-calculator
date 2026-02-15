import { useState, useCallback } from 'react';

interface CircuitPuzzleProps {
  onBack: () => void;
}

type CellType = 'empty' | 'wire' | 'source' | 'target' | 'component';
type Direction = 'horizontal' | 'vertical' | 'corner-tr' | 'corner-tl' | 'corner-br' | 'corner-bl';

interface Cell {
  type: CellType;
  direction?: Direction;
  connected?: boolean;
  component?: string;
}

interface Level {
  id: number;
  name: string;
  grid: Cell[][];
  startPos: [number, number];
  endPos: [number, number];
}

const createEmptyGrid = (rows: number, cols: number): Cell[][] => {
  return Array(rows).fill(null).map(() => 
    Array(cols).fill(null).map(() => ({ type: 'empty' as CellType }))
  );
};

const levels: Level[] = [
  {
    id: 1,
    name: 'Simple Circuit',
    grid: (() => {
      const g = createEmptyGrid(5, 5);
      g[0][0] = { type: 'source', component: '🔋' };
      g[0][4] = { type: 'target', component: '💡' };
      return g;
    })(),
    startPos: [0, 0],
    endPos: [0, 4],
  },
  {
    id: 2,
    name: 'Around the Corner',
    grid: (() => {
      const g = createEmptyGrid(5, 5);
      g[0][0] = { type: 'source', component: '🔋' };
      g[4][4] = { type: 'target', component: '💡' };
      g[2][2] = { type: 'component', component: '⚡' };
      return g;
    })(),
    startPos: [0, 0],
    endPos: [4, 4],
  },
  {
    id: 3,
    name: 'Through the Resistor',
    grid: (() => {
      const g = createEmptyGrid(5, 6);
      g[2][0] = { type: 'source', component: '🔋' };
      g[2][5] = { type: 'target', component: '💡' };
      g[1][2] = { type: 'component', component: '📟' };
      g[3][3] = { type: 'component', component: '📟' };
      return g;
    })(),
    startPos: [2, 0],
    endPos: [2, 5],
  },
  {
    id: 4,
    name: 'Complex Path',
    grid: (() => {
      const g = createEmptyGrid(6, 6);
      g[0][0] = { type: 'source', component: '🔋' };
      g[5][5] = { type: 'target', component: '💡' };
      g[1][1] = { type: 'component', component: '⚡' };
      g[2][3] = { type: 'component', component: '⚡' };
      g[4][2] = { type: 'component', component: '⚡' };
      g[3][4] = { type: 'component', component: '📟' };
      return g;
    })(),
    startPos: [0, 0],
    endPos: [5, 5],
  },
];

export function CircuitPuzzle({ onBack }: CircuitPuzzleProps) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [grid, setGrid] = useState<Cell[][]>(() => JSON.parse(JSON.stringify(levels[0].grid)));
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const level = levels[currentLevel];

  const checkPath = useCallback((newGrid: Cell[][]): boolean => {
    const [startRow, startCol] = level.startPos;
    const [endRow, endCol] = level.endPos;
    
    const visited = new Set<string>();
    const queue: [number, number][] = [[startRow, startCol]];
    visited.add(`${startRow},${startCol}`);

    while (queue.length > 0) {
      const [row, col] = queue.shift()!;
      
      if (row === endRow && col === endCol) {
        return true;
      }

      // Check all adjacent cells
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        const key = `${newRow},${newCol}`;
        
        if (
          newRow >= 0 && newRow < newGrid.length &&
          newCol >= 0 && newCol < newGrid[0].length &&
          !visited.has(key)
        ) {
          const cell = newGrid[newRow][newCol];
          if (cell.type === 'wire' || cell.type === 'target' || cell.type === 'source') {
            visited.add(key);
            queue.push([newRow, newCol]);
          }
        }
      }
    }
    
    return false;
  }, [level]);

  const handleCellClick = (row: number, col: number) => {
    if (isComplete) return;
    
    const cell = grid[row][col];
    if (cell.type === 'source' || cell.type === 'target' || cell.type === 'component') return;

    const newGrid = grid.map((r: Cell[]) => r.map((c: Cell) => ({ ...c })));
    
    if (cell.type === 'empty') {
      newGrid[row][col] = { type: 'wire', direction: 'horizontal' };
    } else if (cell.type === 'wire') {
      // Cycle through wire directions
      const directions: Direction[] = ['horizontal', 'vertical', 'corner-tr', 'corner-tl', 'corner-br', 'corner-bl'];
      const currentIndex = directions.indexOf(cell.direction || 'horizontal');
      const nextIndex = (currentIndex + 1) % (directions.length + 1);
      
      if (nextIndex === directions.length) {
        newGrid[row][col] = { type: 'empty' };
      } else {
        newGrid[row][col] = { type: 'wire', direction: directions[nextIndex] };
      }
    }

    setGrid(newGrid);
    setMoves((m: number) => m + 1);

    // Check if circuit is complete
    if (checkPath(newGrid)) {
      setIsComplete(true);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const resetLevel = () => {
    setGrid(JSON.parse(JSON.stringify(levels[currentLevel].grid)));
    setIsComplete(false);
    setMoves(0);
  };

  const nextLevel = () => {
    const next = (currentLevel + 1) % levels.length;
    setCurrentLevel(next);
    setGrid(JSON.parse(JSON.stringify(levels[next].grid)));
    setIsComplete(false);
    setMoves(0);
  };

  const selectLevel = (index: number) => {
    setCurrentLevel(index);
    setGrid(JSON.parse(JSON.stringify(levels[index].grid)));
    setIsComplete(false);
    setMoves(0);
  };

  const renderCell = (cell: Cell, row: number, col: number) => {
    const isStart = row === level.startPos[0] && col === level.startPos[1];
    const isEnd = row === level.endPos[0] && col === level.endPos[1];

    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleCellClick(row, col)}
        disabled={cell.type === 'source' || cell.type === 'target' || cell.type === 'component'}
        className={`w-12 h-12 md:w-14 md:h-14 border border-slate-600 rounded-lg flex items-center justify-center transition-all ${
          cell.type === 'source' ? 'bg-green-500/30 border-green-500' :
          cell.type === 'target' ? 'bg-blue-500/30 border-blue-500' :
          cell.type === 'component' ? 'bg-orange-500/20 border-orange-500' :
          cell.type === 'wire' ? (isComplete ? 'bg-yellow-500/30 border-yellow-500' : 'bg-cyan-500/20 border-cyan-500') :
          'bg-slate-800 hover:bg-slate-700 cursor-pointer'
        }`}
      >
        {cell.type === 'source' || cell.type === 'target' || cell.type === 'component' ? (
          <span className="text-xl">{cell.component}</span>
        ) : cell.type === 'wire' ? (
          <WireIcon direction={cell.direction || 'horizontal'} isComplete={isComplete} />
        ) : (
          <span className="text-slate-600 text-xs">+</span>
        )}
        
        {/* Start/End labels */}
        {isStart && (
          <span className="absolute -top-5 text-[10px] text-green-400">START</span>
        )}
        {isEnd && (
          <span className="absolute -top-5 text-[10px] text-blue-400">END</span>
        )}
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

        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            ⚡ Wire Connect
          </h1>
          <p className="text-slate-400">Connect the battery to the LED to complete the circuit!</p>
        </div>

        {/* Level Selector */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {levels.map((lvl, index) => (
            <button
              key={lvl.id}
              onClick={() => selectLevel(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentLevel === index
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Level {lvl.id}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Level</div>
            <div className="text-xl font-bold text-pink-400">{level.name}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Moves</div>
            <div className="text-2xl font-bold text-cyan-400">{moves}</div>
          </div>
        </div>

        {/* Celebration */}
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="text-6xl animate-bounce">🎉⚡💡</div>
          </div>
        )}

        {/* Complete Message */}
        {isComplete && (
          <div className="text-center mb-4">
            <span className="inline-block px-6 py-2 bg-green-500/20 border border-green-500 rounded-xl text-green-400 font-medium">
              ✓ Circuit Complete! The LED is lit! 💡
            </span>
          </div>
        )}

        {/* Grid */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 inline-block">
            <div className="flex flex-col gap-1">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                  {row.map((cell, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} className="relative">
                      {renderCell(cell, rowIndex, colIndex)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={resetLevel}
            className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-white font-medium transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
          {isComplete && (
            <button
              onClick={nextLevel}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-medium hover:from-green-400 hover:to-emerald-500 transition-all flex items-center gap-2"
            >
              Next Level
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 max-w-lg mx-auto">
          <h3 className="text-sm font-semibold text-pink-400 mb-2">🔧 How to Play:</h3>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Click empty cells to place wires</li>
            <li>• Click wires to rotate/change direction</li>
            <li>• Connect 🔋 (battery) to 💡 (LED) with a continuous path</li>
            <li>• ⚡ Obstacles must be avoided</li>
            <li>• Try to complete with minimum moves!</li>
          </ul>
          
          <div className="mt-4 pt-4 border-t border-slate-700">
            <h4 className="text-xs text-slate-400 mb-2">Wire Types (click to cycle):</h4>
            <div className="flex gap-4 justify-center">
              <div className="flex flex-col items-center gap-1">
                <WireIcon direction="horizontal" isComplete={false} />
                <span className="text-[10px] text-slate-500">Horizontal</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <WireIcon direction="vertical" isComplete={false} />
                <span className="text-[10px] text-slate-500">Vertical</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <WireIcon direction="corner-tr" isComplete={false} />
                <span className="text-[10px] text-slate-500">Corner</span>
              </div>
            </div>
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

function WireIcon({ direction, isComplete }: { direction: Direction; isComplete: boolean }) {
  const color = isComplete ? '#eab308' : '#22d3ee';
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      {direction === 'horizontal' && (
        <line x1="0" y1="12" x2="24" y2="12" stroke={color} strokeWidth="4" strokeLinecap="round" />
      )}
      {direction === 'vertical' && (
        <line x1="12" y1="0" x2="12" y2="24" stroke={color} strokeWidth="4" strokeLinecap="round" />
      )}
      {direction === 'corner-tr' && (
        <path d="M 12 24 L 12 12 L 24 12" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {direction === 'corner-tl' && (
        <path d="M 12 24 L 12 12 L 0 12" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {direction === 'corner-br' && (
        <path d="M 12 0 L 12 12 L 24 12" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {direction === 'corner-bl' && (
        <path d="M 12 0 L 12 12 L 0 12" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* Center dot */}
      <circle cx="12" cy="12" r="3" fill={color} />
    </svg>
  );
}
