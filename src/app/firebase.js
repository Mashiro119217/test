// 初始化 Firebase 並匯出 Realtime Database 實例
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';


// 將下方 config 替換為你的 Firebase 專案設定
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-2pg9R-I5oXa4CJz8EQWN0ckJOii5dKo",
    authDomain: "gudgame-9ad81.firebaseapp.com",
    databaseURL: "https://gudgame-9ad81-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "gudgame-9ad81",
    storageBucket: "gudgame-9ad81.appspot.com",
    messagingSenderId: "480280886357",
    appId: "1:480280886357:web:cecc7e336c056adbc6a8dc"
  };

// 避免重複初始化
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// 取得 Realtime Database 實例
const db = getDatabase(app);


export { db }; 