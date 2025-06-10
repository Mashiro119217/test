'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";

const cardBack = "g3/c0.png";
const cardFaces = Array.from({ length: 12 }, (_, i) => `g3/c${i + 1}.png`);

function initializeCards() {
  const selected = cardFaces.sort(() => Math.random() - 0.5).slice(0, 12);
  const duplicated = [...selected, ...selected];
  const shuffled = duplicated.sort(() => Math.random() - 0.5);
  return shuffled.map((img, index) => ({
    id: index,
    image: img,
    flipped: false,
    matched: false
  }));
}

export default function Game3Canvas() {
  const [cards, setCards] = useState(initializeCards);
  const [flipped, setFlipped] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(105);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [success, setSuccess] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const { user, login } = useAuth();

  useEffect(() => {
    const hasCleared = localStorage.getItem("game3Success") === "true";
    if (hasCleared) {
      setSuccess(false); 
      setShowOverlay(false);
    }
  }, []);

  async function handleSuccess() {
    localStorage.setItem("game3Success", "true");
    setSuccess(true);
    setShowOverlay(true);
    if (user && user.username) {
      const newScore = (user.score || 0) + 1;
      try {
        const res = await fetch("/api/auth", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username, score: newScore })
        });
        if (res.ok) {
          login({ ...user, score: newScore });
        } else {
          console.error("Failed to update score");
        }
      } catch (err) {
        console.error("Error updating score:", err);
      }
    }
  }

  useEffect(() => {
    if (countdown > 0 && !showIntro) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setStarted(true);
    }
  }, [countdown, showIntro]);

  useEffect(() => {
    if (!started || result) return;
    if (timeLeft === 0) {
      setResult("fail");
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [started, timeLeft, result]);

  useEffect(() => {
    if (matchedCount === 12) {
      handleSuccess();
      setResult("success");
    }
  }, [matchedCount]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].image === cards[second].image) {
        const newCards = [...cards];
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setMatchedCount((prev) => prev + 1);
        setFlipped([]);
      } else {
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setFlipped([]);
        }, 400);
      }
    }
  }, [flipped]);

  const handleCardClick = (index) => {
    if (!started || cards[index].flipped || cards[index].matched || flipped.length >= 2) return;
    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    setFlipped([...flipped, index]);
  };

  const resetGame = () => {
    setCards(initializeCards());
    setFlipped([]);
    setMatchedCount(0);
    setResult(null);
    setTimeLeft(105);
    setCountdown(3);
    setStarted(false);
    setShowIntro(true);
  };

  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 160px)',
      background: `url("/g3/g3bg.png") no-repeat center/cover`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      position: 'relative'
    }}>
      {showIntro && (
        <div style={{
          position: 'absolute',
          zIndex: 20,
          width: '100%',
          height: '100%',
          background: `url('/g3/g31.png') no-repeat center/cover`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setShowIntro(false)}
            style={{
              marginTop: '2rem',
              marginBottom: '1rem',
              padding: '1rem 2rem',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              backgroundColor: '#E36B5B',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            開始遊戲
          </button>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: '1.75vw',
        fontSize: 'clamp(1rem, 2vw, 1.5rem)',
        fontWeight: 700,
        background: '#fef9f4',
        padding: '0.4rem 2rem',
        borderRadius: '12px',
        color: '#505166'
      }}>
        {formatTime(timeLeft)}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          justifyItems: 'center',
          alignItems: 'center',
          gap: '1vw 0.5vw',
          padding: '1rem',
          width: '80vw',
          maxWidth: '1000px',
          marginTop: 'clamp(40px, 12vh, 100px)'
        }}
      >
        {cards.map((card, i) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(i)}
            style={{
              perspective: '800px',
              cursor: 'pointer',
              height: 'clamp(10px, 12vh, 100px)',
              aspectRatio: '1 / 1'
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              position: 'relative',
              transition: 'transform 0.6s',
              transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}>
              <img src={`/${cardBack}`} alt="back" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }} />
              <img src={`/${card.image}`} alt="face" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} />
            </div>
          </div>
        ))}
      </div>

      {!started && countdown > 0 && <div style={countdownStyle}>{countdown}</div>}

      {result && (
        <div style={resultOverlayStyle}>
          <div style={{
            background: '#fef9f4',
            padding: '2rem',
            borderRadius: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            width: '90%',
            maxWidth: '400px'
          }}>
            <img src={`/g3/${result === 'success' ? 'thumb.png' : 'thumb1.png'}`} alt="result icon" style={{ width: 80, marginBottom: 12 }} />
            <div style={{ fontSize: 32, fontWeight: 700, color: '#505166' }}>
              {result === 'success' ? '挑戰成功' : '挑戰失敗'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
              <button onClick={resetGame} style={btnStyle('#E36B5B')}>再玩一次</button>
              <button onClick={() => window.location.href = "/"} style={btnStyle('#C5AC6B')}>回到首頁</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const formatTime = (s) => {
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

const countdownStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '6vw',
  fontWeight: 700,
  color: '#fff',
  background: '#505166',
  padding: '2rem 3rem',
  borderRadius: '2rem'
};

const resultOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10
};

const btnStyle = (bg) => ({
  padding: '0.6rem 1.5rem',
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer'
});
