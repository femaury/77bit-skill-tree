import * as HoverCard from '@radix-ui/react-hover-card';
import { SkillNode as SkillNodeType, Skill } from '../types';
import { useState, useEffect } from 'react';

interface SkillNodeProps {
  node: SkillNodeType;
  layout?: 'vertical' | 'horizontal';
}

export function SkillNode({ node, layout = 'vertical' }: SkillNodeProps) {
  const [openSkillId, setOpenSkillId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ChooseOneSkill':
        return 'from-white/10 to-accent/20 text-white';
      case 'ChooseAnySkills':
        return 'from-secondary/20 to-white/10 text-white';
      case 'DefaultSkills':
        return 'from-white/10 to-white/20 text-white';
      default:
        return 'from-white/5 to-white/10 text-white/60';
    }
  };

  const getHoverCardSide = () => {
    if (isMobile) return 'bottom';
    return layout === 'vertical' ? 'right' : 'bottom';
  };

  return (
    <div className="relative">
      <div 
        className={`bg-gradient-to-br ${getTypeColor(node.type)} rounded-lg p-4
                   border border-white/20 transition-all duration-300
                   hover:border-white/40`}
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
            <HoverCard.Root
              key={skill.id}
              openDelay={200}
              closeDelay={100}
              open={openSkillId === skill.id}
              onOpenChange={(open) => setOpenSkillId(open ? skill.id : null)}
            >
              <HoverCard.Trigger asChild>
                <div 
                  className="bg-black/50 backdrop-blur-sm rounded-lg p-3 
                            border border-white/20 cursor-pointer
                            hover:border-accent transition-all duration-300
                            touch-manipulation"
                  onClick={() => setOpenSkillId(openSkillId === skill.id ? null : skill.id)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setOpenSkillId(skill.id);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="font-medium text-white">{skill.name}</div>
                  <div className="text-sm text-white/60 mt-1">{skill.slot === "none" ? "Passive" : "Active"}</div>
                </div>
              </HoverCard.Trigger>

              <HoverCard.Portal>
                <HoverCard.Content
                  className="w-100 max-w-[calc(100vw-1rem)] 
                          bg-black/50 backdrop-blur-sm rounded-lg p-4
                            border border-accent/70 shadow-xl"
                  sideOffset={5}
                  side={getHoverCardSide()}
                  align={isMobile ? "center" : "start"}
                >
                  <div className="space-y-2">
                    <div className="font-medium text-white">{skill.name}</div>
                    <div className="text-sm text-accent">{skill.description}</div>
                    {skill.maxLevel > 1 && (
                      <div className="flex flex-col gap-2 mt-4">
                        <div className="text-sm text-white/60 flex items-center gap-2">
                          <span className="bg-white/10 rounded px-2 py-1">
                            Max Level: {skill.maxLevel}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(skill.levelDescriptions).map(([level, descriptions]) => (
                            <div key={level} className="text-sm">
                              <div className="text-white">Level {level}:</div>
                              {descriptions.map((desc, i) => (
                                <div key={i} className="text-white/60 ml-2">
                                  • {desc.key}: {desc.value}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <HoverCard.Arrow className="fill-accent/70" />
                </HoverCard.Content>
              </HoverCard.Portal>
            </HoverCard.Root>
          ))}
        </div>
      </div>
    </div>
  );
} 