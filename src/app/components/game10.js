"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import Image from "next/image";
import cursorDefaultPng from "/public/10_CURSOR PIC.png";
import cursorHurtPng from "/public/10_hurtFinger.png";
import redBtnPng from "/public/10_redButton.png";
import sugerTri from "/public/10_tri.png";
import sugerStar from "/public/10_star.png";
import sugerUmbrella from "/public/10_umbrella.png";
import pointer from "/public/10_pointer.png";
import stopBtn from "/public/10_stop button.png";
import bar from "/public/10_bar.png";

export default function Game11Canvas() {
  const [success, setSuccess] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showFailOverlay, setShowFailOverlay] = useState(false);
  const { user, login } = useAuth();
  const [pointerPosition, setPointerPosition] = useState(0);
  const [moving, setMoving] = useState(false);
  const [direction, setDirection] = useState(true);
  const barRef = useRef(null);
  const SAFE_ZONE_START = 42.5;
  const SAFE_ZONE_END = 57.5;
  const [selectedCandy, setSelectedCandy] = useState(null);
  const [hoveredBreakPoint, setHoveredBreakPoint] = useState(null);
  const [activatedBreakPoints, setActivatedBreakPoints] = useState([]);
  const [lockedBreakPoints, setLockedBreakPoints] = useState([]);

  // 重置遊戲狀態的通用函數
  const resetGame = () => {
    setPointerPosition(0);
    setMoving(false);
    setDirection(true);
    setShowOverlay(false);
    setShowFailOverlay(false);
    setSuccess(false);
    localStorage.removeItem("game2Success");
    setSelectedCandy(null);
    setActivatedBreakPoints([]);
    setLockedBreakPoints([]);
    setHoveredBreakPoint(null);
  };

  // 當「最終」過關時呼叫此函式 (所有9個擊破點都完成)
  async function handleOverallSuccess() {
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

  // 處理失敗的函數
  const handleFail = () => {
    setSuccess(false);
    setShowFailOverlay(true);
    setMoving(false);
  };

  //彈出視窗相關邏輯 (與遊戲重置相關)
  useEffect(() => {
    const hasCleared = localStorage.getItem("game2Success") === "true";
    if (hasCleared) {
      setSuccess(false);
      setShowOverlay(false);
      setShowFailOverlay(false);
      setPointerPosition(0);
      setMoving(false);
      setDirection(true);
      setSelectedCandy(null);
      setLockedBreakPoints([]);
    }
  }, []);

  // 選取糖餅的處理函數 (高亮邊框和允許點擊擊破點)
  const handleCandySelect = (candyType) => {
    if (moving) {
      alert("請先完成當前擊破點的挑戰！");
      return;
    }
    setSelectedCandy(candyType);
    setPointerPosition(0);
    setDirection(true);
    setShowOverlay(false);
    setShowFailOverlay(false);
    setSuccess(false);
  };

  // 定義不同糖餅的移動速度 (毫秒數，數字越小越快)
  const GAME_SPEEDS = {
    star: 25,
    tri: 40,
    umbrella: 15,
  };

  // 擊破點位置
  const BREAK_POINTS = {
    star: [
      { x: 0.15, y: 0.3 },
      { x: 0.85, y: 0.3 },
      { x: 0.5, y: 0.9 },
    ],
    tri: [
      { x: 0.5, y: 0.1 },
      { x: 0.15, y: 0.7 },
      { x: 0.85, y: 0.7 },
    ],
    umbrella: [
      { x: 0.83, y: 0.5 },
      { x: 0.2, y: 0.5 },
      { x: 0.5, y: 0.8 },
    ],
  };

  // 處理擊破點點擊 (新的邏輯：點擊即啟動指針)
  const handleBreakPointClick = (candyType, index) => {
    if (
      moving ||
      lockedBreakPoints.some(
        (bp) => bp.candyType === candyType && bp.index === index
      ) ||
      selectedCandy !== candyType
    ) {
      return;
    }
    if (selectedCandy === null) {
      alert("請先選擇一個糖餅！");
      return;
    }

    setActivatedBreakPoints([{ candyType, index }]);
    setPointerPosition(0);
    setDirection(true);
    setMoving(true);
  };

  // 指針移動邏輯 (使用 useEffect 和 setInterval)
useEffect(() => {
  let interval;
  const MIN_POS = 5; // 例如，最小位置設為2%
  const MAX_POS = 98; // 例如，最大位置設為98%

  if (moving && selectedCandy !== null) {
    const speed = GAME_SPEEDS[selectedCandy];

    interval = setInterval(() => {
      setPointerPosition((prevPos) => {
        let newPos = prevPos;

        if (direction) {
          newPos = prevPos + 1;
          if (newPos >= MAX_POS) { // 碰到最大限制
            setDirection(false);
            return MAX_POS;
          }
        } else {
          newPos = prevPos - 1;
          if (newPos <= MIN_POS) { // 碰到最小限制
            setDirection(true);
            return MIN_POS;
          }
        }
        return newPos;
      });
    }, speed);
  } else {
    clearInterval(interval);
  }

  return () => clearInterval(interval);
}, [moving, direction, selectedCandy]);

 

  // 計算指針的 'left' 樣式 (像素值)
const calculatedPointerLeft = () => {
  if (barRef.current) {
    const barWidth = barRef.current.offsetWidth;
    // 直接計算指針中心點在bar中的百分比位置
    return (pointerPosition / 100) * barWidth;
  }
  return 0; // 如果barRef還沒有被渲染，返回0
};

  // STOP 按鈕的處理函數
  // 注意：如果您將 handleStop 包裹在 useCallback 中，可以避免它在每次渲染時重新創建，進而穩定 useEffect 的依賴
  // const handleStop = useCallback(() => { ... }, [dependencies]);
  const handleStop = () => {
    setMoving(false);
    console.log(`指針停止在: ${pointerPosition}%`);

    if (pointerPosition >= SAFE_ZONE_START && pointerPosition <= SAFE_ZONE_END) {
      if (activatedBreakPoints.length > 0) {
        const currentBreakPoint = activatedBreakPoints[0];
        if (
          !lockedBreakPoints.some(
            (bp) =>
              bp.candyType === currentBreakPoint.candyType &&
              bp.index === currentBreakPoint.index
          )
        ) {
          setLockedBreakPoints((prev) => [...prev, currentBreakPoint]);
          setActivatedBreakPoints([]);
          setSelectedCandy(null);

          if (lockedBreakPoints.length + 1 >= 9) {
            handleOverallSuccess();
          } else {
            console.log(
              `成功擊中一個擊破點！目前已鎖定 ${
                lockedBreakPoints.length + 1
              } 個。`
            );
          }
        }
      }
    } else {
      handleFail();
    }
  };


   // ==== 新增：監聽空白鍵的 useEffect 鉤子 ====
  useEffect(() => {
    const handleKeyPress = (event) => {
      // 判斷是否為空白鍵 (keyCode 32 或 key ' ')
      // 並且確保指針正在移動中才響應
      if (event.code === 'Space' && moving) {
        event.preventDefault(); // 防止空白鍵預設的捲動行為
        handleStop(); // 呼叫停止函數
      }
    };

    // 添加事件監聽器到 window
    window.addEventListener('keydown', handleKeyPress);

    // 清除事件監聽器，避免記憶體洩漏
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [moving, handleStop]); // 依賴 moving 和 handleStop。handleStop 應當保持穩定，否則會重複添加監聽器。
  
  
  
  
  
  
  return (
    <>
      {/* 這是畫面物件 */}

      {/* ====== 主畫面白底區塊 ====== */}
      <div className="w-full bg-white rounded-2xl border border-gold p-6">
        {/* 新增的 flexbox 容器 (糖餅圖案) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "100px",
            marginTop: "-50px",
            position: "relative",
            top: "35px",
          }}
        >
          {/* 星星糖餅容器：新的 div 包裹 Image 和擊破點，並設置 relative 定位 */}
          <div style={{ position: "relative", margin: "0 40px" }}>
            <Image
              src={sugerStar}
              alt="Star"
              width={200}
              height={200}
              onClick={() => handleCandySelect("star")}
              style={{
                cursor: "pointer",
                border: selectedCandy === "star" ? "3px solid #C5AC6B" : "none",
                borderRadius: "8px",
                opacity: moving ? 0.5 : 1, // 如果指針在移動，則禁用選擇糖餅 (視覺反饋)
              }}
            />
            {BREAK_POINTS.star.map((point, index) => {
              const isLocked = lockedBreakPoints.some(
                (bp) => bp.candyType === "star" && bp.index === index
              );
              const isActive = activatedBreakPoints.some(
                (bp) => bp.candyType === "star" && bp.index === index
              );
              const isHovered =
                hoveredBreakPoint?.candyType === "star" &&
                hoveredBreakPoint?.index === index;

              const showHoverIcon =
                isHovered && !isLocked && !moving && selectedCandy === "star";
              const currentHoverIconSrc =
                selectedCandy === "umbrella" ? cursorHurtPng : cursorDefaultPng;

              return (
                <div
                  key={`star-${index}`}
                  onMouseEnter={() => {
                    if (!isLocked && !moving && selectedCandy === "star") {
                      setHoveredBreakPoint({ candyType: "star", index });
                    }
                  }}
                  onMouseLeave={() => setHoveredBreakPoint(null)}
                  onClick={() => handleBreakPointClick("star", index)}
                  style={{
                    position: "absolute",
                    left: `${point.x * 100}%`,
                    top: `${point.y * 100}%`,
                    width: "50px",
                    height: "50px",
                    transform: "translate(-50%, -50%)",
                    cursor:
                      moving || isLocked || selectedCandy !== "star"
                        ? "not-allowed"
                        : "pointer",
                    opacity: isLocked ? 0.6 : 1,
                    pointerEvents:
                      moving || isLocked || selectedCandy !== "star"
                        ? "none"
                        : "auto",
                  }}
                >
                  {isHovered || isActive || isLocked ? (
                    <Image
                      src={redBtnPng}
                      alt="Red Button"
                      width={50}
                      height={50}
                      style={{
                        animation:
                          isHovered && !isLocked && !isActive
                            ? "pulse 0.8s infinite alternate"
                            : "none",
                        display: "block",
                      }}
                    />
                  ) : null}
                  {showHoverIcon && (
                    <Image
                      src={currentHoverIconSrc}
                      alt="Hover Icon"
                      width={150} // 記得在這裡調整您希望的尺寸
                      height={150} // 記得在這裡調整您希望的尺寸
                      style={{
                        position: "absolute",
                        right: "-125px",
                        top: "-95px",
                        zIndex: 10,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 三角形糖餅容器 */}
          <div style={{ position: "relative", margin: "0 40px" }}>
            <Image
              src={sugerTri}
              alt="Triangle"
              width={200}
              height={200}
              onClick={() => handleCandySelect("tri")}
              style={{
                cursor: "pointer",
                border: selectedCandy === "tri" ? "3px solid #C5AC6B" : "none",
                borderRadius: "8px",
                opacity: moving ? 0.5 : 1,
              }}
            />
            {BREAK_POINTS.tri.map((point, index) => {
              const isLocked = lockedBreakPoints.some(
                (bp) => bp.candyType === "tri" && bp.index === index
              );
              const isActive = activatedBreakPoints.some(
                (bp) => bp.candyType === "tri" && bp.index === index
              );
              const isHovered =
                hoveredBreakPoint?.candyType === "tri" &&
                hoveredBreakPoint?.index === index;

              const showHoverIcon =
                isHovered && !isLocked && !moving && selectedCandy === "tri";
              const currentHoverIconSrc =
                selectedCandy === "umbrella" ? cursorHurtPng : cursorDefaultPng;

              return (
                <div
                  key={`tri-${index}`}
                  onMouseEnter={() => {
                    if (!isLocked && !moving && selectedCandy === "tri") {
                      setHoveredBreakPoint({ candyType: "tri", index });
                    }
                  }}
                  onMouseLeave={() => setHoveredBreakPoint(null)}
                  onClick={() => handleBreakPointClick("tri", index)}
                  style={{
                    position: "absolute",
                    left: `${point.x * 100}%`,
                    top: `${point.y * 100}%`,
                    width: "50px",
                    height: "50px",
                    transform: "translate(-50%, -50%)",
                    cursor:
                      moving || isLocked || selectedCandy !== "tri"
                        ? "not-allowed"
                        : "pointer",
                    opacity: isLocked ? 0.6 : 1,
                    pointerEvents:
                      moving || isLocked || selectedCandy !== "tri"
                        ? "none"
                        : "auto",
                  }}
                >
                  {isHovered || isActive || isLocked ? (
                    <Image
                      src={redBtnPng}
                      alt="Red Button"
                      width={50}
                      height={50}
                      style={{
                        animation:
                          isHovered && !isLocked && !isActive
                            ? "pulse 0.8s infinite alternate"
                            : "none",
                        display: "block",
                      }}
                    />
                  ) : null}
                  {showHoverIcon && (
                    <Image
                      src={currentHoverIconSrc}
                      alt="Hover Icon"
                      width={150} // 記得在這裡調整您希望的尺寸
                      height={150} // 記得在這裡調整您希望的尺寸
                      style={{
                        position: "absolute",
                        right: "-125px",
                        top: "-95px",
                        zIndex: 10,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 雨傘糖餅容器 */}
          <div style={{ position: "relative", margin: "0 40px" }}>
            <Image
              src={sugerUmbrella}
              alt="Umbrella"
              width={200}
              height={200}
              onClick={() => handleCandySelect("umbrella")}
              style={{
                cursor: "pointer",
                border:
                  selectedCandy === "umbrella" ? "3px solid #C5AC6B" : "none",
                borderRadius: "8px",
                opacity: moving ? 0.5 : 1,
              }}
            />
            {BREAK_POINTS.umbrella.map((point, index) => {
              const isLocked = lockedBreakPoints.some(
                (bp) => bp.candyType === "umbrella" && bp.index === index
              );
              const isActive = activatedBreakPoints.some(
                (bp) => bp.candyType === "umbrella" && bp.index === index
              );
              const isHovered =
                hoveredBreakPoint?.candyType === "umbrella" &&
                hoveredBreakPoint?.index === index;

              const showHoverIcon =
                isHovered && !isLocked && !moving && selectedCandy === "umbrella";
              const currentHoverIconSrc =
                selectedCandy === "umbrella" ? cursorHurtPng : cursorDefaultPng;

              return (
                <div
                  key={`umbrella-${index}`}
                  onMouseEnter={() => {
                    if (!isLocked && !moving && selectedCandy === "umbrella") {
                      setHoveredBreakPoint({ candyType: "umbrella", index });
                    }
                  }}
                  onMouseLeave={() => setHoveredBreakPoint(null)}
                  onClick={() => handleBreakPointClick("umbrella", index)}
                  style={{
                    position: "absolute",
                    left: `${point.x * 100}%`,
                    top: `${point.y * 100}%`,
                    width: "50px",
                    height: "50px",
                    transform: "translate(-50%, -50%)",
                    cursor:
                      moving || isLocked || selectedCandy !== "umbrella"
                        ? "not-allowed"
                        : "pointer",
                    opacity: isLocked ? 0.6 : 1,
                    pointerEvents:
                      moving || isLocked || selectedCandy !== "umbrella"
                        ? "none"
                        : "auto",
                  }}
                >
                  {isHovered || isActive || isLocked ? (
                    <Image
                      src={redBtnPng}
                      alt="Red Button"
                      width={50}
                      height={50}
                      style={{
                        animation:
                          isHovered && !isLocked && !isActive
                            ? "pulse 0.8s infinite alternate"
                            : "none",
                        display: "block",
                      }}
                    />
                  ) : null}
                  {showHoverIcon && (
                    <Image
                      src={currentHoverIconSrc}
                      alt="Hover Icon"
                      width={150} // 記得在這裡調整您希望的尺寸
                      height={150} // 記得在這裡調整您希望的尺寸
                      style={{
                        position: "absolute",
                        right: "-125px",
                        top: "-95px",
                        zIndex: 10,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ====== 進度條與指針容器 ====== */}
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "120px",
            marginBottom: "40px",
          }}
        >
          {/* ====== 進度條 ====== */}
          <Image
            src={bar}
            alt="Progress Bar"
            width={800}
            height={20}
            ref={barRef}
            style={{
              position: "absolute",
              zIndex: 1,
            }}
          />

          {/* ====== 指針 ====== */}
          <Image
            src={pointer}
            alt="Progress Pointer"
            width={30}
            height={30}
            style={{
              position: "absolute",
              zIndex: 2,
              left: `${calculatedPointerLeft()}px`,
              transform: "translateX(-50%)",
              top: "-45px",
            }}
          />
        </div>

        {/* ====== STOP 鈕 ====== */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%", // 確保佔滿可用寬度
          }}
        >
          <button
            onClick={handleStop}
            className="rounded-lg"
            disabled={!moving}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              position: "relative",
              top: "-10px",
              opacity: !moving ? 0.5 : 1,
            }}
          >
            <Image
              src={stopBtn}
              alt="Stop Button"
              width={160}
              height={60}
              style={{
                display: "block",
                margin: "0 auto",
              }}
            />
          </button>
        </div>
      </div>

      {/* ~~~~~~~~~~~~~~~~~以下是彈出視窗 ~~~~~~~~~~~~~~~~~~~~~~~~~*/}

      {/* 成功過關後彈窗 (現在是「總體成功」視窗) */}
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
                onClick={resetGame}
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

      {/* 失敗過關後彈窗 */}
      {showFailOverlay && (
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
              border: "3px solid #E36B5B",
              color: "#E36B5B",
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            }}
          >
            <h2
              style={{
                color: "#E36B5B",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 18,
                textAlign: "center",
              }}
            >
              Failed！
            </h2>
            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={resetGame}
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
                Retry
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

      {/* styled-jsx 用於定義 Keyframes 動畫 */}
      <style jsx>{`
        @keyframes pulse {
          from {
            transform: scale(0.8);
          }
          to {
            transform: scale(1.2);
          }
        }
      `}</style>
    </>
  );
}