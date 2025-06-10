
# Gudgame Project 🎮✨

本專案為多人協作的 Next.js 遊戲平台，每位同學需負責一個 `game`，並於指定資料夾內開發與修改對應的頁面與 JS 檔案。

## 🗂️ 專案目錄結構

```
src/
  app/
    game1/
      page.js
    game2/
      page.js
    ...
    game11/
      page.js
    components/
      game1.js
      game2.js
      ...
      game11.js
    ...
```

- 每個 `gameN/` 資料夾就是你的遊戲專屬地盤！
- `components/gameN.js` 是你寫遊戲邏輯的地方。

---

## 🛠️ 環境安裝

1. **安裝 Node.js**  
   👉 請先安裝 [Node.js (建議 LTS 版本)](https://nodejs.org/zh-tw/)

2. **安裝專案依賴**
   ```bash
   npm install
   ```

---

## 🚀 本地開發

啟動本地開發伺服器：

```bash
npm run dev
```

打開瀏覽器進入 [http://localhost:3000](http://localhost:3000) 就可以看到首頁囉！

---

## 👾 如何開發＆修改自己的遊戲

### 1️⃣ 找到你的遊戲資料夾

每位同學請在 `src/app/gameN/`（N 是你的遊戲編號）資料夾下，編輯 `page.js`，以及 `src/app/components/gameN.js`。

#### 例如：  
- `src/app/game2/page.js`  
- `src/app/components/game2.js`

### 2️⃣ 修改頁面入口 (`page.js`)

範例（game2）：

```js
import React from "react";
import Game2Canvas from "../components/game2.js";

export default function App() {
  return (
    <div style={...}>
      <Game2Canvas />
    </div>
  );
}
```

總共有三個地方，其實都有幫大家改好了，但還是檢查一下避免我老花，只要確保引入正確的 component。

### 3️⃣ 編輯你的遊戲邏輯 (`components/gameN.js`)

- 這裡是你大展身手的地方！
- 你可以參考 `game2.js` 的範例，裡面有一個 `handleSuccess` 函式，當過關時會顯示彈窗並加分。
- 請把 `模擬過關` 的按鈕換成你自己的遊戲互動＆過關條件。

#### 範例片段（game2.js）：

```js
<button onClick={handleSuccess}>模擬過關2（請改成你自己的過關條件）</button>
```

- 當你判斷玩家過關時，請呼叫 `handleSuccess()`，這樣會自動顯示過關彈窗並加分唷！

---

## 🖼️ 圖片怎麼放？

- 圖片可以存在 `public/` 裡面讀取，這樣網址會自動對應到根目錄。
- 例如你放一張 `public/cat.png`，在 React/JSX 裡這樣用：

```jsx
<img src="/cat.png" alt="hellokitty" style={{ width: 200 }} />
```

- 也可以用在 CSS 背景：

```js
<div style={{ backgroundImage: 'url(/cat.png)' }} />
```

---

## 🔀 如何使用 GitHub Desktop 開 branch 與更新專案

### 1️⃣ 建立分支（Branch）

1. 請先在 GitHub Desktop 中開啟本專案。
2. 點選左上角的「Current Branch」按鈕。
3. 選擇「New Branch」。 
4. 輸入分支名稱。
5. 按下「Create Branch」完成建立。

### 2️⃣ 同步遠端資料（Pull）

1. 確保目前位於正確的 branch。
2. 點選「Fetch origin」。
3. 若有更新，點選「Pull origin」以下載最新的遠端資料，避免衝突。

### 3️⃣ 進行開發與提交（Commit）

1. 在本地進行修改（如 `page.js`、`components/gameN.js`）。
2. 回到 GitHub Desktop，檢查「Changes」頁籤，確認要提交的檔案。
3. 填寫 Commit 訊息（例如：`feat: 完成 gameN 初版`）。
4. 按下「Commit to [branch name]」。

### 4️⃣ 推送至遠端（Push）

1. Commit 完成後，按下「Push origin」。
2. 這樣就把你在本地的修改同步到 GitHub 遠端囉。

### 5️⃣ 提交 Pull Request（PR）

1. 前往 GitHub 網頁版，切換到你剛建立的 branch。
2. 點選「New Pull Request」。 
3. 記得檢查 PR 的目標分支是否正確（通常是 `main` 或 `develop`）。
4. 輸入 PR 標題與說明後送出，等候審核與合併。

---

## 📝 注意事項

- 請勿更動他人 `gameN` 資料夾與 JS 檔案，和其他你不認識的檔案。
- 若需共用元件，請放在 `components/` 並協調命名。
- 若有需要存取分數、用戶等，請參考 `useAuth` 的用法。

---

## 💬 聯絡/協作

有問題歡迎在群組討論，大家一起加油！(๑•̀ㅂ•́)و✧
