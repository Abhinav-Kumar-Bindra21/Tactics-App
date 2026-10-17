function AboutSection() {
  return (
    <section
      id="about"
      className="mx-5 my-10 rounded-3xl border border-white/10 bg-[#19211c] px-6 py-12 text-center md:mx-10 md:px-12 md:py-16"
    >
      <p className="text-xs font-bold tracking-[0.2em] text-lime-300">OUR MISSION</p>

      <h2 id="how-it-works" className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
        One puzzle at a time.
      </h2>

      <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-400">
        TacticLab helps chess players recognize combinations, calculate confidently, and improve through focused
        practice. Start with a tactic, solve a puzzle, and build your skills one move at a time.
      </p>

      <a
        href="tactics"
        className="mt-7 inline-flex rounded-xl border border-lime-300/40 px-5 py-3 font-semibold text-lime-300 transition hover:bg-lime-300 hover:text-gray-950"
      >
        Explore tactics
      </a>
    </section>
  );
}

export default AboutSection;
