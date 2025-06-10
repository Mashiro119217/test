"use client";

import React, { useState, useEffect, useRef } from "react";

export default function Game6Canvas() {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 1372, height: 608 });
  const [items, setItems] = useState([]);
  const [netPos, setNetPos] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showStartCountdown, setShowStartCountdown] = useState(true);
  const [ripples, setRipples] = useState([]);

  const BASE_WIDTH = 1372;
  const BASE_HEIGHT = 608;

  const itemTypes = [
    { type: "red", points: 5 },
    { type: "yellow", points: 4 },
    { type: "beige", points: 3 },
    { type: "blue", points: 2 },
    { type: "grass", points: -2 },
  ];

  const generateItem = () => {
    const isLast10 = timeLeft <= 10;
    const grassBias = isLast10 ? 0.5 : 0.25;
    const randIndex = Math.random() < grassBias ? 4 : Math.floor(Math.random() * 4);
    const rand = itemTypes[randIndex];
    const size = 180;
    return {
      ...rand,
      id: Math.random(),
      x: Math.random() * (containerSize.width - size),
      y: Math.random() * (containerSize.height - size),
      size,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      disappearTime: Math.random() * 10000 + 5000 // 5–15秒後可能消失
    };
  };

  const handleResetGame = () => {
    setShowOverlay(false);
    setScore(0);
    setTimeLeft(30);
    setGameEnded(false);
    setCountdown(5);
    setShowStartCountdown(true);
    setItems([]);
  };

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setContainerSize({ width: offsetWidth, height: offsetHeight });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!showStartCountdown) return;
    if (countdown === 0) {
      setGameStarted(true);
      setShowStartCountdown(false);
      return;
    }
    const countTimer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(countTimer);
  }, [countdown, showStartCountdown]);

  useEffect(() => {
    if (!gameStarted) return;

    const moveInterval = setInterval(() => {
      setItems((items) =>
        items.map((item) => {
          let newX = item.x + item.dx * 8;
          let newY = item.y + item.dy * 8;
          if (newX < 0 || newX > containerSize.width - item.size) item.dx *= -1;
          if (newY < 0 || newY > containerSize.height - item.size) item.dy *= -1;
          return {
            ...item,
            x: Math.max(0, Math.min(containerSize.width - item.size, newX)),
            y: Math.max(0, Math.min(containerSize.height - item.size, newY)),
            disappearTime: item.disappearTime - 100
          };
        }).filter(item => item.disappearTime > 0)
      );
    }, 100);

    const spawnInterval = setInterval(() => {
      setItems((prev) => [...prev, generateItem()]);
    }, 400);

    return () => {
      clearInterval(moveInterval);
      clearInterval(spawnInterval);
    };
  }, [gameStarted, containerSize, timeLeft]);

  useEffect(() => {
    if (!gameStarted || timeLeft === 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted]);

  useEffect(() => {
    if (timeLeft === 0 && gameStarted) {
      setGameEnded(true);
      setGameStarted(false);
      setShowOverlay(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    const rippleTimer = setInterval(() => {
      setRipples((prev) => prev.slice(1));
    }, 500);
    return () => clearInterval(rippleTimer);
  }, []);

  const handleClick = (e) => {
    if (!gameStarted || gameEnded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    setNetPos({ x: clickX, y: clickY });

    setRipples((prev) => [...prev, { x: clickX, y: clickY, id: Math.random() }]);

    setItems((prev) => {
      const next = [];
      let gained = 0;
      for (let item of prev) {
        const centerX = item.x + item.size / 2;
        const centerY = item.y + item.size / 2;
        const isCaught = Math.hypot(centerX - clickX, centerY - clickY) < 125;
        if (isCaught) {
          gained += item.points;
        } else {
          next.push(item);
        }
      }
      if (gained !== 0) setScore((s) => s + gained);
      return next;
    });
  };

  const countdownImage = countdown > 0 ? `/${countdown}.png` : "/start.png";

  return (
    <div ref={containerRef} onClick={handleClick} style={{
      width: "100%",
      height: "100%",
      maxWidth: BASE_WIDTH,
      maxHeight: BASE_HEIGHT,
      backgroundImage: `url('/pool.png')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      overflow: "hidden",
      border: "2px solid #505166",
      aspectRatio: `${BASE_WIDTH}/${BASE_HEIGHT}`,
    }}>
      {showStartCountdown && (
        <img
          src={countdownImage}
          alt="倒數"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 250,
            zIndex: 10,
          }}
        />
      )}

      {gameStarted && !gameEnded && (
        <div style={{
          position: "absolute",
          top: 10,
          right: 20,
          fontSize: 22,
          color: "#fff",
          fontWeight: "bold",
          background: "rgba(0,0,0,0.4)",
          padding: "6px 12px",
          borderRadius: 8,
        }}>{timeLeft} 秒</div>
      )}

      {items.map((item) => (
        <img
          key={item.id}
          src={`/${item.type}.png`}
          alt={item.type}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            width: item.size,
            transition: "all 0.2s ease",
          }}
        />
      ))}

      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          style={{
            position: "absolute",
            left: ripple.x - 25,
            top: ripple.y - 25,
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.6)",
            animation: "ripple 0.4s ease-out",
            pointerEvents: "none",
          }}
        />
      ))}

      {gameStarted && (
        <img
          src="/net.png"
          alt="撈網"
          style={{
            position: "absolute",
            left: netPos.x - 125,
            top: netPos.y - 125,
            width: 250,
            pointerEvents: "none",
          }}
        />
      )}

      {gameStarted && (
        <div style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <img src="/bucket.png" alt="bucket" style={{ width: 60 }} />
          <span style={{ fontSize: 22, fontWeight: "bold", color: "#fff", textShadow: "0 0 4px rgba(0,0,0,0.5)" }}>
            {score} 分
          </span>
        </div>
      )}

      {showOverlay && (
        <img
          src={score >= 100 ? "/success.png" : "/fail.png"}
          alt="結束圖"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            zIndex: 10,
          }}
        />
      )}

      {gameEnded && (
        <div style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          color: "#505166",
          background: "#fff",
          padding: "8px 16px",
          borderRadius: 12,
          fontSize: 18,
        }}>
          得分：{score} 分
          <br />
          <button onClick={handleResetGame} style={{ marginTop: 8, background: '#E36B5B', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer' }}>
            再玩一次
          </button>
        </div>
      )}

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
