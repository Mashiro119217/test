export default function Ice({ components }) {
    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                aspectRatio: "1 / 1",
            }}
        >
            <img
                src="./game8/ice.svg"
                alt="ice"
                style={{
                    width: "25%",
                    height: "25%",
                    objectFit: "contain",
                    position: "absolute",
                }}
            />

            {components.map((component, i) => (
                <img
                    key={i}
                    src={`./game8/onIce/${component.name}.svg`}
                    alt={component.name}
                    style={{
                        position: "absolute",
                        top: component.top,
                        left: component.left,
                        transform: "translate(-50%, -50%)",
                        width: component.scale,
                        height: component.scale,
                        objectFit: "contain",
                        zIndex: component.zIndex,
                    }}
                />
            ))}
        </div>
    );
}