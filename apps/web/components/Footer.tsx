export default function Footer() {
  return (
    <footer
      className="border-t py-6 mt-auto"
      style={{ borderColor: "#1e1e2e", backgroundColor: "#12121a" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm" style={{ color: "#6b6b80" }}>
        © {new Date().getFullYear()} Lucky Gift · luck-gift.haimazar.us
      </div>
    </footer>
  );
}
