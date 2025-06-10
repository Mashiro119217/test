import Link from "next/link";

export default function Icon({ items }) {
  return (
    <div className="w-full h-14 flex flex-row justify-around items-center">
      {items.map((item, index) => (
        <Link key={index} href={item.path} className="flex-1 h-full">
          <div
            className="h-full flex flex-col items-center justify-center text-[#314757] hover:scale-105 transition-all"
            style={{
              backgroundImage: item.backgroundImage ? `url(${item.backgroundImage})` : "none",
              backgroundColor: item.backgroundImage ? "transparent" : "#3B82F6",
              borderRadius: "0.75rem",
            }}
          >
            <span className="text-sm font-medium">{item.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
