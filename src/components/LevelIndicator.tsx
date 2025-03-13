import { useSkill } from '../context/SkillContext';
import { ResetIcon } from '@radix-ui/react-icons';

export function LevelIndicator() {
  const { playerLevel, maxPlayerLevel, totalSpentPoints, remainingPoints, resetAllSkills } = useSkill();
  
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-accent/20 rounded-lg px-4 py-2 text-white font-medium">
            Level: {playerLevel}/{maxPlayerLevel}
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-2 text-white font-medium">
            Skill Points Spent: {totalSpentPoints}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-lg px-4 py-2 text-white font-medium flex items-center gap-2">
            <span>Remaining Points:</span>
            <span className={`${remainingPoints === 0 ? 'text-red-400' : 'text-accent'} font-bold`}>
              {remainingPoints}
            </span>
          </div>
          <button 
            className="bg-red-500/20 hover:bg-red-500/30 rounded-lg px-4 py-2 text-white font-medium flex items-center gap-2 transition-colors"
            onClick={resetAllSkills}
          >
            <ResetIcon className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
      <div className="mt-2 text-white/60 text-sm text-center">
        Each skill point spent increases your level. Default skills don't count toward your level.
        <br />
        Left-click on skills to add points, right-click to remove points.
      </div>
    </div>
  );
} 