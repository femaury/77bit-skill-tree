import { useState } from 'react';
import { SkillTree } from './components/SkillTree';
import { TreeSelect } from './components/TreeSelect';
import { skillTrees } from './data/formattedSkillTrees';
import { SkillTrees } from './types';

export default function App() {
  const trees = skillTrees as SkillTrees;
  const [selectedTree, setSelectedTree] = useState<keyof SkillTrees>(Object.keys(trees)[0] as keyof SkillTrees);

  return (
    <div className="min-h-screen bg-white/10 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-8 text-center text-accent">
          77-Bit Skill Trees
        </h1>
        <div className="mb-8 flex justify-center">
          <TreeSelect
            trees={trees}
            value={selectedTree}
            onValueChange={(value) => setSelectedTree(value as keyof SkillTrees)}
          />
        </div>
        
        <SkillTree tree={trees[selectedTree]} />
      </div>
    </div>
  );
} 