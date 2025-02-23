import { Hub } from './Hub';
import { SkillTreeData, SkillNode } from '../types';

interface SkillTreeProps {
  tree: SkillTreeData;
}

export function SkillTree({ tree }: SkillTreeProps) {
  // Find the starting hub that contains DefaultSkills
  const startingHub = Object.entries(tree.children).find(([, hub]) => 
    hub.type === 'Hub' && 
    hub.children?.some(childId => 
      tree.children[childId]?.type === 'DefaultSkills'
    )
  );

  // Get remaining hubs sorted by pointsToUnlock
  const remainingHubs = Object.entries(tree.children)
    .filter(([id]) => id !== startingHub?.[0])
    .filter(([, hub]) => hub.type === 'Hub')
    .sort((a, b) => (a[1].pointsToUnlock || 0) - (b[1].pointsToUnlock || 0)) as [string, SkillNode][];

  return (
    <div className="flex flex-col gap-8">
      {/* Display starting hub first */}
      {startingHub && (
        <Hub 
          key={startingHub[0]} 
          hub={startingHub[1]} 
          allNodes={tree.children}
        />
      )}

      {/* Display remaining hubs */}
      {remainingHubs.map(([hubId, hub]) => (
        <Hub 
          key={hubId} 
          hub={hub} 
          allNodes={tree.children}
        />
      ))}
    </div>
  );
} 