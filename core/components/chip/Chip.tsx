interface ChipProps {
  text: string;
  color: string;
  width: string;
  border: string;
  bg: string;
}

export default function Chip({
  text = "",
  color = "#000",
  width = "100%",
  border = "",
  bg = "",
}: ChipProps) {
  return (
    <main
      className="flex items-center justify-center px-4 py-3 rounded-lg font-bold"
      style={{ width: width, border: border, background: bg, color: color }}
    >
      {text}
    </main>
  );
}
