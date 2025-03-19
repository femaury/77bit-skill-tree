import { SkillTree } from './components/SkillTree';
import { SkillTreeHeader } from './components/SkillTreeHeader';
import { skillTrees } from './data/formattedSkillTrees';
import { SkillTrees } from './types';
import { SkillProvider } from './context/SkillContext';
import { useSkill } from './context/SkillContext';

function AppContent() {
  const trees = skillTrees as SkillTrees;
  const { currentClass } = useSkill();
  
  return (
    <div className="min-h-screen bg-white/10 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="title-font text-xl sm:text-5xl font-black mb-4 sm:mb-8 text-center text-accent">
          77-Bit Skill Trees
        </h1>
        
        <SkillTreeHeader
          trees={trees}
        />
        
        <SkillTree tree={trees[currentClass]} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SkillProvider>
      <AppContent />
    </SkillProvider>
  );
} 