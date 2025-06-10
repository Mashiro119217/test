"use client";

import { Canvas, useThree } from "@react-three/fiber";
import {
  RoundedBox,
  CameraControls,
  Environment,
  useGLTF,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import * as THREE from "three";

function Apple({ isGameActive, onSuccess, onFail }) {
  const { scene } = useGLTF("/drawMachine.glb");
  const [rotation, setRotation] = useState([0, -Math.PI / 2, 0]);
  const [inputSequence, setInputSequence] = useState([]);
  const [gameResultTriggered, setGameResultTriggered] = useState(false); // 防止重複觸發

  const turnRef = useRef(null); // 引用本體本體
  const turn2Ref = useRef(null); // 引用把手

  // 確保模型完全加載後進行遍歷
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.name === 'TURN') {
          turnRef.current = child; 
        }
        if (child.name === 'TURN2') {
          turn2Ref.current = child; 
        }
      });
    }
  }, [scene]);

  // 偵測按鍵事件來控制旋轉
  useEffect(() => {
    const handleKeyDown = (event) => {
      // 當遊戲已結束或已經觸發成功結果時，停止旋轉
      if (!isGameActive || gameResultTriggered || (!turnRef.current && !turn2Ref.current)) return;

      // 檢查有效的按鍵（左、右、上）
      const validKeys = ["ArrowLeft", "ArrowRight", "ArrowUp"];
      if (!validKeys.includes(event.key)) return;

      // 根據按鍵調整 TURN 和 TURN2 物件的旋轉，只在 X 軸進行旋轉
      if (event.key === "ArrowLeft") {
        if (turnRef.current) turnRef.current.rotation.x += 10;
        if (turn2Ref.current) turn2Ref.current.rotation.x += 1;
      }

      if (event.key === "ArrowRight") {
        if (turnRef.current) turnRef.current.rotation.x += 10;
        if (turn2Ref.current) turn2Ref.current.rotation.x += 1;
      }

      if (event.key === "ArrowUp") {
        if (turnRef.current) turnRef.current.rotation.x += 10;
        if (turn2Ref.current) turn2Ref.current.rotation.x += 1;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameActive, gameResultTriggered]); // 加入 gameResultTriggered 來控制觸發

  // 方向鍵偵測
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isGameActive || gameResultTriggered) return;

      const validKeys = ["ArrowLeft", "ArrowUp", "ArrowRight"];
      if (!validKeys.includes(event.key)) return;

      setInputSequence((prev) => {
        const newSequence = [...prev, event.key].slice(-15); 

        console.log("Current sequence:", newSequence); // 輸出當前的序列

        if (newSequence.length === 15) {
          const correctSequence = [
            "ArrowLeft", "ArrowUp", "ArrowRight", 
            "ArrowLeft", "ArrowUp", "ArrowRight", 
            "ArrowLeft", "ArrowUp", "ArrowRight", 
            "ArrowLeft", "ArrowUp", "ArrowRight", 
            "ArrowLeft", "ArrowUp", "ArrowRight"
          ];

          if (JSON.stringify(newSequence) === JSON.stringify(correctSequence)) {
            handleGameResult(); // 序列正確後觸發遊戲結果
          }
        }
        return newSequence;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameActive, gameResultTriggered]); // 加入 gameResultTriggered 來控制觸發

  const handleGameResult = () => {
    console.log("Game result triggered");

    setGameResultTriggered(true); // 設置已經觸發結果，防止重複觸發

    const rand = Math.random();
    console.log("Random value:", rand);
    const success = rand < 0.5;
    //雖然我設定50%但他很容易出現永遠都是未中獎的bug，我直接當黑店我沒差（修一輩子沒修好所以放棄）
    if (success) {
      onSuccess(); // 顯示成功，加分
    } else {
      onFail(); // 顯示失敗，無加分
    }
  };

  return (
    <primitive
      object={scene} // 使用完整的 scene
      scale={[0.6, 0.6, 0.6]}
      position={[0, 0, 0]}
      rotation={rotation}
    />
  );
}

function CameraSetup() {
  const { camera, gl, invalidate } = useThree();

  useEffect(() => {
    // 設定相機的初始位置
    camera.position.set(0, 0, 0); 
    camera.lookAt(0, 0, 0);

    // 強制重新渲染場景
    invalidate(); // 手動刷新渲染

  }, [camera, invalidate]); // 依賴於相機和invalidate，當它們改變時重新執行

  return null;
}

export default function Game9Content({ onSuccess, onFail, isGameActive }) {
  // 這是正確的方向鍵序列
  const correctSequence = useMemo(() => [
    "ArrowLeft", "ArrowUp", "ArrowRight", 
    "ArrowLeft", "ArrowUp", "ArrowRight", 
    "ArrowLeft", "ArrowUp", "ArrowRight", 
    "ArrowLeft", "ArrowUp", "ArrowRight", 
    "ArrowLeft", "ArrowUp", "ArrowRight"
  ], []);

  // 方向鍵對應圖片檔名
  const arrowImageMap = {
    ArrowLeft: {
      off: "/9-left-off.png",
      on: "/9-left-on.png",
      select: "/9-left-select.png"
    },
    ArrowUp: {
      off: "/9-up-off.png",
      on: "/9-up-on.png",
      select: "/9-up-select.png"
    },
    ArrowRight: {
      off: "/9-right-off.png",
      on: "/9-right-on.png",
      select: "/9-right-select.png"
    }
  };

  // 取得目前輸入進度
  const [inputSequence, setInputSequence] = useState([]);
  // 下面這段 useEffect 只要保留一次即可，移到這裡
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isGameActive) return;
      const validKeys = ["ArrowLeft", "ArrowUp", "ArrowRight"];
      if (!validKeys.includes(event.key)) return;
      setInputSequence((prev) => {
        const newSequence = [...prev, event.key].slice(-15);
        return newSequence;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameActive]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* 方向鍵提示區塊 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "80%",
          transform: "translate(-50%, -50%)",
          zIndex: 30,
          background: "rgba(255,255,255,0.8)",
          borderRadius: "16px",
          padding: "12px 24px",
          fontSize: "2rem",
          fontWeight: "bold",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          pointerEvents: "none"
        }}
      >
        {correctSequence.map((key, idx) => {
          let state = "off";
          if (idx < inputSequence.length) {
            state = inputSequence[idx] === key ? "on" : "off";
          }
          if (idx === inputSequence.length) {
            state = "select";
          }
          return (
            <img
              key={idx}
              src={arrowImageMap[key][state]}
              alt={key + "-" + state}
              style={{ width: 25, height: 25, margin: "0 4px", verticalAlign: "middle"}}
            />
          );
        })}
      </div>
      {/* Canvas */}
      <Canvas
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          alpha: true,
        }}
        style={{ background: "transparent" }}
      >
        <PerspectiveCamera makeDefault position={[1.5, 1.5, 2.5]} fov={75} near={0.1} far={100}>
          <CameraSetup />
        </PerspectiveCamera>
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.2}
          penumbra={0.5}
          intensity={3.5}
          color="#BEAC74"
        />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#BEAC74" />
        <Suspense fallback={null}>
          <Apple isGameActive={isGameActive} onSuccess={onSuccess} onFail={onFail} />
        </Suspense>
        <Environment preset="studio" background={false} />
        <ContactShadows opacity={0.5} scale={50} blur={20} />
        <CameraControls enabled={false} />
      </Canvas>
    </div>
  );
}
