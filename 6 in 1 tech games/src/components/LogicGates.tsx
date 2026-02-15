import { useState, useCallback } from 'react';

interface LogicGatesProps {
  onBack: () => void;
}

type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';

interface Problem {
  gate: GateType;
  inputs: number[];
  output: number;
}

const gateLogic: Record<GateType, (inputs: number[]) => number> = {
  AND: ([a, b]) => a & b,
  OR: ([a, b]) => a | b,
  NOT: ([a]) => a === 0 ? 1 : 0,
  XOR: ([a, b]) => a ^ b,
  NAND: ([a, b]) => (a & b) === 1 ? 0 : 1,
  NOR: ([a, b]) => (a | b) === 1 ? 0 : 1,
};

const gateDescriptions: Record<GateType, string> = {
  AND: 'Output is 1 only if ALL inputs are 1',
  OR: 'Output is 1 if ANY input is 1',
  NOT: 'Output is the OPPOSITE of input',
  XOR: 'Output is 1 if inputs are DIFFERENT',
  NAND: 'Opposite of AND (NOT AND)',
  NOR: 'Opposite of OR (NOT OR)',
};

const generateProblem = (gates: GateType[]): Problem => {
  const gate = gates[Math.floor(Math.random() * gates.length)];
  const inputs = gate === 'NOT' 
    ? [Math.random() < 0.5 ? 0 : 1]
    : [Math.random() < 0.5 ? 0 : 1, Math.random() < 0.5 ? 0 : 1];
  const output = gateLogic[gate](inputs);
  return { gate, inputs, output };
};

export function LogicGates({ onBack }: LogicGatesProps) {
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const gates: GateType[] = difficulty === 'easy' 
    ? ['AND', 'OR', 'NOT'] 
    : ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'];
  
  const [problem, setProblem] = useState<Problem>(() => generateProblem(gates));
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showTruthTable, setShowTruthTable] = useState(false);

  const newProblem = useCallback(() => {
    setProblem(generateProblem(gates));
    setFeedback(null);
  }, [gates]);

  const handleAnswer = (answer: number) => {
    const correct = answer === problem.output;
    setFeedback(correct ? 'correct' : 'wrong');
    setTotal(t => t + 1);
    if (correct) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      newProblem();
    }, 1000);
  };

  const handleDifficultyChange = (diff: 'easy' | 'hard') => {
    setDifficulty(diff);
    setScore(0);
    setTotal(0);
    setFeedback(null);
    const newGates: GateType[] = diff === 'easy' ? ['AND', 'OR', 'NOT'] : ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'];
    setProblem(generateProblem(newGates));
  };

  const renderGateSVG = (gate: GateType, size: number = 120) => {
    const scale = size / 120;
    return (
      <svg width={size} height={size * 0.6} viewBox="0 0 120 72">
        <g transform={`scale(${scale})`}>
          {/* Input lines */}
          {gate === 'NOT' ? (
            <line x1="0" y1="36" x2="30" y2="36" stroke="#0ea5e9" strokeWidth="3" />
          ) : (
            <>
              <line x1="0" y1="20" x2="30" y2="20" stroke="#0ea5e9" strokeWidth="3" />
              <line x1="0" y1="52" x2="30" y2="52" stroke="#0ea5e9" strokeWidth="3" />
            </>
          )}
          
          {/* Output line */}
          <line x1="90" y1="36" x2="120" y2="36" stroke="#22c55e" strokeWidth="3" />
          
          {/* Gate body */}
          {gate === 'AND' || gate === 'NAND' ? (
            <path d="M30 10 L30 62 L60 62 Q90 62 90 36 Q90 10 60 10 Z" fill="#1e293b" stroke="#f97316" strokeWidth="2" />
          ) : gate === 'OR' || gate === 'NOR' ? (
            <path d="M30 10 Q45 36 30 62 Q60 62 90 36 Q60 10 30 10 Z" fill="#1e293b" stroke="#a855f7" strokeWidth="2" />
          ) : gate === 'XOR' ? (
            <>
              <path d="M30 10 Q45 36 30 62 Q60 62 90 36 Q60 10 30 10 Z" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
              <path d="M22 10 Q37 36 22 62" fill="none" stroke="#ec4899" strokeWidth="2" />
            </>
          ) : ( // NOT
            <>
              <polygon points="30,10 30,62 80,36" fill="#1e293b" stroke="#eab308" strokeWidth="2" />
              <circle cx="85" cy="36" r="5" fill="#1e293b" stroke="#eab308" strokeWidth="2" />
            </>
          )}
          
          {/* NAND/NOR bubble */}
          {(gate === 'NAND' || gate === 'NOR') && (
            <circle cx="95" cy="36" r="5" fill="#1e293b" stroke={gate === 'NAND' ? '#f97316' : '#a855f7'} strokeWidth="2" />
          )}
          
          {/* Gate label */}
          <text x="55" y="40" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">{gate}</text>
        </g>
      </svg>
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
            🔲 Logic Gate Master
          </h1>
          <p className="text-slate-400">Test your digital logic knowledge!</p>
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => handleDifficultyChange('easy')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              difficulty === 'easy'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Easy (AND, OR, NOT)
          </button>
          <button
            onClick={() => handleDifficultyChange('hard')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              difficulty === 'hard'
                ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Hard (+XOR, NAND, NOR)
          </button>
        </div>

        {/* Score */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Score</div>
            <div className="text-2xl font-bold text-green-400">{score}/{total}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700">
            <div className="text-xs text-slate-400">Accuracy</div>
            <div className="text-2xl font-bold text-purple-400">
              {total > 0 ? Math.round((score / total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Problem */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 max-w-lg mx-auto mb-6">
          <div className="text-center mb-6">
            <div className="text-sm text-slate-400 mb-4">{gateDescriptions[problem.gate]}</div>
            
            {/* Gate Visualization */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Inputs */}
              <div className="flex flex-col gap-2">
                {problem.inputs.map((input, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${
                      input === 1 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {input}
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>

              {/* Gate */}
              <div className="flex flex-col items-center">
                {renderGateSVG(problem.gate)}
              </div>

              {/* Arrow */}
              <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>

              {/* Output placeholder */}
              <div className="w-12 h-12 rounded-lg bg-slate-700 border-2 border-dashed border-green-500 flex items-center justify-center text-xl font-bold text-green-400">
                ?
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`text-center mb-4 py-2 rounded-lg ${
              feedback === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {feedback === 'correct' ? '✓ Correct!' : `✗ Wrong! Answer was ${problem.output}`}
            </div>
          )}

          {/* Answer Buttons */}
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-3">What is the output?</div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleAnswer(0)}
                disabled={feedback !== null}
                className="w-20 h-20 bg-slate-700 hover:bg-red-500/30 border-2 border-slate-600 hover:border-red-500 rounded-xl text-3xl font-bold text-white transition-all disabled:opacity-50"
              >
                0
              </button>
              <button
                onClick={() => handleAnswer(1)}
                disabled={feedback !== null}
                className="w-20 h-20 bg-slate-700 hover:bg-green-500/30 border-2 border-slate-600 hover:border-green-500 rounded-xl text-3xl font-bold text-white transition-all disabled:opacity-50"
              >
                1
              </button>
            </div>
          </div>
        </div>

        {/* Truth Table Toggle */}
        <div className="text-center mb-4">
          <button
            onClick={() => setShowTruthTable(!showTruthTable)}
            className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2 mx-auto"
          >
            📚 {showTruthTable ? 'Hide' : 'Show'} Truth Tables
          </button>
        </div>

        {/* Truth Tables */}
        {showTruthTable && (
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 grid md:grid-cols-3 gap-4">
            {(['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'] as GateType[]).map(gate => (
              <div key={gate} className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  {renderGateSVG(gate, 60)}
                  <span className="font-bold text-white">{gate}</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400">
                      {gate === 'NOT' ? (
                        <>
                          <th className="py-1">A</th>
                          <th className="py-1">Out</th>
                        </>
                      ) : (
                        <>
                          <th className="py-1">A</th>
                          <th className="py-1">B</th>
                          <th className="py-1">Out</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {gate === 'NOT' ? (
                      <>
                        <tr><td className="py-1 text-center">0</td><td className="py-1 text-center text-green-400">1</td></tr>
                        <tr><td className="py-1 text-center">1</td><td className="py-1 text-center text-green-400">0</td></tr>
                      </>
                    ) : (
                      <>
                        <tr><td className="py-1 text-center">0</td><td className="py-1 text-center">0</td><td className="py-1 text-center text-green-400">{gateLogic[gate]([0, 0])}</td></tr>
                        <tr><td className="py-1 text-center">0</td><td className="py-1 text-center">1</td><td className="py-1 text-center text-green-400">{gateLogic[gate]([0, 1])}</td></tr>
                        <tr><td className="py-1 text-center">1</td><td className="py-1 text-center">0</td><td className="py-1 text-center text-green-400">{gateLogic[gate]([1, 0])}</td></tr>
                        <tr><td className="py-1 text-center">1</td><td className="py-1 text-center">1</td><td className="py-1 text-center text-green-400">{gateLogic[gate]([1, 1])}</td></tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
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
