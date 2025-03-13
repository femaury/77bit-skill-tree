import { useState } from 'react';
import { SkillTree } from './components/SkillTree';
import { SkillTreeHeader } from './components/SkillTreeHeader';
import { skillTrees } from './data/formattedSkillTrees';
import { SkillTrees } from './types';
import { SkillProvider } from './context/SkillContext';
import { useSkill } from './context/SkillContext';

function AppContent() {
  const trees = skillTrees as SkillTrees;
  const [selectedTree, setSelectedTree] = useState<keyof SkillTrees>(Object.keys(trees)[0] as keyof SkillTrees);
  const { resetAllSkills } = useSkill();
  
  const handleTreeChange = (value: keyof SkillTrees) => {
    // Reset skills when changing class
    resetAllSkills();
    setSelectedTree(value as keyof SkillTrees);
  };

  return (
    <div className="min-h-screen bg-white/10 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-8 text-center text-accent">
          77-Bit Skill Trees
        </h1>
        
        <SkillTreeHeader
          trees={trees}
          value={selectedTree}
          onValueChange={handleTreeChange}
        />
        
        <SkillTree tree={trees[selectedTree]} />
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