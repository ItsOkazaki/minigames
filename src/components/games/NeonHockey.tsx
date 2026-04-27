"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { cn } from '@/lib/utils';

interface NeonHockeyProps {
  onBack: () => void;
}

const NeonHockey: React.FC<NeonHockeyProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'dz';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { videoRef, resultsRef, isLoaded, initHandTracking } = useHandTracking();

  const [gameState, setGameState] = useState<'MENU' | 'COUNTDOWN' | 'PLAYING' | 'SCORED' | 'OVER'>('MENU');
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<string | null>(null);

  const stateRef = useRef({
    gameState: 'MENU' as any,
    scores: { p1: 0, p2: 0 },
    ball: { x: 0, y: 0, vx: 0, vy: 0, speed: 0, color: '#ffff00' },
    paddles: {
      p1: { x: 0, y: 0, targetX: 0, targetY: 0, active: false, color: '#00fff2' },
      p2: { x: 0, y: 0, targetX: 0, targetY: 0, active: false, color: '#ff0055' }
    },
    particles: [] as any[]
  });

  const gameLoopRef = useRef<number | null>(null);
  const WIN_SCORE = 7;
  const PADDLE_RADIUS = 40;
  const BALL_RADIUS = 20;
  const INITIAL_SPEED = 12;

  const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

  const resetBall = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    stateRef.current.ball.x = canvas.width / 2;
    stateRef.current.ball.y = canvas.height / 2;
    stateRef.current.ball.speed = INITIAL_SPEED;
    stateRef.current.ball.color = '#ffff00';
    let angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
    let dir = Math.random() > 0.5 ? 1 : -1;
    stateRef.current.ball.vx = Math.cos(angle) * stateRef.current.ball.speed * dir;
    stateRef.current.ball.vy = Math.sin(angle) * stateRef.current.ball.speed;
  };

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      stateRef.current.particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1.0,
        color: color
      });
    }
  };

  const handleScore = (winnerKey: 'p1' | 'p2') => {
    const nextScores = { ...stateRef.current.scores, [winnerKey]: stateRef.current.scores[winnerKey] + 1 };
    stateRef.current.scores = nextScores;
    setScores(nextScores);

    if (nextScores[winnerKey] >= WIN_SCORE) {
      setWinner(winnerKey === 'p1' ? "PLAYER 1" : "PLAYER 2");
      stateRef.current.gameState = 'OVER';
      setGameState('OVER');
    } else {
      stateRef.current.gameState = 'SCORED';
      setGameState('SCORED');
      setTimeout(() => {
        resetBall();
        stateRef.current.gameState = 'PLAYING';
        setGameState('PLAYING');
      }, 1000);
    }
    spawnParticles(stateRef.current.ball.x, stateRef.current.ball.y, '#fff');
  };

  const updateAndDraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoRef.current;
    if (!canvas || !ctx || !video) return;

    // Process Hand Landmarks
    const results = resultsRef.current;
    let foundP1 = false, foundP2 = false;
    if (results && results.multiHandLandmarks) {
      results.multiHandLandmarks.forEach((landmarks: any) => {
        // Landmarks[8] is index tip
        // Hand coordinates are mirrored relative to visual feed if we use (1 - x)
        const x = landmarks[8].x * canvas.width;
        const y = landmarks[8].y * canvas.height;
        // Divide by 0.5 because input is split
        if (landmarks[8].x < 0.5) {
          stateRef.current.paddles.p1.targetX = x;
          stateRef.current.paddles.p1.targetY = y;
          stateRef.current.paddles.p1.active = true;
          foundP1 = true;
        } else {
          stateRef.current.paddles.p2.targetX = x;
          stateRef.current.paddles.p2.targetY = y;
          stateRef.current.paddles.p2.active = true;
          foundP2 = true;
        }
      });
    }
    if (!foundP1) stateRef.current.paddles.p1.active = false;
    if (!foundP2) stateRef.current.paddles.p2.active = false;

    // Physics Update
    ['p1', 'p2'].forEach(p => {
      const paddle = (stateRef.current.paddles as any)[p];
      if (paddle.active) {
        if (paddle.x === 0 && paddle.y === 0) {
          paddle.x = paddle.targetX;
          paddle.y = paddle.targetY;
        } else {
          paddle.x = lerp(paddle.x, paddle.targetX, 0.5);
          paddle.y = lerp(paddle.y, paddle.targetY, 0.5);
        }
      }
    });

    if (stateRef.current.gameState === 'PLAYING') {
      stateRef.current.ball.x += stateRef.current.ball.vx;
      stateRef.current.ball.y += stateRef.current.ball.vy;

      if (stateRef.current.ball.y - BALL_RADIUS < 0) {
        stateRef.current.ball.y = BALL_RADIUS;
        stateRef.current.ball.vy *= -1;
      } else if (stateRef.current.ball.y + BALL_RADIUS > canvas.height) {
        stateRef.current.ball.y = canvas.height - BALL_RADIUS;
        stateRef.current.ball.vy *= -1;
      }

      if (stateRef.current.ball.x < 0) {
        handleScore('p1');
      } else if (stateRef.current.ball.x > canvas.width) {
        handleScore('p2');
      }

      ['p1', 'p2'].forEach(key => {
        let p = (stateRef.current.paddles as any)[key];
        if (!p.active) return;
        let dx = stateRef.current.ball.x - p.x;
        let dy = stateRef.current.ball.y - p.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BALL_RADIUS + PADDLE_RADIUS) {
          let nx = dx / dist;
          let ny = dy / dist;
          stateRef.current.ball.speed = Math.min(stateRef.current.ball.speed * 1.05, 35);
          stateRef.current.ball.vx = nx * stateRef.current.ball.speed;
          stateRef.current.ball.vy = ny * stateRef.current.ball.speed;
          stateRef.current.ball.color = p.color;
          let overlap = (BALL_RADIUS + PADDLE_RADIUS) - dist;
          stateRef.current.ball.x += nx * overlap;
          stateRef.current.ball.y += ny * overlap;
          spawnParticles((stateRef.current.ball.x + p.x) / 2, (stateRef.current.ball.y + p.y) / 2, p.color);
        }
      });
    }

    for (let i = stateRef.current.particles.length - 1; i >= 0; i--) {
      let p = stateRef.current.particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.05;
      if (p.life <= 0) stateRef.current.particles.splice(i, 1);
    }

    // Rendering
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (stateRef.current.gameState !== 'MENU') {
      ctx.shadowBlur = 30;
      ctx.strokeStyle = stateRef.current.paddles.p1.color;
      ctx.shadowColor = stateRef.current.paddles.p1.color;
      ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, canvas.height); ctx.stroke();
      ctx.strokeStyle = stateRef.current.paddles.p2.color;
      ctx.shadowColor = stateRef.current.paddles.p2.color;
      ctx.beginPath(); ctx.moveTo(canvas.width, 0); ctx.lineTo(canvas.width, canvas.height); ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.setLineDash([10, 10]);
      ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
      ctx.setLineDash([]);

      if (stateRef.current.gameState !== 'OVER') {
        ctx.shadowBlur = 20;
        ctx.shadowColor = stateRef.current.ball.color;
        ctx.beginPath();
        ctx.arc(stateRef.current.ball.x, stateRef.current.ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = stateRef.current.ball.color;
        ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke();
      }

      ['p1', 'p2'].forEach(key => {
        let p = (stateRef.current.paddles as any)[key];
        if (!p.active) return;
        ctx.shadowBlur = 30; ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, PADDLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; ctx.fill();
        ctx.lineWidth = 5; ctx.strokeStyle = p.color; ctx.stroke();
      });

      stateRef.current.particles.forEach(p => {
        ctx.shadowBlur = 5; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;
      });
    }

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

  const startCountdown = () => {
    stateRef.current.gameState = 'COUNTDOWN';
    setGameState('COUNTDOWN');
    let count = 3;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown(0);
      } else {
        clearInterval(timer);
        stateRef.current.gameState = 'PLAYING';
        setGameState('PLAYING');
        resetBall();
      }
    }, 1000);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-tech">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className={cn("flex justify-between items-center p-8", isRTL && "flex-row-reverse")}>
          <div className="text-neon-pink text-6xl font-black drop-shadow-[0_0_15px_rgba(255,0,85,0.6)]">{scores.p2}</div>
          <div className="text-neon-cyan text-6xl font-black drop-shadow-[0_0_15px_rgba(0,255,242,0.6)]">{scores.p1}</div>
        </div>
      </div>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <button onClick={onBack} className="bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/20 transition-all pointer-events-auto text-white"><ArrowLeft className="w-6 h-6" /></button>
      </div>
      <AnimatePresence>
        {gameState === 'MENU' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6 text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-gradient-cyan uppercase">{t('neonHockey.name')}</h1>
            <div className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="border border-neon-pink p-6 rounded-2xl bg-neon-pink/5 w-64"><h3 className="text-neon-pink font-bold mb-2 uppercase">{t('neonHockey.player2')}</h3><p className="text-xs text-gray-400">{t('neonHockey.desc')}</p></div>
              <div className="border border-neon-cyan p-6 rounded-2xl bg-neon-cyan/5 w-64"><h3 className="text-neon-cyan font-bold mb-2 uppercase">{t('neonHockey.player1')}</h3><p className="text-xs text-gray-400">{t('neonHockey.desc')}</p></div>
            </div>
            <div className="flex flex-col gap-4 items-center">
              {!isLoaded ? (
                <button onClick={initHandTracking} className="bg-white text-black px-12 py-4 rounded-full font-bold text-xl hover:scale-105 transition-all">{t('turnOnCamera')}</button>
              ) : (
                <button onClick={startCountdown} className="bg-neon-yellow text-black px-12 py-4 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,0,0.4)]">{t('startGame')}</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {gameState === 'COUNTDOWN' && (
          <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <span className="text-white text-[10rem] font-black drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">{countdown === 0 ? "GO!" : countdown}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {gameState === 'OVER' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg p-6 text-center">
            <h1 className="text-6xl font-black mb-4 text-white uppercase italic">{winner} {t('wins')}!</h1>
            <h2 className="text-4xl font-bold mb-12 text-gray-400">{scores.p2} - {scores.p1}</h2>
            <button onClick={() => { setScores({ p1: 0, p2: 0 }); stateRef.current.scores = { p1: 0, p2: 0 }; startCountdown(); }} className="bg-white text-black px-12 py-4 rounded-full font-bold text-xl hover:scale-105 transition-all">{t('rematch')}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeonHockey;
