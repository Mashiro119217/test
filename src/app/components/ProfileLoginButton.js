"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";

export default function ProfileLoginButton() {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginLeft: 40,
        marginTop: 18,
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}
      onClick={() => router.push('/login')}
      title="前往登入頁"
    >
      <img src="/profile.png" alt="Profile" style={{ width: 24, height: 24, borderRadius: '50%' }} />
      <span style={{ color: '#505166', fontWeight: 600, fontSize: 15 }}>
        {user ? user.username : 'PLAYER_ID'}
      </span>
    </div>
  );
} 