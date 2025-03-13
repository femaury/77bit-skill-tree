import { SkillNode as SkillNodeComponent } from './SkillNode';
import { SkillNode, SkillTreeData } from '../types';
import { useSkill } from '../context/SkillContext';

interface HubProps {
  hub: SkillNode;
  allNodes: SkillTreeData['children'];
}

export function Hub({ hub, allNodes }: HubProps) {
  const { totalSpentPoints } = useSkill();
  const isDefaultSkills = hub.children?.some(childId => 
    allNodes[childId]?.type === 'DefaultSkills'
  );

  // Check if this hub is locked based on points to unlock
  const isLocked = hub.pointsToUnlock !== undefined && totalSpentPoints < hub.pointsToUnlock;

  if (isDefaultSkills) {
    return (
      <div>
        {hub.children?.map((childId) => {
          const childNode = allNodes[childId];
          return (
            <SkillNodeComponent 
              key={childId}
              node={childNode}
              layout="horizontal"
            />
          );
        })}
      </div>
    )
  }

  return (
    <div className={`bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg 
                    ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-6 flex items-center gap-3">
        <div className={`rounded-lg px-4 py-2 text-white font-medium 
                        ${isLocked ? 'bg-red-500/20' : 'bg-white/10'}`}>
          {isLocked ? 'Locked - ' : ''}Points to unlock: {hub.pointsToUnlock || 0}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hub.children?.sort((a) => {
          const aNode = allNodes[a];
          return aNode.skills?.[0].slot === "none" ? 1 : -1;
        }).map((childId) => {
          const childNode = allNodes[childId];
          return (
            <SkillNodeComponent 
              key={childId}
              node={childNode}
            />
          );
        })}
      </div>
    </div>
  );
} 