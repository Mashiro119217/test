export default function Order({ orders }) {
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "10px",
            }}>

            {orders.map((order, i) => (
                <div
                    key={i}
                    style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        position: "relative",
                    }}>

                    <img
                        src={"./game8/orderCard.svg"}
                        alt="card"
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}>

                    </img>

                    <div
                        style={{
                            position: "absolute",
                            bottom: "5px",
                            width: "50%",
                            height: "70%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}>
                        <img
                            src={`/game8/${order.name}.svg`}
                            alt={order.name}
                            style={{
                                width: "80%",
                                height: "80%",
                                objectFit: "contain",
                            }}></img>
                    </div>

                </div>
            ))}

        </div>
    )
}