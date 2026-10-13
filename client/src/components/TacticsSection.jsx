import tactics from "../data/tactics";
import TacticCard from "./TacticCard";

const TacticsSection = () => {
  return (
    <section id="tactics" className="px-5 py-16 md:px-10 md:py-20">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-lime-300">BUILD YOUR CHESS VISION</p>

          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Master the tactics</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-gray-400">
          Learn a theme, recognize the pattern, and find the winning move.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tactics.map((tactic) => (
          <TacticCard key={tactic.id} tactic={tactic} />
        ))}
      </div>
    </section>
  );
};

export default TacticsSection;
