"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";

export default function Game4Canvas() {
  const [success, setSuccess] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const { user, login } = useAuth();

  useEffect(() => {
    const hasCleared = localStorage.getItem("game2Success") === "true";
    if (hasCleared) {
      setSuccess(false); 
      setShowOverlay(false);
    }
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

  return (
    <>
      {/* 這裡放你的遊戲元件或互動內容，預設只留一個模擬過關按鈕 */}
      <button
        onClick={handleSuccess}
        style={{
          padding: "12px 32px",
          fontSize: 20,
          borderRadius: 8,
          background: "#C5AC6B",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        模擬過關4（請改成你自己的過關條件）
      </button>

      {/* 成功過關後彈窗 */}
      {showOverlay && (
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
            <h2 style={{ color: "#505166", fontSize: 22, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>
              Success！
            </h2>
            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={() => {
                  // 重置遊戲狀態
                  setShowOverlay(false);
                  setSuccess(false);
                  localStorage.removeItem("game2Success");
                  // TODO: 這裡也要重置你自己的遊戲狀態
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
    </>
  );
} 