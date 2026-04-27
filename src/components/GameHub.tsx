"use client";

import React, { useState } from 'react';
import { Gamepad2, Puzzle, Zap, Trophy } from 'lucide-react';
import FacePuzzle from './games/FacePuzzle';
import CyberConnect from './games/CyberConnect';
import NeonHockey from './games/NeonHockey';

type Game = 'face-puzzle' | 'cyber-connect' | 'neon-hockey' | null;

export default function GameHub() {
  const [activeGame, setActiveGame] = useState<Game>(null);

  const games = [
    {
      id: 'face-puzzle',
      name: 'Your Face Puzzle',
      description: 'Take a snapshot of your face and solve the puzzle with hand gestures.',
      icon: <Puzzle className="w-12 h-12 text-blue-400" />,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'cyber-connect',
      name: 'Cyber Connect',
      description: 'Connect the dots 1 ➜ 2 ➜ 3 without breaking the line. Don\'t cross your own line!',
      icon: <Zap className="w-12 h-12 text-yellow-400" />,
      color: 'from-yellow-600 to-orange-600'
    },
    {
      id: 'neon-hockey',
      name: 'Neon Hand Hockey',
      description: 'Deflect the ball and score in the opponent\'s goal using your hands.',
      icon: <Gamepad2 className="w-12 h-12 text-pink-400" />,
      color: 'from-pink-600 to-rose-600'
    }
  ];

  if (activeGame === 'face-puzzle') return <FacePuzzle onBack={() => setActiveGame(null)} />;
  if (activeGame === 'cyber-connect') return <CyberConnect onBack={() => setActiveGame(null)} />;
  if (activeGame === 'neon-hockey') return <NeonHockey onBack={() => setActiveGame(null)} />;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          HandTrack Gaming Hub
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto">
          Experience the future of gaming with MediaPipe hand tracking. Control games directly with your hands in mid-air.
        </p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id as Game)}
            className={`relative group overflow-hidden rounded-3xl p-1 transition-all hover:scale-105 active:scale-95`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-[22px] p-8 h-full flex flex-col items-center text-center">
              <div className="mb-6 p-4 rounded-2xl bg-slate-800 group-hover:bg-slate-700 transition-colors">
                {game.icon}
              </div>
              <h2 className="text-2xl font-bold mb-3">{game.name}</h2>
              <p className="text-slate-400 leading-relaxed">
                {game.description}
              </p>
              <div className="mt-auto pt-8">
                <span className="px-6 py-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors font-semibold">
                  Play Now
                </span>
              </div>
            </div>
          </button>
        ))}
      </main>

      <footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <span>Top scores resetting every 24 hours</span>
        </div>
        <div className="flex flex-col items-center md:items-end">
          <span>Developed By <span className="text-blue-400 font-medium">Ahmed Abuzuraiq</span></span>
          <span className="text-xs">Rebuilt with Next.js & Drizzle</span>
        </div>
      </footer>
    </div>
  );
}
