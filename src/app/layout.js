import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Icon from "./components/icon";
import ClientBar from './components/ClientBar';
import ProfileLoginButton from './components/ProfileLoginButton';
import { AuthProvider, useAuth } from './AuthContext';
import UserScoreDisplay from './components/UserScoreDisplay';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const items = [
  {
    name: "Home",
    path: "/",
    backgroundImage: "/bg-home.jpg",
  },
  {
    name: "Summon Spirit",
    path: "/spiritSummon",
    backgroundImage: "/bg-summon.png",
  },
  {
    name: "New Game",
    path: "/newGame",
    backgroundImage: "/bg-newgame.jpg",
  },
  {
    name: "Settings",
    path: "/settings",
    backgroundImage: "/bg-settings.jpg",
  },
];

export const metadata = {
  title: "Gudgame",
  description: "1132 Web Final Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {/* 頂部資訊條 */}
          <div style={{
            position: 'fixed',
            top: 17,
            left: 0,
            width: '100vw',
            zIndex: 10001,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none', // 讓下方可點擊
          }}>
            {/* 左上角 Profile 與 PLAYER_ID */}
            <ProfileLoginButton />
            {/* 右上角 USERNAME 與 SCORE */}
            <UserScoreDisplay />
          </div>
          {/* 背景與內容 */}
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            border: '10px solid #C5AC6B',
            borderRadius: '0',
            background: '#F5F0E4',
            boxSizing: 'border-box',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              border: '3px solid #C5AC6B',
              borderRadius: '0',
              background: '#F5F0E4',
              width: 'calc(100vw - 34px)',
              height: 'calc(100vh - 34px)',
              margin: '8px',
              boxSizing: 'border-box',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <div className="pageContainer">
                <div className="innerContainer">
                  {/* 主要內容 */}
                  <div className="flex flex-col flex-1 w-full">
                    {children}
                  </div>
                  {/* 底部導航 Bar */}
                  <ClientBar />
                </div>
              </div>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
