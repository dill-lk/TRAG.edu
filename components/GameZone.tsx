import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Timer, Brain, RefreshCw, X, Check, Calculator, Gamepad2, Puzzle, Type, HelpCircle, Lightbulb } from 'lucide-react';

// --- Math Game Component ---
const MathGame = ({ onExit }: { onExit: () => void }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');

  const generateQuestion = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    
    setQuestion(`${num1} ${op} ${num2}`);
    // eslint-disable-next-line
    setAnswer(eval(`${num1} ${op} ${num2}`));
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer) === answer) {
      setScore(score + 10);
      setMessage('Correct! +10');
      setTimeLeft(prev => Math.min(prev + 2, 30)); // Bonus time
      generateQuestion();
      setUserAnswer('');
    } else {
      setScore(Math.max(0, score - 5));
      setMessage('Wrong! -5');
    }
    setTimeout(() => setMessage(''), 1000);
  };

  return (
    <div className="max-w-md mx-auto p-6 glass-card rounded-[2.5rem] relative overflow-hidden text-center animate-in zoom-in-95">
      <div className="absolute top-0 left-0 w-full h-2 bg-slate-200 dark:bg-slate-800">
        <div 
          className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / 30) * 100}%` }}
        ></div>
      </div>
      
      <button onClick={onExit} className="absolute top-4 right-4 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-slate-400">
        <X size={20} />
      </button>

      {!gameOver ? (
        <>
          <div className="flex justify-between items-center mb-8 px-4">
            <div className="flex items-center gap-2 text-blue-500 font-black">
              <Trophy size={18} />
              <span>{score}</span>
            </div>
            <div className={`flex items-center gap-2 font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
              <Timer size={18} />
              <span>{timeLeft}s</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{question}</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Calculate the answer</p>
          </div>

          <form onSubmit={handleSubmit} className="relative">
             <input 
              type="number" 
              autoFocus
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-4 px-6 text-center text-2xl font-bold focus:ring-4 focus:ring-blue-500/20 outline-none mb-4"
              placeholder="?"
             />
             <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
               Submit
             </button>
             {message && (
               <div className={`absolute -top-12 left-0 right-0 font-bold ${message.includes('Correct') ? 'text-green-500' : 'text-red-500'} animate-bounce`}>
                 {message}
               </div>
             )}
          </form>
        </>
      ) : (
        <div className="py-10">
          <Trophy size={64} className="mx-auto text-yellow-500 mb-6 animate-bounce" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Time's Up!</h2>
          <p className="text-slate-500 font-bold mb-8">Final Score: <span className="text-blue-500 text-xl">{score}</span></p>
          <button 
            onClick={() => {
              setGameOver(false);
              setScore(0);
              setTimeLeft(30);
              generateQuestion();
            }}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

// --- Memory Match Component ---
const MemoryGame = ({ onExit }: { onExit: () => void }) => {
  const [cards, setCards] = useState<{id: number, content: string, flipped: boolean, matched: boolean}[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);

  const icons = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  useEffect(() => {
    const shuffled = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({ id: index, content, flipped: false, matched: false }));
    setCards(shuffled);
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].content === cards[second].content) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setMatchedPairs(p => p + 1);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 glass-card rounded-[2.5rem] relative text-center animate-in zoom-in-95">
      <button onClick={onExit} className="absolute top-4 right-4 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-slate-400">
        <X size={20} />
      </button>

      <div className="flex justify-between items-center mb-6 px-4">
        <div className="text-left">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Memory Match</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Find the pairs</p>
        </div>
        <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl">
           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Moves: {moves}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              aspect-square rounded-xl flex items-center justify-center text-2xl font-black cursor-pointer transition-all duration-500 transform
              ${card.flipped || card.matched ? 'bg-blue-600 text-white rotate-y-180' : 'bg-slate-200 dark:bg-white/5 text-transparent hover:bg-slate-300 dark:hover:bg-white/10'}
            `}
          >
             {card.flipped || card.matched ? card.content : '?'}
          </div>
        ))}
      </div>

      {matchedPairs === icons.length && (
         <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2.5rem]">
            <Trophy size={64} className="text-yellow-500 mb-4 animate-bounce" />
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">You Won!</h3>
            <p className="text-slate-500 font-bold mb-6">Completed in {moves} moves</p>
            <button 
              onClick={() => {
                const shuffled = [...icons, ...icons].sort(() => Math.random() - 0.5).map((content, index) => ({ id: index, content, flipped: false, matched: false }));
                setCards(shuffled);
                setMatchedPairs(0);
                setMoves(0);
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
            >
              Restart
            </button>
         </div>
      )}
    </div>
  );
};

// --- Word Scramble Component ---
const WordScramble = ({ onExit }: { onExit: () => void }) => {
    const WORDS = useMemo(() => ['OSMOSIS', 'GRAVITY', 'ALGEBRA', 'SONNET', 'GLACIER', 'ISOTOPE', 'VECTOR', 'SYNTAX', 'BUDDHISM', 'HISTORY'], []);
    
    const [word, setWord] = useState('');
    const [scrambled, setScrambled] = useState('');
    const [guess, setGuess] = useState('');
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');
    const [completed, setCompleted] = useState<string[]>([]);

    useEffect(() => {
        nextWord();
    }, []);

    const nextWord = () => {
        const available = WORDS.filter(w => !completed.includes(w));
        if (available.length === 0) {
            setMessage('All words completed!');
            return;
        }
        const w = available[Math.floor(Math.random() * available.length)];
        setWord(w);
        setScrambled(w.split('').sort(() => Math.random() - 0.5).join(''));
        setGuess('');
    };

    const handleCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (guess.toUpperCase() === word) {
            setScore(score + 20);
            setMessage('Correct!');
            setCompleted([...completed, word]);
            setTimeout(() => {
                setMessage('');
                nextWord();
            }, 1000);
        } else {
            setMessage('Try again!');
            setTimeout(() => setMessage(''), 1000);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 glass-card rounded-[2.5rem] relative text-center animate-in zoom-in-95">
            <button onClick={onExit} className="absolute top-4 right-4 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-slate-400">
                <X size={20} />
            </button>
            
            <div className="flex justify-between items-center mb-8 px-4">
                <div className="flex items-center gap-2 text-emerald-500 font-black">
                    <Trophy size={18} />
                    <span>{score}</span>
                </div>
                <div className="bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{completed.length} / {WORDS.length}</span>
                </div>
            </div>

            <div className="mb-10">
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-[0.5em] mb-4">{scrambled}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Unscramble the subject word</p>
            </div>

            <form onSubmit={handleCheck} className="relative">
                <input 
                    type="text" 
                    autoFocus
                    value={guess}
                    onChange={(e) => setGuess(e.target.value.toUpperCase())}
                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-4 px-6 text-center text-xl font-bold focus:ring-4 focus:ring-emerald-500/20 outline-none mb-4 tracking-widest"
                    placeholder="YOUR GUESS"
                />
                <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                    Check Word
                </button>
                {message && (
                    <div className={`absolute -top-12 left-0 right-0 font-bold ${message.includes('Correct') ? 'text-green-500' : 'text-red-500'} animate-bounce`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

// --- Quiz Challenge Component ---
const QuizChallenge = ({ onExit }: { onExit: () => void }) => {
    const QUESTIONS = [
        { q: "Who wrote 'Madol Doowa'?", options: ['Martin Wickramasinghe', 'Kumaratunga Munidasa', 'Ediriweera Sarachchandra'], a: 0 },
        { q: "What is the powerhouse of the cell?", options: ['Nucleus', 'Mitochondria', 'Ribosome'], a: 1 },
        { q: "Value of Pi (2 decimals)?", options: ['3.12', '3.16', '3.14'], a: 2 },
        { q: "In which year did Sri Lanka gain independence?", options: ['1948', '1972', '1815'], a: 0 },
        { q: "Chemical symbol for Gold?", options: ['Ag', 'Au', 'Fe'], a: 1 },
    ];

    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [selected, setSelected] = useState<number | null>(null);

    const handleAnswer = (idx: number) => {
        setSelected(idx);
        if (idx === QUESTIONS[current].a) {
            setScore(score + 10);
        }
        
        setTimeout(() => {
            setSelected(null);
            if (current < QUESTIONS.length - 1) {
                setCurrent(current + 1);
            } else {
                setGameOver(true);
            }
        }, 800);
    };

    return (
        <div className="max-w-md mx-auto p-6 glass-card rounded-[2.5rem] relative text-center animate-in zoom-in-95">
            <button onClick={onExit} className="absolute top-4 right-4 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-slate-400">
                <X size={20} />
            </button>

            {!gameOver ? (
                <>
                    <div className="flex justify-between items-center mb-8 px-4">
                        <div className="flex items-center gap-2 text-purple-500 font-black">
                            <Trophy size={18} />
                            <span>{score}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Q {current + 1}/{QUESTIONS.length}</span>
                    </div>

                    <div className="mb-8 min-h-[100px] flex items-center justify-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">{QUESTIONS[current].q}</h2>
                    </div>

                    <div className="space-y-3">
                        {QUESTIONS[current].options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={selected !== null}
                                className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-between px-6
                                    ${selected === idx 
                                        ? (idx === QUESTIONS[current].a ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}
                                `}
                            >
                                <span>{opt}</span>
                                {selected === idx && (
                                    idx === QUESTIONS[current].a ? <Check size={18} /> : <X size={18} />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="py-10">
                    <Trophy size={64} className="mx-auto text-yellow-500 mb-6 animate-bounce" />
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Quiz Complete!</h3>
                    <p className="text-slate-500 font-bold mb-8">Score: <span className="text-purple-500 text-xl">{score}/{QUESTIONS.length * 10}</span></p>
                    <button 
                        onClick={() => {
                            setGameOver(false);
                            setScore(0);
                            setCurrent(0);
                        }}
                        className="px-8 py-3 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main Game Zone ---
const GameZone = () => {
  const [activeGame, setActiveGame] = useState<'math' | 'memory' | 'word' | 'quiz' | null>(null);

  if (activeGame === 'math') return <MathGame onExit={() => setActiveGame(null)} />;
  if (activeGame === 'memory') return <MemoryGame onExit={() => setActiveGame(null)} />;
  if (activeGame === 'word') return <WordScramble onExit={() => setActiveGame(null)} />;
  if (activeGame === 'quiz') return <QuizChallenge onExit={() => setActiveGame(null)} />;

  const games = [
    { id: 'math', title: 'Math Master', icon: Calculator, desc: 'Time-attack arithmetic challenge', color: 'text-blue-600', grad: 'from-blue-600 to-indigo-700' },
    { id: 'memory', title: 'Memory Match', icon: Brain, desc: 'Train your short-term memory', color: 'text-purple-600', grad: 'from-purple-600 to-pink-600' },
    { id: 'word', title: 'Word Scramble', icon: Type, desc: 'Unscramble subject vocabulary', color: 'text-emerald-600', grad: 'from-emerald-500 to-teal-700' },
    { id: 'quiz', title: 'Quiz Master', icon: HelpCircle, desc: 'General knowledge trivia', color: 'text-orange-600', grad: 'from-orange-500 to-red-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-8">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
          <Gamepad2 size={14} />
          <span>Brain Gym</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
          Educational <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Games</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto">
          Sharpen your mind with our interactive challenges. Learning doesn't have to be boring!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {games.map((g: any) => (
            <div 
                key={g.id}
                onClick={() => setActiveGame(g.id)}
                className="group relative h-80 rounded-[3rem] overflow-hidden cursor-pointer shadow-2xl transition-all hover:-translate-y-2"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${g.grad}`}></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                
                <div className="absolute top-8 right-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl group-hover:scale-110 transition-transform">
                    <g.icon className="text-white" size={32} />
                </div>

                <div className="absolute bottom-0 left-0 p-10">
                    <h3 className="text-3xl font-black text-white mb-2">{g.title}</h3>
                    <p className="text-white/80 font-medium mb-6">{g.desc}</p>
                    <span className={`px-6 py-3 bg-white ${g.color} rounded-xl font-black uppercase text-[10px] tracking-widest`}>Play Now</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default GameZone;
