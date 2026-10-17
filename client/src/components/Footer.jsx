function Footer() {
  return (
    <footer className="flex flex-col items-start justify-between gap-4 border-t border-white/10 px-5 py-7 sm:flex-row sm:items-center md:px-10">
      <a href="#home" className="text-lg font-bold text-white">
        ♞ Tactic<span className="text-lime-300">Lab</span>
      </a>

      <p className="text-sm text-gray-500">Built to make every move count.</p>

      <a href="tactics" className="text-sm font-semibold text-lime-300 hover:text-lime-200">
        Explore tactics ↑
      </a>
    </footer>
  );
}

export default Footer;
