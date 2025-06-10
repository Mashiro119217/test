export default function Wall({ direction = "top" }) {

    if (direction == "top") {
        return (
            <div
                style={{
                    background: "#F5F0E4",
                    position: "absolute",
                    height: "35%",
                    width: "20px",
                    bottom: "65%",
                }}>
            </div>
        );
    }
    else if (direction == "bottom") {
        return (
            <div
                style={{
                    background: "#F5F0E4",
                    position: "absolute",
                    height: "35%",
                    width: "20px",
                    top: "65%",
                }}>
            </div>
        );
    }
    else if (direction == "left") {
        return (
            <div
                style={{
                    background: "#F5F0E4",
                    position: "absolute",
                    height: "20px",
                    width: "35%",
                    right: "65%",
                }}>
            </div>
        );
    }
    else if (direction == "right") {
        return (
            <div
                style={{
                    background: "#F5F0E4",
                    position: "absolute",
                    height: "20px",
                    width: "35%",
                    left: "65%",
                }}>
            </div>
        );
    }
}