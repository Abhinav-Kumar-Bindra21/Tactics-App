import ChessboardPreview from "./ChessboardPreview";

const Hero = () => {
  return (
    <section
      id="home"
      className="grid items-center gap-10 px-5 py-12 sm:py-16 md:grid-cols-2 md:gap-12 md:px-10 md:py-16"
    >
      {/* Left column: Hero content */}
      <div>
        <p className="text-xs font-bold tracking-[0.25em] text-lime-300">THINK. CALCULATE. WIN.</p>

        <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
          See the move
          <br />
          <span className="text-lime-300">before they do.</span>
        </h1>

        <p className="mt-6 max-w-lg leading-7 text-gray-400">
          Sharpen your chess vision with tactical puzzles, focused practice, and progress you can measure
        </p>

        <a
          href="#tactics"
          className="mt-8 inline-flex items-center gap-3 rounded-xl bg-lime-300 px-6 py-3.5 font-bold text-gray-950 transition hover:bg-lime-200"
        >
          Explore tactics <span aria-hidden="true">→</span>
        </a>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-gray-400">
          <span>♞ Forks</span>
          <span>♝ Pins</span>
          <span>♜ Skewers</span>
          <span>♛ Checkmates</span>
        </div>
      </div>

      {/* Right column: Existing chessboard preview */}
      <div className="mx-auto w-full min-w-0 max-w-[460px]">
        <ChessboardPreview />
      </div>
    </section>
  );
};

export default Hero;
