import * as HoverCard from '@radix-ui/react-hover-card';
import { SkillNode as SkillNodeType, Skill } from '../types';

interface SkillNodeProps {
  node: SkillNodeType;
  layout?: 'vertical' | 'horizontal';
}

export function SkillNode({ node, layout = 'vertical' }: SkillNodeProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ChooseOneSkill':
        return 'from-purple-500/20 to-pink-500/20 text-purple-400';
      case 'ChooseAnySkills':
        return 'from-green-500/20 to-emerald-500/20 text-green-400';
      case 'DefaultSkills':
        return 'from-yellow-500/20 to-orange-500/20 text-yellow-400';
      default:
        return 'from-gray-500/20 to-gray-400/20 text-gray-400';
    }
  };

  return (
    <div className="relative">
      <div 
        className={`bg-gradient-to-br ${getTypeColor(node.type)} rounded-lg p-4
                   border border-gray-700/50 transition-all duration-300
                   hover:border-gray-600/50`}
      >
        <div className="font-medium mb-3 text-sm">
          {node.type}
        </div>
        
        <div className={`grid gap-2 ${
          layout === 'horizontal' 
            ? 'md:grid-flow-col md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]' 
            : ''
        }`}>
          {node.skills?.map((skill: Skill) => (
            <HoverCard.Root key={skill.id} openDelay={200} closeDelay={100}>
              <HoverCard.Trigger asChild>
                <div 
                  className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 
                            border border-gray-700/50 cursor-pointer
                            hover:border-gray-600/50 transition-all duration-300"
                >
                  <div className="font-medium text-white">{skill.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{skill.slot === "none" ? "Passive" : "Active"}</div>
                </div>
              </HoverCard.Trigger>

              <HoverCard.Portal>
                <HoverCard.Content
                  className="w-100 bg-gray-900/95 backdrop-blur-sm rounded-lg p-4 
                            border border-gray-700/50 shadow-xl
                            data-[state=open]:animate-fadein
                            data-[state=closed]:animate-fadeout
                            data-[state=closed]:fadeout-0
                            data-[state=open]:fadein-0
                            data-[state=closed]:zoomout
                            data-[state=open]:zoomin
                            data-[side=bottom]:slidefromtop
                            data-[side=top]:slidefrombottom
                            data-[side=right]:slidefromleft
                            data-[side=left]:slidefromright"
                  sideOffset={5}
                  side={layout === 'vertical' ? 'right' : 'bottom'}
                >
                  <div className="space-y-2">
                    <div className="font-medium text-blue-400">{skill.name}</div>
                    <div className="text-sm text-gray-300">{skill.description}</div>
                    {skill.maxLevel > 1 && (
                      <div className="flex flex-col gap-2 mt-4">
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span className="bg-gray-800 rounded px-2 py-1">
                            Max Level: {skill.maxLevel}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(skill.levelDescriptions).map(([level, descriptions]) => (
                            <div key={level} className="text-sm">
                              <div className="text-gray-400">Level {level}:</div>
                              {descriptions.map((desc, i) => (
                                <div key={i} className="text-gray-500 ml-2">
                                  • {desc.key}: {desc.value}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <HoverCard.Arrow className="fill-gray-700/50" />
                </HoverCard.Content>
              </HoverCard.Portal>
            </HoverCard.Root>
          ))}
        </div>
      </div>
    </div>
  );
} 