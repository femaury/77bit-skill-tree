import { SkillNode as SkillNodeComponent } from './SkillNode';
import { SkillNode, SkillTreeData } from '../types';

interface HubProps {
  hub: SkillNode;
  allNodes: SkillTreeData['children'];
}

export function Hub({ hub, allNodes }: HubProps) {
  const isDefaultSkills = hub.children?.some(childId => 
    allNodes[childId]?.type === 'DefaultSkills'
  );

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
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-blue-500/20 rounded-lg px-4 py-2 text-blue-400 font-medium">
          Points to unlock: {hub.pointsToUnlock || 0}
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