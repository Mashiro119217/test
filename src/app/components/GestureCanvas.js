"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// 動態載入 react-p5
const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});

let path = [];
let isDrawing = false;

export default function GestureCanvas() {
  const [success, setSuccess] = useState(false); // 召喚成功狀態
  const [showOverlay, setShowOverlay] = useState(false); // 是否顯示成功圖片

  useEffect(() => {
    const hasCleared = localStorage.getItem("summonSuccess") === "true";
    if (hasCleared) {
      setSuccess(true);
      setShowOverlay(true);
    }
  }, []);

  // 成功後顯示召喚畫面與提示
  useEffect(() => {
    if (success) {
      setShowOverlay(true); // 顯示 bg-summonRun.png
      setTimeout(() => {
      }, 500);
    }
  }, [success]);

  // 畫布初始化
  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(300, 600).parent(canvasParentRef);
    p5.clear();
    p5.stroke(0);
    p5.strokeWeight(4);
    p5.noFill();
  };

  // 畫滑鼠軌跡
  const draw = (p5) => {
    p5.clear();
    p5.beginShape();
    for (let pt of path) {
      p5.vertex(pt.x, pt.y);
    }
    p5.endShape();
  };

  // 滑鼠按下開始紀錄
  const mousePressed = () => {
    path = [];
    isDrawing = true;
  };

  // 拖曳過程中紀錄點
  const mouseDragged = (p5) => {
    if (isDrawing) {
      path.push({ x: p5.mouseX, y: p5.mouseY });
    }
  };

  // 滑鼠放開進行直線判斷
  const mouseReleased = () => {
    isDrawing = false;
    const result = isStraightLine(path);
    console.log("判斷結果：", result);
    if (result) {
      localStorage.setItem("summonSuccess", "true"); // ✅ 先儲存
      setSuccess(true);                               // 再更新狀態（觸發 useEffect）

    }
  };

  return (
    <div
      className="relative w-full h-full bg-white"
      style={{
        backgroundImage: "url(/bg-summon.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 中央畫布區域（半透明白底） */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "300px",
          height: "600px",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Sketch
          setup={setup}
          draw={draw}
          mousePressed={mousePressed}
          mouseReleased={mouseReleased}
          mouseDragged={mouseDragged}
        />
      </div>

      {/* 成功召喚後覆蓋整張畫面 */}
      {showOverlay && (
        <img
          src="/bg-summonRun.png"
          alt="神轎啟動成功"
          className="absolute top-0 left-0 w-full h-full object-cover z-20 pointer-events-none"
        />
        
      )}
      {showOverlay && (
        <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white rounded-xl shadow-xl"
            style={{
            width: "350px",
            height: "200px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "1.5rem",
            }}
        >
            <h2 className="text-xl font-bold mb-4 text-center">🎉 已成功啟動神轎！</h2>
            <div className="flex gap-4">
            <button
                onClick={() => {
                path = [];
                isDrawing = false;
                setShowOverlay(false);
                setSuccess(false);
                }}
                className="px-4 py-2 bg-[#D0A55B] text-white rounded hover:bg-[#B95734]"
            >
                再玩一次
            </button>
            <button
                onClick={() => {
                window.location.href = "/"; // ← 可替換成其他導向
                }}
                className="px-4 py-2 bg-[#314757] text-white rounded hover:bg-gray-600"
            >
                返回主畫面
            </button>
            </div>
        </div>
        )}  


    </div>
  );
}

// 基本直線判斷演算法
function isStraightLine(points) {
  if (points.length < 5) return false; // 太短不計

  const p0 = points[0];
  const p1 = points[points.length - 1];
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const lineLength = Math.sqrt(dx * dx + dy * dy);

  if (lineLength < 50) return false; // 長度不足不算直線

  let totalDeviation = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const px = points[i].x;
    const py = points[i].y;
    // 點到線的垂直距離公式
    const distance = Math.abs(dy * px - dx * py + p1.x * p0.y - p1.y * p0.x) / lineLength;
    totalDeviation += distance;
  }

  const avgDeviation = totalDeviation / points.length;
  console.log("平均偏差：", avgDeviation);

  // 若偏差夠小，代表為直線
  return avgDeviation < 15;
}