'use client';
import { useAuth } from '../AuthContext';

export default function UserScoreDisplay() {
  const { user } = useAuth();
  return (
    <div style={{
      color: '#E36B5B',
      fontWeight: 700,
      fontSize: 16,
      marginRight: 40,
      marginTop: 18,
      pointerEvents: 'auto',
    }}>
      {`SCORE: ${user ? user.score : 0}`}
    </div>
  );
} 