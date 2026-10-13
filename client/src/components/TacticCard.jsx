const TacticCard = ({ tactic }) => {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#19211c] p-5 transition duration-200 hover:-translate-y-1 hover:border-lime-300/40">
      <div className="flex items-center justify-between gap-3">
        <span className="text-4xl text-lime-300 " aria-hidden="true">
          {tactic.symbol}
        </span>

        <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-300">{tactic.difficulty}</span>
      </div>

      <h3 className="mt-5 text-xl font-bold text-white">{tactic.name}</h3>

      <p className="mt-3 flex-1 text-sm leading-6 text-gray-400">{tactic.description}</p>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="text-sm text-gray-400">{tactic.puzzles} puzzles</span>

        <a href="#practice" className="text-sm font-semibold text-lime-300 hover:text-lime-200">
          Practice ↗
        </a>
      </div>
    </article>
  );
};

export default TacticCard;
