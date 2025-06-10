"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../AuthContext";

export default function Game2Canvas() {
  const [progress, setProgress] = useState(0); // 0~1
  const [isHolding, setIsHolding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [fail, setFail] = useState(false);
  const [warning, setWarning] = useState(false);
  const [obstacle, setObstacle] = useState(false);
  const [obstacleTime, setObstacleTime] = useState(null);
  const [obstacleElapsed, setObstacleElapsed] = useState(0); // 干擾物動畫進度
  const { user, login } = useAuth();
  const holdStartRef = useRef(null);
  const progressRef = useRef(0);
  const obstacleTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const timerRef = useRef(null); // 用 ref 取代 timer state
  const MONSTER_HEIGHT = 500;
  const [heartbeatActive, setHeartbeatActive] = useState(false);
  const heartbeatIntervalRef = useRef(null);
  const failTimeoutRef = useRef(null);
  const [monsterRetreat, setMonsterRetreat] = useState(false);
  const [firstHold, setFirstHold] = useState(true);

  useEffect(() => {
    const hasCleared = localStorage.getItem("game2Success") === "true";
    if (hasCleared) {
      setSuccess(false); 
      setShowOverlay(false);
    }
  }, []);

  // 設定干擾物出現的隨機時機（1~13秒之間）
  function resetObstacleTime() {
    const t = 1000 + Math.random() * 13000;
    setObstacleTime(t);
  }

  // 開始長按
  function startHold() {
    if (isHolding || showOverlay || fail) return; // popup時不能操作
    setIsHolding(true);
    setProgress(0);
    progressRef.current = 0;
    if (firstHold) {
      resetObstacleTime();
      setFirstHold(false);
    } else if (Math.random() < 0.9) {
      resetObstacleTime();
    } else {
      setObstacleTime(null); // 不出現干擾物
    }
    setWarning(false);
    setObstacle(false);
    setFail(false);
    holdStartRef.current = Date.now();
    // 進度條計時（10秒填滿）
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      progressRef.current += 0.01;
      setProgress(progressRef.current);
    }, 100);
  }

  // 放開
  function stopHold() {
    if (!isHolding || showOverlay || fail) return; // popup時不能操作
    setIsHolding(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setProgress(0);
    progressRef.current = 0;
    setWarning(false);
    setFail(false);
    clearTimeout(obstacleTimeout.current);
    clearTimeout(warningTimeout.current);
    clearTimeout(failTimeoutRef.current);
  }

  // 監控進度條與干擾物
  useEffect(() => {
    if (!isHolding) return;
    if (obstacleTime == null) return; // 沒有干擾物
    // 干擾物預警與出現
    warningTimeout.current = setTimeout(() => {
      setWarning(true);
      obstacleTimeout.current = setTimeout(() => {
        setWarning(false);
        setObstacle(true);
        setObstacleElapsed(0);
        // 干擾物動畫計時（可保留）
        const start = Date.now();
        const anim = setInterval(() => {
          const elapsed = (Date.now() - start) / 1000;
          setObstacleElapsed(Math.min(elapsed, 1));
          if (elapsed >= 1) clearInterval(anim);
        }, 16);
        // 干擾物顯示0.7秒後才判定失敗
        failTimeoutRef.current = setTimeout(() => {
          if (progressRef.current < 1 && isHolding) {
            setFail(true);
            resetGame();
            setShowOverlay(true);
          }
          // 干擾物再顯示0.5秒才消失
          setTimeout(() => {
            setObstacle(false);
          }, 500);
        }, 1000);
      }, 1000);
    }, obstacleTime);
    return () => {
      clearTimeout(obstacleTimeout.current);
      clearTimeout(warningTimeout.current);
      clearTimeout(failTimeoutRef.current);
    };
  }, [isHolding, obstacleTime]);

  // 進度條滿時過關
  useEffect(() => {
    if (progress >= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setIsHolding(false);
      handleSuccess();
    }
  }, [progress]);

  // 成功邏輯
  async function handleSuccess() {
    localStorage.setItem("game2Success", "true");
    setSuccess(true);
    setShowOverlay(true);
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

  // 監控鍵盤
  useEffect(() => {
    function onKeyDown(e) {
      if (e.code === "Space") startHold();
    }
    function onKeyUp(e) {
      if (e.code === "Space") stopHold();
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isHolding, success, fail]);

  // Again
  function resetGame() {
    setSuccess(false);
    setProgress(0);
    progressRef.current = 0;
    setWarning(false);
    setObstacle(false);
    setIsHolding(false);
    setFirstHold(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    clearTimeout(obstacleTimeout.current);
    clearTimeout(warningTimeout.current);
    clearTimeout(failTimeoutRef.current);
    localStorage.removeItem("game2Success");
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 監控 isHolding 狀態，啟動/停止心跳動畫
  useEffect(() => {
    if (isHolding) {
      setHeartbeatActive(true);
      // 每 0.6 秒觸發一次動畫
      heartbeatIntervalRef.current = setInterval(() => {
        setHeartbeatActive(false);
        setTimeout(() => setHeartbeatActive(true), 100);
      }, 600);
    } else {
      setHeartbeatActive(false);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    }
    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [isHolding]);

  // 怪物動畫結束後再等0.5秒縮回
  useEffect(() => {
    if (obstacle && !isHolding && obstacleElapsed === 1 && !monsterRetreat) {
      const retreatTimer = setTimeout(() => {
        setMonsterRetreat(true);
        setTimeout(() => {
          setObstacle(false);
          setMonsterRetreat(false);
        }, 1000); // 縮回動畫時間 1 秒
      }, 500); // 停留0.5秒
      return () => clearTimeout(retreatTimer);
    }
  }, [obstacle, isHolding, obstacleElapsed, monsterRetreat]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundImage: "url('/bgimg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseDown={e => { if (e.button === 0) startHold(); }}
      onMouseUp={e => { if (e.button === 0) stopHold(); }}
    >
      {/* 背景和干擾物之間的角色圖 */}
      <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", zIndex: 1.5, width: "60vw", maxWidth: 700, pointerEvents: "none", userSelect: "none" }}>
        <img
          src={isHolding ? "/charater-on.png" : "/charater-off.png"}
          alt="character"
          style={{ width: "100%", display: "block" }}
        />
        {isHolding && (
          <img
            src="/heartbeat.png"
            alt="heartbeat"
            className={heartbeatActive ? "heartbeat-animate" : ""}
            style={{
              position: "absolute",
              left: "54%",
              top: "40%",
              transform: "translate(-50%, -50%) scale(0.4)",
              width: "30%",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        )}
      </div>
      {/* 進度條 */}
      <div style={{ width: "80%", height: 16, marginTop: 32, background: "#eee", borderRadius: 16, overflow: "hidden", border: "2px solid #C5AC6B", position: "relative", zIndex: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
        className={warning || (obstacle && isHolding) ? "shake-bar" : ""}>
        <div style={{ width: `${progress * 100}%`, height: "100%", background: "#E36B5B", transition: "width 0.1s linear, background 0.2s" }} />
        {/* 警告或干擾物時黃色透明遮罩閃爍 */}
        {(warning || obstacle) && <div className="bar-blink" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "rgba(255,215,0,0.25)", pointerEvents: "none" }} />}
      </div>
      {/* 干擾物（移出進度條外） */}
      {obstacle && (() => {
        // 分段進度：前20%慢慢冒出，後80%快速彈出
        let progress;
        if (monsterRetreat) {
          // 縮回動畫：progress 1 -> 0，動畫時間 0.7 秒
          progress = 1 - obstacleElapsed / 0.7; // obstacleElapsed 0~0.7，進度從1到0
        } else if (obstacleElapsed < 0.2) {
          progress = obstacleElapsed * 0.4; // 0~0.08
        } else {
          const t = (obstacleElapsed - 0.2) / 0.8; // 0~1
          progress = 0.08 + (1 - 0.08) * (1 - Math.cos(t * Math.PI / 2)); // ease out
        }
        // 彈性效果疊加
        const elasticOffset = Math.sin(progress * Math.PI) * 30;
        const bottomPosition = `calc(-${MONSTER_HEIGHT}px + ${progress * (MONSTER_HEIGHT - 150)}px + 50px + ${elasticOffset}px)`;
        return (
          <div style={{
            position: "absolute",
            left: "50%",
            bottom: bottomPosition, // 彈性動畫
            transform: `translate(-50%, 0)`,
            zIndex: 2,
            transition: "bottom 0.1s linear",
          }}>
            <img src="/monster.png" alt="monster" style={{ width: MONSTER_HEIGHT, height: MONSTER_HEIGHT, userSelect: "none", pointerEvents: "none", objectFit: "contain" }} />
          </div>
        );
      })()}
      {/* 成功/失敗彈窗 */}
      {(showOverlay || fail) && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.25)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div
            style={{
              width: "350px",
              height: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "1.5rem",
              border: "3px solid #C5AC6B",
              color: "#C5AC6B",
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            }}
          >
            <h2 style={{ color: fail ? "#E36B5B" : "#505166", fontSize: 22, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>
              {fail ? "Fail" : "Success！"}
            </h2>
            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={() => {
                  setShowOverlay(false);
                  setFail(false);
                  resetGame();
                }}
                style={{
                  padding: "8px 24px",
                  color: "#fff",
                  background: "#E36B5B",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                Again
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                style={{
                  padding: "8px 24px",
                  color: "#fff",
                  background: "#505166",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 