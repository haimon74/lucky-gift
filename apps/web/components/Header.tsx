export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "rgba(10,10,15,0.9)",
        borderColor: "#1e1e2e",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-xl font-bold no-underline">
          <span>🍀</span>
          <span className="gold-text">Lucky Gift</span>
        </a>
      </div>
    </header>
  );
}
