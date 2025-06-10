import React from "react";
import Game8Canvas from "../components/game8.js";

export default function App() {
  return (
    <div
      style={{
        height: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 120,
        marginBottom: 140,
        border: '3px solid #C5AC6B',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 10,
        paddingRight: 10,
        boxSizing: 'border-box',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        position: 'relative',
      }}
    >
      <Game8Canvas />
    </div>
  );
}