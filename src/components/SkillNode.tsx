import * as HoverCard from '@radix-ui/react-hover-card';
import { SkillNode as SkillNodeType, Skill } from '../types';
import { useState, useEffect } from 'react';
import { useSkill } from '../context/SkillContext';
import { MinusIcon, LockClosedIcon } from '@radix-ui/react-icons';

interface SkillNodeProps {
  node: SkillNodeType;
  layout?: 'vertical' | 'horizontal';
  isHubLocked?: boolean;
}

export function SkillNode({ node, layout = 'vertical', isHubLocked = false }: SkillNodeProps) {
  const [openSkillId, setOpenSkillId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { 
    getSkillLevel, 
    addSkillPoint, 
    removeSkillPoint, 
    remainingPoints,
    selectSkillInNode,
    isSkillDisabled,
    selectedSkillsInNodes
  } = useSkill();

  // Check if this is a default skill node
  const isDefaultSkill = node.type === 'DefaultSkills';

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

  const handleSkillClick = (skill: Skill, e: React.MouseEvent, isDisabled: boolean) => {
    // If the hub is locked or the skill is disabled, just open/close the hover card
    if (isHubLocked || isDisabled) {
      setOpenSkillId(openSkillId === skill.id ? null : skill.id);
      return;
    }
    
    // Don't add points to default skills
    if (isDefaultSkill) {
      setOpenSkillId(openSkillId === skill.id ? null : skill.id);
      return;
    }

    // If right-click, remove a point
    if (e.button === 2) {
      e.preventDefault();
      removeSkillPoint(skill.id);
      return;
    }

    // For ChooseOneSkill, handle selection and point allocation
    if (node.type === 'ChooseOneSkill') {
      const isCurrentlySelected = selectedSkillsInNodes[node.id] === skill.id;
      const skillLevel = getSkillLevel(skill.id);
      
      // If not selected yet, select it first
      if (!isCurrentlySelected) {
        selectSkillInNode(node.id, skill.id);
        
        // Add a point if we have points to spend and skill has no points yet
        if (remainingPoints > 0 && skillLevel === 0) {
          addSkillPoint(skill.id);
        }
      } 
      // If already selected and can add more points, add a point
      else if (skillLevel < skill.maxLevel && remainingPoints > 0) {
        addSkillPoint(skill.id);
      }
    } else {
      // For other skill types, just add a point if possible
      const skillLevel = getSkillLevel(skill.id);
      if (remainingPoints > 0 && skillLevel < skill.maxLevel) {
        addSkillPoint(skill.id);
      }
    }
    
    setOpenSkillId(openSkillId === skill.id ? null : skill.id);
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
          {node.skills?.map((skill: Skill) => {
            // For default skills, always show as level 1 internally but don't display the level
            const skillLevel = isDefaultSkill ? 1 : getSkillLevel(skill.id);
            const isDisabled = node.type === 'ChooseOneSkill' && isSkillDisabled(node.id, skill.id);
            const isSelected = node.type === 'ChooseOneSkill' && selectedSkillsInNodes[node.id] === skill.id;
            
            return (
              <HoverCard.Root
                key={skill.id}
                openDelay={200}
                closeDelay={100}
                open={openSkillId === skill.id}
                onOpenChange={(open) => setOpenSkillId(open ? skill.id : null)}
              >
                <HoverCard.Trigger asChild>
                  <div 
                    className={`bg-black/50 backdrop-blur-sm rounded-lg p-3 
                              border ${isSelected ? 'border-accent' : 'border-white/20'} 
                              ${(isDisabled || isHubLocked) ? 'cursor-default' : 'cursor-pointer hover:border-accent'}
                              transition-all duration-300
                              touch-manipulation ${isDisabled ? 'opacity-50' : ''} ${isHubLocked ? 'opacity-70' : ''}`}
                    onClick={(e) => handleSkillClick(skill, e, isDisabled)}
                    onContextMenu={(e) => handleSkillClick(skill, e, isDisabled)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setOpenSkillId(skill.id);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-white">{skill.name}</div>
                      {!isDefaultSkill && (
                        <div className="text-sm text-accent">
                          {`${skillLevel}/${skill.maxLevel}`}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-white/60 mt-1">{skill.slot === "none" ? "Passive" : "Active"}</div>
                    {isDisabled && !isHubLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg border border-red-400/30">
                        <LockClosedIcon className="h-6 w-6 text-red-400/80" />
                      </div>
                    )}
                    {isHubLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                        <LockClosedIcon className="h-6 w-6 text-white/60" />
                      </div>
                    )}
                  </div>
                </HoverCard.Trigger>

                <HoverCard.Portal>
                  <HoverCard.Content
                    className="w-100 max-w-[calc(100vw-1rem)] 
                            bg-black/50 backdrop-blur-sm rounded-lg p-4
                              border border-accent/70 shadow-xl z-50"
                    sideOffset={5}
                    side={getHoverCardSide()}
                    align={isMobile ? "center" : "start"}
                  >
                    <div className="space-y-2">
                      <div className="font-medium text-white">{skill.name}</div>
                      <div className="text-sm text-accent">{skill.description}</div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm text-white/60">
                          {isDefaultSkill ? "Default Skill" : (
                            <span className="bg-white/10 rounded px-2 py-1">
                              Level {skillLevel}/{skill.maxLevel}
                            </span>
                          )}
                        </div>
                        {!isDefaultSkill && skillLevel > 0 && !isDisabled && !isHubLocked && (
                          <div className="flex gap-2">
                            <button
                              className="p-1 rounded bg-white/10 hover:bg-white/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSkillPoint(skill.id);
                              }}
                            >
                              <MinusIcon className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {isHubLocked && (
                        <div className="text-xs mt-1">
                          <span className="text-red-400">Locked:</span>
                          <span className="text-white/70"> Spend more skill points to unlock.</span>
                        </div>
                      )}
                      
                      {isDisabled && !isHubLocked && (
                        <div className="text-xs mt-1">
                          <span className="text-red-400">Locked:</span>
                          <span className="text-white/70"> Another skill in this group is already selected.</span>
                        </div>
                      )}
                      
                      {skill.maxLevel > 1 && !isDefaultSkill && (
                        <div className="flex flex-col gap-2 mt-4">
                          <div className="space-y-1">
                            {Object.entries(skill.levelDescriptions).map(([level, descriptions]) => (
                              <div key={level} className="text-sm">
                                <div className={`text-white ${Number(level) <= skillLevel ? 'text-accent' : ''}`}>
                                  Level {level}:
                                </div>
                                {descriptions.map((desc, i) => (
                                  <div key={i} className={`text-white/60 ml-2 ${Number(level) <= skillLevel ? 'text-accent/80' : ''}`}>
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
            );
          })}
        </div>
      </div>
    </div>
  );
} 