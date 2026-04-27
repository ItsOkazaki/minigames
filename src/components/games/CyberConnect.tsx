"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { cn } from '@/lib/utils';

interface CyberConnectProps {
  onBack: () => void;
}

const CyberConnect: React.FC<CyberConnectProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'dz';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { videoRef, resultsRef, isLoaded, initHandTracking } = useHandTracking();
  
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'ROUND_END' | 'MATCH_END'>('MENU');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [currentLevel, setCurrentLevel] = useState(1);
  const [winnerMessage, setWinnerMessage] = useState('');
  const [winnerColor, setWinnerColor] = useState('');

  // Refs for game state to avoid stale closures in the loop
  const stateRef = useRef({
    gameState: 'MENU' as any,
    currentLevel: 1,
    scores: { p1: 0, p2: 0 },
    p1: { currentIdx: 0, color: '#00fff2', finished: false, handPos: { x: 0, y: 0 }, targetPos: { x: 0, y: 0, active: false }, path: [] as any[], isDrawing: false },
    p2: { currentIdx: 0, color: '#ff00de', finished: false, handPos: { x: 0, y: 0 }, targetPos: { x: 0, y: 0, active: false }, path: [] as any[], isDrawing: false },
    roundData: [] as any[]
  });

  const gameLoopRef = useRef<number | null>(null);

  const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

  const generateLevel = (numDots: number) => {
    const dots = [];
    const minDistance = 0.2;
    for (let i = 0; i < numDots; i++) {
      let attempts = 0;
      let valid = false;
      let x = 0, y = 0;
      while (!valid && attempts < 50) {
        x = 0.15 + Math.random() * 0.7;
        y = 0.2 + Math.random() * 0.6;
        valid = true;
        for (let prev of dots) {
          const d = Math.sqrt((x - prev.x) ** 2 + (y - prev.y) ** 2);
          if (d < minDistance) {
            valid = false;
            break;
          }
        }
        attempts++;
      }
      dots.push({ x, y });
    }
    return dots;
  };

  const getDotPos = (playerKey: 'p1' | 'p2', normalizedDot: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const w = canvas.width;
    const h = canvas.height;
    const areaW = w / 2;
    let finalX;
    if (playerKey === 'p2') finalX = normalizedDot.x * areaW;
    else finalX = (w / 2) + (normalizedDot.x * areaW);
    return { x: finalX, y: normalizedDot.y * h };
  };

  const checkSelfCollision = (path: any[]) => {
    if (path.length < 10) return false;
    const last = path[path.length - 1];
    for (let i = 0; i < path.length - 8; i++) {
      const dist = Math.sqrt((last.x - path[i].x) ** 2 + (last.y - path[i].y) ** 2);
      if (dist < 5) return true;
    }
    return false;
  };

  const handleRoundWin = (winnerKey: 'p1' | 'p2') => {
    stateRef.current.gameState = 'ROUND_END';
    setGameState('ROUND_END');

    const newScores = { ...stateRef.current.scores, [winnerKey]: stateRef.current.scores[winnerKey] + 1 };
    stateRef.current.scores = newScores;
    setScores(newScores);

    const winnerName = winnerKey === 'p1' ? "PLAYER 1" : "PLAYER 2";
    setWinnerColor((stateRef.current as any)[winnerKey].color);

    if (newScores[winnerKey] >= 5) {
      setWinnerMessage(`${winnerName} ${t('cyberConnect.winMatch')}`);
      stateRef.current.gameState = 'MATCH_END';
      setGameState('MATCH_END');
      setTimeout(() => {
        stateRef.current.gameState = 'MENU';
        setGameState('MENU');
        stateRef.current.scores = { p1: 0, p2: 0 };
        setScores({ p1: 0, p2: 0 });
        stateRef.current.currentLevel = 1;
        setCurrentLevel(1);
      }, 5000);
    } else {
      setWinnerMessage(`${winnerName} ${t('cyberConnect.winLevel')} ${stateRef.current.currentLevel}!`);
      setTimeout(() => {
        stateRef.current.currentLevel++;
        setCurrentLevel(stateRef.current.currentLevel);
        startNextRound(stateRef.current.currentLevel);
      }, 3000);
    }
  };

  const startNextRound = (levelNum: number) => {
    stateRef.current.p1.currentIdx = 0;
    stateRef.current.p1.finished = false;
    stateRef.current.p1.path = [];
    stateRef.current.p1.isDrawing = false;
    stateRef.current.p2.currentIdx = 0;
    stateRef.current.p2.finished = false;
    stateRef.current.p2.path = [];
    stateRef.current.p2.isDrawing = false;
    stateRef.current.roundData = generateLevel(levelNum + 2);
    stateRef.current.gameState = 'PLAYING';
    setGameState('PLAYING');
  };

  const updateAndDraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoRef.current;
    if (!canvas || !ctx || !video) return;

    // Process Hand Landmarks from resultsRef
    const results = resultsRef.current;
    let p1Found = false, p2Found = false;
    if (results && results.multiHandLandmarks) {
      results.multiHandLandmarks.forEach((landmarks: any) => {
        // Original code used 1 - landmarks[8].x which is correct for manual mirroring
        const x = (1 - landmarks[8].x) * canvas.width;
        const y = landmarks[8].y * canvas.height;
        if (x > canvas.width / 2) {
          stateRef.current.p1.targetPos = { x, y, active: true };
          p1Found = true;
        } else {
          stateRef.current.p2.targetPos = { x, y, active: true };
          p2Found = true;
        }
      });
    }
    if (!p1Found) stateRef.current.p1.targetPos.active = false;
    if (!p2Found) stateRef.current.p2.targetPos.active = false;

    // Update Game Logic
    ['p1', 'p2'].forEach(pKey => {
      const p = (stateRef.current as any)[pKey];
      if (p.targetPos.active) {
        if (p.handPos.x === 0 && p.handPos.y === 0) {
          p.handPos.x = p.targetPos.x;
          p.handPos.y = p.targetPos.y;
        } else {
          p.handPos.x = lerp(p.handPos.x, p.targetPos.x, 0.5);
          p.handPos.y = lerp(p.handPos.y, p.targetPos.y, 0.5);
        }
      }

      if (stateRef.current.gameState !== 'PLAYING' || !p.targetPos.active || p.finished) return;
      const handX = p.handPos.x;
      const handY = p.handPos.y;

      if (p.currentIdx === 0) {
        const startDot = stateRef.current.roundData[0];
        if (startDot) {
          const screenPos = getDotPos(pKey as any, startDot);
          const dist = Math.sqrt((handX - screenPos.x) ** 2 + (handY - screenPos.y) ** 2);
          if (dist < 40) {
            p.currentIdx = 1;
            p.isDrawing = true;
            p.path = [{ x: handX, y: handY }];
          }
        }
      } else if (p.isDrawing) {
        const lastPt = p.path[p.path.length - 1];
        if (Math.sqrt((handX - lastPt.x) ** 2 + (handY - lastPt.y) ** 2) > 5) {
          p.path.push({ x: handX, y: handY });
          if (checkSelfCollision(p.path)) {
            p.currentIdx = 0;
            p.isDrawing = false;
            p.path = [];
            return;
          }
        }
        const targetDot = stateRef.current.roundData[p.currentIdx];
        if (targetDot) {
          const targetPos = getDotPos(pKey as any, targetDot);
          if (Math.sqrt((handX - targetPos.x) ** 2 + (handY - targetPos.y) ** 2) < 40) {
            p.currentIdx++;
            if (p.currentIdx >= stateRef.current.roundData.length) {
              p.finished = true;
              p.isDrawing = false;
              handleRoundWin(pKey as any);
            }
          }
        }
      }
    });

    // Rendering
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.globalAlpha = 0.6;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 15]);
    ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
    ctx.setLineDash([]);

    if (stateRef.current.gameState === 'PLAYING' || stateRef.current.gameState === 'ROUND_END') {
      ['p1', 'p2'].forEach(key => {
        const p = (stateRef.current as any)[key];
        if (p.path.length > 0) {
          ctx.beginPath();
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.lineWidth = 10;
          ctx.strokeStyle = p.color;
          ctx.shadowBlur = 20;
          ctx.shadowColor = p.color;
          ctx.moveTo(p.path[0].x, p.path[0].y);
          for (let i = 1; i < p.path.length; i++) ctx.lineTo(p.path[i].x, p.path[i].y);
          if (p.isDrawing && p.targetPos.active) ctx.lineTo(p.handPos.x, p.handPos.y);
          ctx.stroke();
        }

        stateRef.current.roundData.forEach((dot, index) => {
          const pos = getDotPos(key as any, dot);
          const isPassed = index < p.currentIdx;
          const isNext = index === p.currentIdx;
          let color = '#444';
          let radius = 15;
          let label = (index + 1).toString();
          if (index === 0) { color = '#ff0033'; if (isNext) label = "START"; }
          if (index === stateRef.current.roundData.length - 1) { color = '#00ff33'; label = "FINISH"; }

          ctx.beginPath();
          if (isPassed) {
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
          } else if (isNext) {
            ctx.fillStyle = index === 0 ? '#ff0033' : '#fff';
            radius = 25 + Math.sin(Date.now() / 100) * 5;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#fff';
          } else {
            ctx.fillStyle = color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;
          }
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fill();
          if (!isPassed && !isNext) ctx.stroke();

          ctx.fillStyle = (isPassed || isNext) ? '#000' : '#fff';
          ctx.font = 'bold 16px Cairo';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, pos.x, pos.y);
        });
      });
      ctx.shadowBlur = 0;
    }

    ['p1', 'p2'].forEach(key => {
      const p = (stateRef.current as any)[key];
      if (p.targetPos.active) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(p.handPos.x, p.handPos.y, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(p.handPos.x, p.handPos.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(p.handPos.x - 10, p.handPos.y); ctx.lineTo(p.handPos.x + 10, p.handPos.y);
        ctx.moveTo(p.handPos.x, p.handPos.y - 10); ctx.lineTo(p.handPos.x, p.handPos.y + 10);
        ctx.stroke();
      }
    });

    gameLoopRef.current = requestAnimationFrame(updateAndDraw);
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      updateAndDraw();
    }
  }, [isLoaded]);

  const handleStartGame = () => {
    setGameState('PLAYING');
    stateRef.current.currentLevel = 1;
    setCurrentLevel(1);
    stateRef.current.scores = { p1: 0, p2: 0 };
    setScores({ p1: 0, p2: 0 });
    startNextRound(1);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-tech">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
        <button 
          onClick={onBack}
          className={cn(
            "pointer-events-auto bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/20 transition-all text-white",
            isRTL ? "order-last" : ""
          )}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-12 items-center bg-black/40 backdrop-blur-md px-8 py-3 rounded-full border border-white/10">
            <div className="text-center">
              <p className="text-xs opacity-50 uppercase tracking-widest">{t('neonHockey.player2')}</p>
              <p className="text-3xl font-bold text-neon-pink drop-shadow-[0_0_8px_rgba(255,0,222,0.6)]">{scores.p2}</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-xs opacity-50 uppercase tracking-widest">{t('neonHockey.player1')}</p>
              <p className="text-3xl font-bold text-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,242,0.6)]">{scores.p1}</p>
            </div>
          </div>
          {gameState === 'PLAYING' && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/10 backdrop-blur-md px-6 py-1 rounded-full border border-white/20 text-sm">
              {t('level')} {currentLevel}
            </motion.div>
          )}
        </div>

        <div className="w-12" />
      </div>

      <AnimatePresence>
        {gameState === 'MENU' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-6 text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-gradient-cyan uppercase italic">
              {t('cyberConnect.name')}
            </h1>
            <div className="max-w-xl mb-12 space-y-4">
              <p className="text-gray-400 text-lg leading-relaxed">
                {t('cyberConnect.desc')}
              </p>
              <p className="text-neon-red font-bold uppercase tracking-widest text-sm">
                {t('cyberConnect.warning')}
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center">
              {!isLoaded ? (
                <button 
                  onClick={initHandTracking}
                  className="bg-white text-black px-12 py-4 rounded-full font-bold text-xl hover:scale-105 transition-all"
                >
                  {t('turnOnCamera')}
                </button>
              ) : (
                <button 
                  onClick={handleStartGame}
                  className="bg-neon-cyan text-black px-12 py-4 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,242,0.4)]"
                >
                  {t('startGame')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(gameState === 'ROUND_END' || gameState === 'MATCH_END') && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none"
          >
            <p 
              className="text-4xl md:text-6xl font-black text-center uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              style={{ color: winnerColor }}
            >
              {winnerMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CyberConnect;
