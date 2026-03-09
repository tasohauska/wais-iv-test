import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Clock, RotateCcw, ChevronRight } from 'lucide-react';

// --- Common Components ---

export const Timer: React.FC<{ duration: number; onTimeUp: () => void; isActive: boolean }> = ({ duration, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;

  return (
    <div className="w-full max-w-md mb-8">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center">
          <Clock className="w-3 h-3 mr-1" /> Time Remaining
        </span>
        <span className={`text-xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${timeLeft < 10 ? 'bg-red-500' : 'bg-emerald-500'}`}
        />
      </div>
    </div>
  );
};

// --- PRI: Block Design ---

type BlockType = 'white' | 'red' | 'split1' | 'split2';

const BLOCK_ROTATIONS: BlockType[] = ['white', 'red', 'split1', 'split2'];

const Block: React.FC<{ type: BlockType; onClick?: () => void; size?: 'sm' | 'md' | 'lg' }> = ({ type, onClick, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-12 h-12' : size === 'md' ? 'w-16 h-16 md:w-20 md:h-20' : 'w-24 h-24 md:w-32 md:h-32';
  
  return (
    <div 
      onClick={onClick}
      className={`${sizeClass} border border-zinc-700 cursor-pointer relative overflow-hidden transition-transform active:scale-95`}
    >
      {type === 'white' && <div className="absolute inset-0 bg-white" />}
      {type === 'red' && <div className="absolute inset-0 bg-red-600" />}
      {type === 'split1' && (
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 bg-red-600" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        </div>
      )}
      {type === 'split2' && (
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 bg-red-600" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
        </div>
      )}
    </div>
  );
};

export const BlockDesign: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [level, setLevel] = useState(0);
  const [grid, setGrid] = useState<BlockType[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [targetPattern, setTargetPattern] = useState<BlockType[]>([]);

  const levelConfigs = [
    { size: 2, time: 30 },
    { size: 2, time: 45 },
    { size: 3, time: 90 },
  ];

  const currentConfig = levelConfigs[level];

  const generateRandomPattern = useCallback((size: number) => {
    return Array.from({ length: size * size }, () => BLOCK_ROTATIONS[Math.floor(Math.random() * BLOCK_ROTATIONS.length)]);
  }, []);

  useEffect(() => {
    const newPattern = generateRandomPattern(currentConfig.size);
    setTargetPattern(newPattern);
    setGrid(new Array(currentConfig.size * currentConfig.size).fill('white'));
    setIsCorrect(false);
  }, [level, currentConfig.size, generateRandomPattern]);

  const handleBlockClick = (index: number) => {
    const nextGrid = [...grid];
    const currentIndex = BLOCK_ROTATIONS.indexOf(nextGrid[index]);
    nextGrid[index] = BLOCK_ROTATIONS[(currentIndex + 1) % BLOCK_ROTATIONS.length];
    setGrid(nextGrid);

    if (JSON.stringify(nextGrid) === JSON.stringify(targetPattern)) {
      setIsCorrect(true);
      setTimeout(() => {
        if (level < levelConfigs.length - 1) {
          setLevel(prev => prev + 1);
        } else {
          onFinish(100);
        }
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <Timer duration={currentConfig.time} onTimeUp={() => onFinish(level * 30)} isActive={!isCorrect} key={level} />
      
      <div className="flex flex-col md:flex-row gap-12 items-center justify-center w-full">
        <div className="text-center">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Target Pattern</p>
          <div 
            className="grid gap-1 border-4 border-zinc-800 p-1 rounded-lg"
            style={{ gridTemplateColumns: `repeat(${currentConfig.size}, minmax(0, 1fr))` }}
          >
            {targetPattern.map((type, i) => (
              <Block key={i} type={type} size="sm" />
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Your Construction</p>
          <div 
            className="grid gap-1 border-4 border-zinc-800 p-1 rounded-lg"
            style={{ gridTemplateColumns: `repeat(${currentConfig.size}, minmax(0, 1fr))` }}
          >
            {grid.map((type, i) => (
              <Block key={i} type={type} onClick={() => handleBlockClick(i)} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCorrect && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-emerald-500 font-bold flex items-center"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" /> Correct! Next level...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- WMI: Digit Span ---

export const DigitSpan = ({ onFinish }: { onFinish: (score: number) => void }) => {
  const [mode, setMode] = useState<'forward' | 'backward' | 'sequencing'>('forward');
  const [digits, setDigits] = useState<number[]>([]);
  const [userInput, setUserInput] = useState('');
  const [phase, setPhase] = useState<'showing' | 'input'>('showing');
  const [level, setLevel] = useState(3); // Starting with 3 digits
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');

  const generateDigits = useCallback(() => {
    const newDigits = Array.from({ length: level }, () => Math.floor(Math.random() * 9) + 1);
    setDigits(newDigits);
    setPhase('showing');
    setUserInput('');
    setMessage('');
    
    // Show digits one by one
    let i = 0;
    const interval = setInterval(() => {
      if (i >= newDigits.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('input'), 1000);
      }
      i++;
    }, 1000);
  }, [level]);

  useEffect(() => {
    generateDigits();
  }, [generateDigits]);

  const handleSubmit = () => {
    let correct = false;
    const inputArr = userInput.split('').map(Number);
    
    if (mode === 'forward') {
      correct = JSON.stringify(inputArr) === JSON.stringify(digits);
    } else if (mode === 'backward') {
      correct = JSON.stringify(inputArr) === JSON.stringify([...digits].reverse());
    } else {
      correct = JSON.stringify(inputArr) === JSON.stringify([...digits].sort((a, b) => a - b));
    }

    if (correct) {
      setMessage('Correct!');
      setTimeout(() => {
        setLevel(prev => prev + 1);
        setAttempts(0);
      }, 1000);
    } else {
      if (attempts === 0) {
        setMessage('Try again (one more chance)');
        setAttempts(1);
        setTimeout(() => generateDigits(), 1500);
      } else {
        setMessage('Game Over');
        setTimeout(() => onFinish(level * 10), 1500);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="mb-8 text-center">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Mode: {mode.toUpperCase()}</span>
        <h3 className="text-2xl font-bold text-white">Level: {level} Digits</h3>
      </div>

      <div className="h-48 flex items-center justify-center mb-8 bg-zinc-900 w-full rounded-3xl border border-zinc-800 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === 'showing' ? (
            <motion.div
              key={digits.join('')}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="text-7xl font-black text-white"
            >
              {/* This is simplified, in real test it's one by one */}
              <DigitDisplay digits={digits} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full px-8"
            >
              <input
                autoFocus
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="数字を入力..."
                className="w-full bg-transparent border-b-2 border-zinc-700 text-center text-4xl font-bold py-2 focus:outline-none focus:border-white transition-colors"
              />
              <p className="text-center text-zinc-500 text-sm mt-4">Enterキーで決定</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {message && (
        <p className={`text-lg font-bold ${message === 'Correct!' ? 'text-emerald-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      {phase === 'input' && (
        <button
          onClick={handleSubmit}
          className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
        >
          回答する
        </button>
      )}
    </div>
  );
};

const DigitDisplay = ({ digits }: { digits: number[] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (index >= digits.length) return null;

  return (
    <motion.span
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {digits[index]}
    </motion.span>
  );
};

// --- PSI: Coding ---

export const Coding = ({ onFinish }: { onFinish: (score: number) => void }) => {
  const key = [
    { num: 1, sym: '┘' },
    { num: 2, sym: '⊓' },
    { num: 3, sym: '∧' },
    { num: 4, sym: '⊣' },
    { num: 5, sym: '∪' },
    { num: 6, sym: '○' },
    { num: 7, sym: '□' },
    { num: 8, sym: '×' },
    { num: 9, sym: '＝' },
  ];

  const [questions, setQuestions] = useState<number[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const q = Array.from({ length: 50 }, () => Math.floor(Math.random() * 9) + 1);
    setQuestions(q);
  }, []);

  const handleAnswer = (sym: string) => {
    setAnswers([...answers, sym]);
    setCurrentIndex(prev => prev + 1);
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((ans, i) => {
      const expected = key.find(k => k.num === questions[i])?.sym;
      if (ans === expected) correct++;
    });
    onFinish(correct * 2);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl">
      <Timer duration={120} onTimeUp={calculateScore} isActive={true} />

      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 text-center">Reference Key</h4>
        <div className="grid grid-cols-9 gap-2">
          {key.map(k => (
            <div key={k.num} className="flex flex-col items-center border border-zinc-800 rounded-lg p-2 bg-black/20">
              <span className="text-sm font-bold text-zinc-400 mb-1">{k.num}</span>
              <span className="text-xl text-white">{k.sym}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full grid grid-cols-5 md:grid-cols-10 gap-3 mb-12">
        {questions.slice(0, 30).map((q, i) => (
          <div 
            key={i} 
            className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
              i === currentIndex ? 'border-white bg-white/5 scale-110' : 
              i < currentIndex ? 'border-zinc-800 opacity-50' : 'border-zinc-900'
            }`}
          >
            <span className="text-lg font-bold text-white mb-1">{q}</span>
            <div className="w-8 h-8 border border-zinc-800 rounded flex items-center justify-center text-xl">
              {answers[i] || ''}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-9 gap-3 w-full">
        {key.map(k => (
          <button
            key={k.num}
            onClick={() => handleAnswer(k.sym)}
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-500 hover:bg-zinc-800 transition-all text-2xl"
          >
            {k.sym}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- PRI: Matrix Reasoning ---

export const MatrixReasoning: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [level, setLevel] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [currentProblem, setCurrentProblem] = useState<{ matrix: string[], options: string[], correct: number, size: number } | null>(null);

  const generateProblem = useCallback((levelIndex: number) => {
    const shapes = ['○', '●', '□', '■', '△', '▲', '◇', '◆', '☆', '★'];
    const arrows = ['↑', '→', '↓', '←', '↗', '↘', '↙', '↖'];
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    if (levelIndex === 0) {
      // Simple pattern: A B / A ?
      const s1 = shapes[Math.floor(Math.random() * shapes.length)];
      let s2 = shapes[Math.floor(Math.random() * shapes.length)];
      while (s1 === s2) s2 = shapes[Math.floor(Math.random() * shapes.length)];
      
      const options = [s1, s2, shapes[Math.floor(Math.random() * shapes.length)], shapes[Math.floor(Math.random() * shapes.length)], shapes[Math.floor(Math.random() * shapes.length)]];
      // Shuffle options
      const shuffledOptions = [...new Set(options)].slice(0, 5);
      while (shuffledOptions.length < 5) {
        const r = shapes[Math.floor(Math.random() * shapes.length)];
        if (!shuffledOptions.includes(r)) shuffledOptions.push(r);
      }
      const correctIdx = shuffledOptions.indexOf(s2);

      return {
        matrix: [s1, s2, s1, '?'],
        options: shuffledOptions,
        correct: correctIdx,
        size: 2
      };
    } else if (levelIndex === 1) {
      // Rotation pattern
      const startIdx = Math.floor(Math.random() * arrows.length);
      const matrix = [
        arrows[startIdx],
        arrows[(startIdx + 1) % arrows.length],
        arrows[(startIdx + 2) % arrows.length],
        '?'
      ];
      const correctAns = arrows[(startIdx + 3) % arrows.length];
      const options = [correctAns, arrows[(startIdx + 4) % arrows.length], arrows[(startIdx + 5) % arrows.length], arrows[(startIdx + 6) % arrows.length], arrows[(startIdx + 7) % arrows.length]];
      
      return {
        matrix,
        options,
        correct: 0,
        size: 2
      };
    } else {
      // 3x3 Grid progression
      const startNum = Math.floor(Math.random() * 5) + 1;
      const matrix = [];
      for (let i = 0; i < 8; i++) {
        matrix.push((startNum + i).toString());
      }
      matrix.push('?');
      const correctAns = (startNum + 8).toString();
      const options = [correctAns, (startNum + 9).toString(), (startNum + 10).toString(), (startNum + 7).toString(), (startNum + 11).toString()];
      
      return {
        matrix,
        options,
        correct: 0,
        size: 3
      };
    }
  }, []);

  useEffect(() => {
    setCurrentProblem(generateProblem(level));
    setSelected(null);
  }, [level, generateProblem]);

  const handleSelect = (index: number) => {
    if (!currentProblem) return;
    setSelected(index);
    if (index === currentProblem.correct) {
      setTimeout(() => {
        if (level < 2) {
          setLevel(prev => prev + 1);
        } else {
          onFinish(100);
        }
      }, 1000);
    } else {
      setTimeout(() => onFinish(level * 30), 1000);
    }
  };

  if (!currentProblem) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <div className="mb-12 text-center">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Complete the Matrix</p>
        <div 
          className="grid gap-4 bg-zinc-900 p-8 rounded-3xl border border-zinc-800"
          style={{ gridTemplateColumns: `repeat(${currentProblem.size}, minmax(0, 1fr))` }}
        >
          {currentProblem.matrix.map((item, i) => (
            <div key={i} className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-black/40 border border-zinc-800 rounded-2xl text-4xl text-white">
              {item === '?' ? <span className="text-emerald-500 animate-pulse">?</span> : item}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 text-center">Choose the Correct Option</p>
        <div className="grid grid-cols-5 gap-4">
          {currentProblem.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full aspect-square flex items-center justify-center text-3xl rounded-2xl border-2 transition-all ${
                selected === i ? (i === currentProblem.correct ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10') : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- PRI: Visual Puzzles ---

export const VisualPuzzles = ({ onFinish }: { onFinish: (score: number) => void }) => {
  const [level, setLevel] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);

  const levels = [
    {
      target: 'HEXAGON',
      pieces: ['TRIANGLE', 'SQUARE', 'TRAPEZOID', 'TRIANGLE', 'CIRCLE', 'PENTAGON'],
      correct: [0, 2, 3], // Simplified logic
      time: 30
    }
  ];

  const currentLevel = levels[level];

  const togglePiece = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter(i => i !== index));
    } else if (selected.length < 3) {
      const nextSelected = [...selected, index];
      setSelected(nextSelected);
      
      if (nextSelected.length === 3) {
        const isCorrect = nextSelected.sort().join(',') === currentLevel.correct.sort().join(',');
        if (isCorrect) {
          setTimeout(() => onFinish(100), 1000);
        } else {
          setTimeout(() => onFinish(0), 1000);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <Timer duration={currentLevel.time} onTimeUp={() => onFinish(0)} isActive={true} />

      <div className="mb-12 text-center w-full">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Target Shape</p>
        <div className="w-48 h-48 bg-zinc-900 border-2 border-zinc-800 rounded-3xl mx-auto flex items-center justify-center text-zinc-500 font-bold italic">
          [TARGET SHAPE]
        </div>
      </div>

      <div className="w-full">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 text-center">Select 3 Pieces</p>
        <div className="grid grid-cols-3 gap-4">
          {currentLevel.pieces.map((p, i) => (
            <button
              key={i}
              onClick={() => togglePiece(i)}
              className={`aspect-square bg-zinc-900 border-2 rounded-2xl flex items-center justify-center transition-all ${
                selected.includes(i) ? 'border-white scale-95 bg-white/5' : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="text-[10px] text-zinc-600 font-bold">{p}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- PSI: Symbol Search ---

export const SymbolSearch = ({ onFinish }: { onFinish: (score: number) => void }) => {
  const symbols = ['⊓', '∧', '⊣', '∪', '○', '□', '×', '＝', '┘', '∇', '∆', '◊', '⌗', '⌾', '⍟'];
  
  const generateRow = () => {
    const targets = [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]];
    const pool = Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    const hasMatch = Math.random() > 0.5;
    if (hasMatch) {
      pool[Math.floor(Math.random() * pool.length)] = targets[Math.floor(Math.random() * targets.length)];
    }
    return { targets, pool, hasMatch };
  };

  const [currentRow, setCurrentRow] = useState(generateRow());
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const handleAnswer = (answer: boolean) => {
    if (answer === currentRow.hasMatch) {
      setScore(prev => prev + 1);
    }
    setTotal(prev => prev + 1);
    setCurrentRow(generateRow());
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <Timer duration={120} onTimeUp={() => onFinish(score * 2)} isActive={true} />

      <div className="w-full space-y-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Target Symbols</p>
          <div className="flex justify-center gap-8">
            {currentRow.targets.map((s, i) => (
              <span key={i} className="text-5xl text-white">{s}</span>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 text-center">Search Row</p>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {currentRow.pool.map((s, i) => (
              <span key={i} className="text-3xl text-zinc-400">{s}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer(true)}
            className="py-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 font-bold text-xl hover:bg-emerald-500/20 transition-colors"
          >
            YES (含まれる)
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="py-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-bold text-xl hover:bg-red-500/20 transition-colors"
          >
            NO (含まれない)
          </button>
        </div>
      </div>
    </div>
  );
};

// --- WMI: Arithmetic ---

export const Arithmetic: React.FC<{ onFinish: (score: number) => void }> = ({ onFinish }) => {
  const [level, setLevel] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<{ q: string, a: string, time: number } | null>(null);

  const generateQuestion = useCallback((levelIndex: number) => {
    const fruits = ['りんご', 'みかん', 'バナナ', 'ぶどう', 'メロン'];
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    const fruit2 = fruits.filter(f => f !== fruit)[Math.floor(Math.random() * (fruits.length - 1))];

    if (levelIndex === 0) {
      const p1 = (Math.floor(Math.random() * 5) + 3) * 10;
      const p2 = (Math.floor(Math.random() * 3) + 1) * 10;
      const count = Math.floor(Math.random() * 3) + 2;
      const answer = (p1 + p2) * count;
      return {
        q: `1個${p1}円の${fruit}と1個${p2}円の${fruit2}をそれぞれ${count}個ずつ買うといくら？`,
        a: answer.toString(),
        time: 30
      };
    } else if (levelIndex === 1) {
      const price = (Math.floor(Math.random() * 8) + 5) * 10;
      const count = Math.floor(Math.random() * 3) + 2;
      const payment = 1000;
      const answer = payment - (price * count);
      return {
        q: `${price}円のパンを${count}個買い、${payment}円札で払うとお釣りはいくら？`,
        a: answer.toString(),
        time: 30
      };
    } else {
      const speed = Math.floor(Math.random() * 4) + 3;
      const time = Math.floor(Math.random() * 4) + 2;
      const answer = speed * time;
      return {
        q: `時速${speed}kmで${time}時間歩くと、何km進みますか？`,
        a: answer.toString(),
        time: 20
      };
    }
  }, []);

  useEffect(() => {
    setCurrentQuestion(generateQuestion(level));
    setUserInput('');
    setIsCorrect(null);
  }, [level, generateQuestion]);

  const handleSubmit = () => {
    if (!currentQuestion) return;
    if (userInput === currentQuestion.a) {
      setIsCorrect(true);
      setTimeout(() => {
        if (level < 2) {
          setLevel(prev => prev + 1);
        } else {
          onFinish(100);
        }
      }, 1000);
    } else {
      setIsCorrect(false);
      setTimeout(() => onFinish(level * 33), 1000);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-xl">
      <Timer duration={currentQuestion.time} onTimeUp={() => onFinish(level * 33)} isActive={isCorrect === null} key={level} />

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full mb-8 text-center min-h-[200px] flex items-center justify-center">
        <p className="text-2xl font-medium text-white leading-relaxed">
          {currentQuestion.q}
        </p>
      </div>

      <div className="w-full space-y-6">
        <input
          autoFocus
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="答えを入力..."
          className={`w-full bg-zinc-900 border-2 rounded-2xl p-6 text-center text-4xl font-bold focus:outline-none transition-all ${
            isCorrect === true ? 'border-emerald-500 text-emerald-500' : 
            isCorrect === false ? 'border-red-500 text-red-500' : 'border-zinc-800 focus:border-white'
          }`}
        />
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
        >
          回答する
        </button>
      </div>
    </div>
  );
};
