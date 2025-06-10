import { useEffect, useState} from "react";

export default function FlyTopping({ topping, direction, onArrive}) {
    const [arrived, setArrived] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setArrived(true);
        }, 50); // 先渲染在起始位置，再觸發移動

        return () => clearTimeout(timer);
    }, []);

    const startPosition = {
        left: "50%",
        top: "50%",
        transform:
            direction === "left"
                ? "translate(-200%, -50%)"
                : direction === "right"
                    ? "translate(200%, -50%)"
                    : direction === "top"
                        ? "translate(-50%, -200%)"
                        : "translate(-50%, 200%)",
    };

    const endPosition = {
        transform: "translate(-70%, -70%)",
    };

    return (
        <img
            src={`/game8/${topping.name}.svg`}
            alt={topping.name}
            onTransitionEnd={onArrive}
            style={{
                position: "absolute",
                top: "100%",
                left: "100%",
                width: "10%",
                height: "10%",
                objectFit: "contain",
                transition: "transform 1s ease-in-out",
                zIndex: 10,
                ...startPosition,
                ...(arrived ? endPosition : {}),
            }} />
    );
}