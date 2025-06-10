import { useState, useEffect } from "react";

export default function Timer({ duration = 100, onEnd }) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(s => {
                if (s <= 1) {
                    clearInterval(timer);
                    if (onEnd) onEnd(); // 通知父元件時間結束
                    return 0;
                }
                return s - 1;
            });
        }, 1000);

        return () => clearInterval(timer); // 清理
    }, []);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                flexDirection: "row",
                alignItems: "center",
            }}>

            <img
                src="./game8/clock.svg"
                alt="clock"
                style={{
                    width: "40%",
                    height: "40%",
                    objectFit: "contain",
                }}></img>

            <p
                style={{
                    fontSize: "clamp(1rem, 4vw, 2rem)",
                    color: "black",
                    fontWeight: "bold",
                    margin: 0,
                    marginRight: "30px",
                }}>
                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                {(timeLeft % 60).toString().padStart(2, '0')}</p>
        </div>
    );
}