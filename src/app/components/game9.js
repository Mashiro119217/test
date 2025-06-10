"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import Game9Content from "../components/Game9Content";

export default function Game9Canvas() {
  const [status, setStatus] = useState(null); // null, "success", "fail"
  const { user, login } = useAuth();
  const [showGuidance, setShowGuidance] = useState(true); // 控制是否顯示遊戲說明圖片
  const [isGameActive, setIsGameActive] = useState(false); // 控制遊戲是否啟動
  const statusRef = useRef(status);  // 使用 useRef 存儲狀態，避免重新渲染
  const setStatusRef = useRef(setStatus); // 用於存儲 setStatus 函數，避免直接更新
  const [showScorePopup, setShowScorePopup] = useState(false);

  useEffect(() => {
    const hasCleared = localStorage.getItem("game2Success") === "true";
    if (hasCleared) {
      setStatus(null); // 不自動顯示視窗
    }
  }, []);

  async function handleSuccess() {
    localStorage.setItem("game2Success", "true");
    statusRef.current = "success";
    setStatusRef.current("success");
    if (user?.username) {
      const newScore = (user.score || 0) + 10;
      try {
        const res = await fetch("/api/auth", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username, score: newScore }),
        });
        if (res.ok) login({ ...user, score: newScore });
        else console.error("Failed to update score");
      } catch (err) {
        console.error("Error updating score:", err);
      }
    }
  }

  async function handleFail() {
    setTimeout(async () => {
      statusRef.current = "fail";
      setStatusRef.current("fail");
      if (user?.username) {
        const newScore = (user.score || 0) - 5;
        try {
          const res = await fetch("/api/auth", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user.username, score: newScore }),
          });
          if (res.ok) login({ ...user, score: newScore });
          else console.error("Failed to update score");
        } catch (err) {
          console.error("Error updating score:", err);
        }
      }
    }, 0);
  }

  const handleStartGame = () => {
    if ((user?.score || 0) < 5) {
      setShowScorePopup(true);
      return;
    }
    setShowGuidance(false); // 開始遊戲後隱藏遊戲說明
    setIsGameActive(true); // 啟動遊戲
  };

  return (
    <>
      {showGuidance && (
        <div style={{
          position: "absolute", top: "50%", left: "49.995%", transform: "translate(-50%, -50%)",
          width: "124.99%", height: "auto",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
         <div style={{ position: "relative", textAlign: "center", width: "100%", height: "auto" }}>
         <img 
                src="/gameGuidance09.png" 
                alt="Game Guidance" 
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "80%", 
                  width: "80%" // 讓圖片寬度為 80%
                }} 
              />
              <img 
                onClick={handleStartGame}
                src="/StartBtn_09.png" 
                alt="StartBtn" 
                style={{ 
                  position: "absolute", 
                  top: "87%", 
                  left: "50%", 
                  transform: "translate(-50%, -50%)",
                  height: "12%"
                }} 
              />
              
              
              

</div>

        </div>
      )}

      <Game9Content
        onSuccess={handleSuccess}
        onFail={handleFail}
        isGameActive={isGameActive} // 傳遞遊戲是否啟動的狀態
      />

      {status && (
        <div
          style={{
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
          }}
        >
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
            <h2
              style={{
                color: "#505166",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 18,
                textAlign: "center",
              }}
            >
              {status === "success" ? "中獎！" : "未中獎!"}
            </h2>
            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={() => {
                  // 使用 setTimeout 延遲頁面重載，確保狀態更新後才刷新
                  setTimeout(() => {
                    window.location.reload(); // 重整頁面
                  }, 0);
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

      {showScorePopup && (
        <div
          style={{
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
          }}
        >
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
            <h2
              style={{
                color: "#505166",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 18,
                textAlign: "center",
              }}
            >
              分數不足，請獲得更多分數再來！
            </h2>
            <button
              onClick={() => {
                setShowScorePopup(false);
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
      )}
    </>
  );
}
