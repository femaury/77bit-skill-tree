import { useState } from 'react';
import { SkillTree } from './components/SkillTree';
import { TreeSelect } from './components/TreeSelect';
import { skillTrees } from './data/formattedSkillTrees';
import { SkillTrees } from './types';

export default function App() {
  const trees = skillTrees as SkillTrees;
  const [selectedTree, setSelectedTree] = useState<keyof SkillTrees>(Object.keys(trees)[0] as keyof SkillTrees);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Skill Trees
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