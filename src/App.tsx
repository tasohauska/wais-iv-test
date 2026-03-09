/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Eye, 
  Clock, 
  Hash, 
  ChevronRight, 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Calculator,
  Grid3X3,
  Puzzle,
  Search,
  Binary
} from 'lucide-react';

import { 
  BlockDesign, 
  DigitSpan, 
  Coding, 
  MatrixReasoning, 
  VisualPuzzles, 
  Arithmetic, 
  SymbolSearch 
} from './components/Games';

// --- Types ---

type IndexType = 'VCI' | 'PRI' | 'WMI' | 'PSI';

interface Game {
  id: string;
  name: string;
  description: string;
  index: IndexType;
  icon: React.ReactNode;
  rules: string[];
}

// --- Constants ---

const INDICES: { type: IndexType; name: string; description: string; color: string; icon: React.ReactNode }[] = [
  { 
    type: 'VCI', 
    name: '言語理解 (VCI)', 
    description: '言葉の知識や思考力', 
    color: 'from-blue-500 to-cyan-500',
    icon: <Brain className="w-8 h-8" />
  },
  { 
    type: 'PRI', 
    name: '知覚推理 (PRI)', 
    description: '目で見た情報を処理する力', 
    color: 'from-purple-500 to-pink-500',
    icon: <Eye className="w-8 h-8" />
  },
  { 
    type: 'WMI', 
    name: 'ワーキングメモリー (WMI)', 
    description: '耳で聞いた情報の保持', 
    color: 'from-orange-500 to-yellow-500',
    icon: <Hash className="w-8 h-8" />
  },
  { 
    type: 'PSI', 
    name: '処理速度 (PSI)', 
    description: '作業のスピードと正確性', 
    color: 'from-emerald-500 to-teal-500',
    icon: <Clock className="w-8 h-8" />
  },
];

const GAMES: Game[] = [
  // PRI
  {
    id: 'block-design',
    name: '積木模様',
    description: '提示された模様を立方体で再現する',
    index: 'PRI',
    icon: <Grid3X3 className="w-6 h-6" />,
    rules: ['2x2または3x3のグリッド', '赤・白・半々のブロックを回転', '制限時間内に完成させる']
  },
  {
    id: 'matrix-reasoning',
    name: '行列推理',
    description: '不完全な図形パターンの欠損部分を選択',
    index: 'PRI',
    icon: <Puzzle className="w-6 h-6" />,
    rules: ['パターンの論理を読み解く', '5-6個の選択肢から1つ選ぶ', '時間制限なし']
  },
  {
    id: 'visual-puzzles',
    name: 'パズル',
    description: '3つのピースを頭の中で組み合わせて完成図を作る',
    index: 'PRI',
    icon: <Puzzle className="w-6 h-6" />,
    rules: ['完成図に必要な3つのピースを選択', '回転・組み合わせを想像', '制限時間あり']
  },
  // WMI
  {
    id: 'digit-span',
    name: '数唱',
    description: '数字の列を順番通り、逆順、または小さい順に答える',
    index: 'WMI',
    icon: <Binary className="w-6 h-6" />,
    rules: ['順唱・逆唱・数整列の3パート', '徐々に桁数が増える', '2回ミスで終了']
  },
  {
    id: 'arithmetic',
    name: '算数',
    description: '口頭の文章題を暗算で解く',
    index: 'WMI',
    icon: <Calculator className="w-6 h-6" />,
    rules: ['紙・鉛筆なしの暗算', '制限時間あり', '難易度が徐々に上昇']
  },
  // PSI
  {
    id: 'symbol-search',
    name: '記号探し',
    description: 'ターゲット記号が検索欄にあるか判定する',
    index: 'PSI',
    icon: <Search className="w-6 h-6" />,
    rules: ['ターゲットが含まれるか「はい/いいえ」で回答', '120秒の制限時間', '正確さと速さが重要']
  },
  {
    id: 'coding',
    name: '符号',
    description: '数字に対応する記号を書き写す',
    index: 'PSI',
    icon: <Binary className="w-6 h-6" />,
    rules: ['対応表を見ながら記号を選択', '120秒の制限時間', '運動速度と注意集中']
  }
];

// --- Components ---

const Header = ({ onBack, title }: { onBack?: () => void; title: string }) => (
  <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 z-50 flex items-center px-4 md:px-8">
    {onBack && (
      <button 
        onClick={onBack}
        className="p-2 hover:bg-zinc-800 rounded-full transition-colors mr-4"
      >
        <ArrowLeft className="w-6 h-6 text-zinc-400" />
      </button>
    )}
    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
      {title}
    </h1>
  </header>
);

const IndexCard: React.FC<{ index: typeof INDICES[0]; onClick: () => void }> = ({ index, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl p-6 text-left h-48 group transition-all duration-300 ${index.type === 'VCI' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    disabled={index.type === 'VCI'}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${index.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-start justify-between">
        <div className="p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
          {index.icon}
        </div>
        {index.type === 'VCI' && (
          <span className="text-[10px] uppercase tracking-widest font-bold bg-zinc-800 px-2 py-1 rounded text-zinc-400">
            Coming Soon
          </span>
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{index.name}</h3>
        <p className="text-sm text-zinc-400 leading-tight">{index.description}</p>
      </div>
    </div>
  </motion.button>
);

const GameCard: React.FC<{ game: Game; onClick: () => void }> = ({ game, onClick }) => (
  <motion.button
    whileHover={{ x: 4 }}
    onClick={onClick}
    className="w-full flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors group"
  >
    <div className="p-3 bg-zinc-800 rounded-lg mr-4 group-hover:bg-zinc-700 transition-colors">
      {game.icon}
    </div>
    <div className="flex-1 text-left">
      <h4 className="font-bold text-white">{game.name}</h4>
      <p className="text-xs text-zinc-500">{game.description}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
  </motion.button>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'home' | 'index_selection' | 'game_intro' | 'playing' | 'results'>('home');
  const [selectedIndex, setSelectedIndex] = useState<IndexType | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [score, setScore] = useState<number>(0);

  const handleIndexSelect = (type: IndexType) => {
    if (type === 'VCI') return;
    setSelectedIndex(type);
    setView('index_selection');
  };

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setView('game_intro');
  };

  const startGame = () => {
    setScore(0);
    setView('playing');
  };

  const finishGame = (finalScore: number) => {
    setScore(finalScore);
    setView('results');
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    switch (selectedGame.id) {
      case 'block-design':
        return <BlockDesign onFinish={finishGame} />;
      case 'digit-span':
        return <DigitSpan onFinish={finishGame} />;
      case 'coding':
        return <Coding onFinish={finishGame} />;
      case 'matrix-reasoning':
        return <MatrixReasoning onFinish={finishGame} />;
      case 'visual-puzzles':
        return <VisualPuzzles onFinish={finishGame} />;
      case 'arithmetic':
        return <Arithmetic onFinish={finishGame} />;
      case 'symbol-search':
        return <SymbolSearch onFinish={finishGame} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-white/20">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6 pt-32 pb-20"
          >
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-block p-4 bg-white/5 rounded-3xl border border-white/10 mb-6"
              >
                <Brain className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4">
                WAIS-IV <span className="text-zinc-500 italic">MOCK</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                成人知能検査の模擬トレーニングアプリケーション。
                各指標に基づいた課題で認知能力の特性を体験しましょう。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INDICES.map((index) => (
                <IndexCard 
                  key={index.type} 
                  index={index} 
                  onClick={() => handleIndexSelect(index.type)} 
                />
              ))}
            </div>

            <div className="mt-16 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center">
              <AlertCircle className="w-6 h-6 text-zinc-500 mx-auto mb-4" />
              <p className="text-sm text-zinc-500 leading-relaxed">
                ※本アプリは学習・体験を目的とした模擬テストです。
                実際のIQを正確に測定するものではありません。
                正式な診断が必要な場合は、専門機関での受診をお勧めします。
              </p>
            </div>
          </motion.div>
        )}

        {view === 'index_selection' && selectedIndex && (
          <motion.div
            key="index_selection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto px-6 pt-24 pb-20"
          >
            <Header onBack={() => setView('home')} title={INDICES.find(i => i.type === selectedIndex)?.name || ''} />
            
            <div className="mb-8">
              <p className="text-zinc-400 mb-8">
                {INDICES.find(i => i.type === selectedIndex)?.description}に関連する下位検査を選択してください。
              </p>
              <div className="space-y-3">
                {GAMES.filter(g => g.index === selectedIndex).map(game => (
                  <GameCard key={game.id} game={game} onClick={() => handleGameSelect(game)} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'game_intro' && selectedGame && (
          <motion.div
            key="game_intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-2xl mx-auto px-6 pt-24 pb-20"
          >
            <Header onBack={() => setView('index_selection')} title={selectedGame.name} />
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-zinc-800 rounded-2xl mr-4">
                  {selectedGame.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedGame.name}</h2>
                  <p className="text-zinc-500">{selectedGame.description}</p>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-3">ルール</h3>
                  <ul className="space-y-2">
                    {selectedGame.rules.map((rule, i) => (
                      <li key={i} className="flex items-start text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center group"
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                テストを開始する
              </button>
            </div>
          </motion.div>
        )}

        {view === 'playing' && selectedGame && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col"
          >
            <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6">
              <div className="flex items-center">
                <div className="p-2 bg-zinc-800 rounded-lg mr-3">
                  {selectedGame.icon}
                </div>
                <span className="font-bold text-white">{selectedGame.name}</span>
              </div>
              <button 
                onClick={() => setView('game_intro')}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                中断する
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center">
               {renderGame()}
            </div>
          </motion.div>
        )}

        {view === 'results' && selectedGame && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto px-6 pt-24 pb-20 text-center"
          >
            <div className="mb-12">
              <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">テスト完了</h2>
              <p className="text-zinc-500">{selectedGame.name} の模擬セッションが終了しました。</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">スコア</span>
                <span className="text-3xl font-bold text-white">{score}</span>
              </div>
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">評価</span>
                <span className="text-3xl font-bold text-white">
                  {score >= 80 ? '優秀' : score >= 50 ? '良好' : '練習が必要'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setView('playing')}
                className="w-full py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                もう一度挑戦する
              </button>
              <button
                onClick={() => setView('home')}
                className="w-full py-4 bg-transparent text-zinc-500 font-bold rounded-xl hover:bg-zinc-900 transition-colors"
              >
                トップに戻る
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
