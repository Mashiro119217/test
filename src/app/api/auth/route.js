// src/app/api/auth/route.js
import { db } from '../../firebase'; 
import { ref, set, get, child, update } from "firebase/database";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Missing username or password' }), { status: 400 });
  }

  // 檢查是否已存在
  const userRef = ref(db, `users/${username}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    // 驗證密碼
    const userData = snapshot.val();
    const match = await bcrypt.compare(password, userData.password);
    if (!match) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
    }
    // 登入成功，回傳資料
    return new Response(JSON.stringify({ username, score: userData.score }), { status: 200 });
  } else {
    // 註冊新用戶
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    await set(userRef, {
      username,
      password: hashedPassword,
      createdAt: now,
      score: 0
    });
    return new Response(JSON.stringify({ username, score: 0 }), { status: 201 });
  }
}

export async function PATCH(request) {
  const { username, score } = await request.json();
  if (!username || typeof score !== 'number') {
    return new Response(JSON.stringify({ error: 'Missing username or score' }), { status: 400 });
  }
  const userRef = ref(db, `users/${username}`);
  try {
    await update(userRef, { score });
    return new Response(JSON.stringify({ username, score }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update score' }), { status: 500 });
  }
}