"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../AuthContext";

export default function GestureCanvas() {
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const canvasRef = useRef(null);
  const { user, login } = useAuth();

  // 初始檢查 localStorage 是否曾成功召喚過
  useEffect(() => {
    const hasCleared = localStorage.getItem("summonSuccess") === "true";
    if (hasCleared) {
      setSuccess(false); // 不顯示成功畫面
      setShowOverlay(false);
    }
  }, []);

  // 當 path 更新時，重新繪製畫布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#4B2E05";
    ctx.beginPath();
    path.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  }, [path]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPath([{ x, y }]);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPath((prevPath) => [...prevPath, { x, y }]);
  };

  const handleMouseUp = async () => {
    setIsDrawing(false);
    const result = isStarShape(path);
    console.log("判斷結果：", result);
    if (result) {
      localStorage.setItem("summonSuccess", "true");
      setSuccess(true);
      setShowOverlay(true);

      // 更新使用者分數
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
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        maxHeight: "500px",
        backgroundImage: success
          ? "url(/bg-summonRun.png)"
          : "url(/bg-summon.png)",
        backgroundSize: "clamp(700px, 60%, 1000px)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      {/* 中央畫布區域 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(255,255,255,0.4)",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
          width: "300px",
          height: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          style={{
            background: "transparent",
            borderRadius: "12px",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      {/* 成功召喚後的彈窗 */}
      {showOverlay && (
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
              Success！
            </h2>
            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={() => {
                  setPath([]);
                  setIsDrawing(false);
                  setShowOverlay(false);
                  setSuccess(false);
                  localStorage.removeItem("summonSuccess");
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

function isStarShape(points) {
  if (points.length < 15) return false;

  const start = points[0];
  const end = points[points.length - 1];
  const distToStart = Math.hypot(end.x - start.x, end.y - start.y);
  if (distToStart > 80) return false;

  let totalLength = 0;
  let totalAngleChange = 0;
  for (let i = 2; i < points.length; i++) {
    const p0 = points[i - 2];
    const p1 = points[i - 1];
    const p2 = points[i];

    const dx1 = p1.x - p0.x;
    const dy1 = p1.y - p0.y;
    const dx2 = p2.x - p1.x;
    const dy2 = p2.y - p1.y;

    const len1 = Math.hypot(dx1, dy1);
    const len2 = Math.hypot(dx2, dy2);
    totalLength += len1;

    if (len1 > 0 && len2 > 0) {
      const dot = dx1 * dx2 + dy1 * dy2;
      const cosTheta = dot / (len1 * len2);
      const angle = Math.acos(Math.min(1, Math.max(-1, cosTheta)));
      totalAngleChange += angle;
    }
  }

  const avgAngleChange = totalAngleChange / points.length;

  console.log("總長度：", totalLength.toFixed(1));
  console.log("平均角度變化：", avgAngleChange.toFixed(2));
  console.log("回到起點距離：", distToStart.toFixed(1));

  return (
    totalLength > 600 && // 大致繞一圈即可
    distToStart < 80 &&  // 起點終點接近
    avgAngleChange > 0.12 // 有幾個尖角
  );
}
