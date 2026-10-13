const Navbar = () => {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 md:px-10">
      <a href="#home" className="text-2xl font-bold tracking-tight text-white">
        ♞ Tactic <span className="text-lime-300 ">Lab</span>
      </a>

      <nav className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
        <a href="#tactics" className="transition hover:text-lime-300">
          Tactics
        </a>

        <a href="#how-it-work" className="transition hover:text-lime-300">
          How it works
        </a>

        <a href="#about" className="transition hover:text-lime-300">
          About
        </a>
      </nav>

      <a
        href="#tactics"
        className="rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-bold text-gray-950 transition hover:bg-lime-200"
      >
        Start Training →
      </a>
    </header>
  );
};

export default Navbar;
