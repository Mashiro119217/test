export default function Coin({ coins }) {
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
                src="./game8/coin.svg"
                alt="coin"
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
                }}>{coins}</p>
        </div>
    );
}