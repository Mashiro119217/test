"use client";
import React, { useState, useEffect, useRef } from "react";
import "./game5.css";
import { useAuth } from "../AuthContext";

export default function Game5Canvas() {
  const [holes, setHoles] = useState(Array(8).fill({ state: "empty", timer: 0 }));
  const [timer, setTimer] = useState(60);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [goodScore, setGoodScore] = useState(0);
  const [badScore, setBadScore] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const { user, login } = useAuth();

  const popSound = useRef(null);
  const cookSound = useRef(null);
  const marqueeRef = useRef(null);

  const messages = [
    "注意：章魚燒要記得及時起鍋，不然很快就會燒焦囉！",
    "最頂尖的章魚燒師傅是不會允許自己讓章魚燒燒焦的！",
    "做章魚燒就像是在打地鼠，眼不夠疾，手不夠快，你就輸了！",
    "小撇步：一次收完一整圈章魚燒，再重新開始煎能夠減少失敗率喔！"
  ];

  // 🎯 跑馬燈訊息輪播
  useEffect(() => {
    let index = 0;

    function playMarquee() {
      const el = marqueeRef.current;
      if (!el) return;

      el.classList.remove("marquee-content");
      void el.offsetWidth; // 強制 reflow
      el.textContent = messages[index];
      el.classList.add("marquee-content");

      setCurrentMessageIndex(index);

      setTimeout(() => {
        index = (index + 1) % messages.length;
        playMarquee();
      }, 12000); // 10 秒動畫 + 2 秒間隔
    }

    playMarquee();
  }, []);

  // 音量初始化
  useEffect(() => {
    if (popSound.current) popSound.current.volume = 0.2;
    if (cookSound.current) cookSound.current.volume = 0.8;
  }, []);

  // 當過關時呼叫此函式
  async function handleSuccess() {
    localStorage.setItem("game2Success", "true");
    setSuccess(true);
    setShowOverlay(true);
    // SCORE +1 並同步到 DB
    if (user && user.username) {
      const newScore = (user.score || 0) + 1;
      try {
        const res = await fetch("/api/auth", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username, score: newScore }),
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
    if (success) {
      handleSuccess();
    }
  }, [success]);
  

  // 倒數計時與難度提升
  useEffect(() => {
    if (timer <= 0) {
      setShowOverlay(true);
      if (goodScore >= 50) {
        setSuccess(true); // 這會觸發上面的 useEffect 去呼叫 handleSuccess
      }
      return;
    }
    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
      setDifficultyLevel((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(countdown);
  }, [timer]);

  // 每秒更新食材狀態
  useEffect(() => {
    const interval = setInterval(() => {
      setHoles((prev) => {
        const rawToCookedTime = Math.max(1, 5 - Math.floor(difficultyLevel / 10));
        return prev.map((hole) => {
          if (hole.state === "raw" && hole.timer >= rawToCookedTime) {
            return { state: "cooked", timer: 0 };
          }
          if (hole.state === "cooked" && hole.timer >= 2) {
            return { state: "burnt", timer: 0 };
          }
          if (hole.state === "raw" || hole.state === "cooked") {
            return { ...hole, timer: hole.timer + 1 };
          }
          return hole;
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [difficultyLevel]);

  const handleClick = (index) => {
    const hole = holes[index];

    if (["empty", "cooked", "burnt"].includes(hole.state)) {
      popSound.current?.play();
    }
    if (cookSound.current?.paused) {
      cookSound.current.play().catch(() => {});
    }

    if (hole.state === "cooked") {
      setGoodScore((g) => g + 1);
    } else if (hole.state === "burnt") {
      setBadScore((b) => b + 1);
    }

    setHoles((prev) => {
      const newHoles = [...prev];
      if (hole.state === "empty") {
        newHoles[index] = { state: "raw", timer: 0 };
      } else if (hole.state === "cooked" || hole.state === "burnt") {
        newHoles[index] = { state: "empty", timer: 0 };
      }
      return newHoles;
    });
  };

  const getHoleClass = (state) => `takoyaki-hole ${state}`;


  return (
    <div className="game-wrapper">
      <div className="game-container">
        <div className="info-panel">
          <div className="timer-box">
            <img src="/images/clock.png" className="timer-img" />
            <div>{timer}s</div>
          </div>
          <div className="score-box">
            <div className="score good">
              <img src="/images/good taco.png" className="score-icon" />
              <div className="score-num">{String(goodScore).padStart(2, "0")}</div>
            </div>
            <div className="score bad">
              <img src="/images/bad taco.png" className="score-icon" />
              <div className="score-num">{String(badScore).padStart(2, "0")}</div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="grill-panel">
            {holes.map((hole, idx) => (
              <div
                key={idx}
                className={getHoleClass(hole.state)}
                onClick={() => handleClick(idx)}
              />
            ))}
          </div>

          <div className="hint-panel">
            <img src="/images/taco man.png" className="hint-img" />

            <div className="marquee large-only">
              <div className="marquee-content key-transition" ref={marqueeRef}>
                {messages[currentMessageIndex]}
              </div>
            </div>

            <p className="static-hint small-only">
              注意：章魚燒要記得及時起鍋，不然很快就會燒焦囉！
            </p>
          </div>
        </div>

        {showOverlay && (
          <div className="overlay">
            <div className="result-box">
              <img
                src={success ? "/images/win.png" : "/images/fail.png"}
                alt={success ? "挑戰成功" : "挑戰失敗"}
                className="result-icon"
              />
              <h2 className="result-title">{success ? "挑戰成功" : "挑戰失敗"}</h2>
              <div className="result-buttons">
                <button className="btn btn-gold" onClick={() => (window.location.href = "/")}>
                  回到首頁
                </button>
                <button
                  className="btn btn-red"
                  onClick={() => {
                    setHoles(Array(8).fill({ state: "empty", timer: 0 }));
                    setGoodScore(0);
                    setBadScore(0);
                    setTimer(60);
                    setDifficultyLevel(0);
                    setShowOverlay(false);
                    setSuccess(false);
                  }}
                >
                  再玩一次
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <audio ref={popSound} src="/sounds/pop.mp3" preload="auto" />
      <audio ref={cookSound} src="/sounds/cook.mp3" preload="auto" loop />
    </div>
  );
}
