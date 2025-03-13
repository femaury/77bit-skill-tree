import * as Select from '@radix-ui/react-select';
import * as HoverCard from '@radix-ui/react-hover-card';
import { ChevronDownIcon, CheckIcon, ResetIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { SkillTrees } from '../types';
import { useSkill } from '../context/SkillContext';

interface SkillTreeHeaderProps {
  trees: SkillTrees;
  value: keyof SkillTrees;
  onValueChange: (value: keyof SkillTrees) => void;
}

export function SkillTreeHeader({ trees, value, onValueChange }: SkillTreeHeaderProps) {
  const { playerLevel, maxPlayerLevel, resetAllSkills } = useSkill();
  
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <Select.Root value={String(value)} onValueChange={onValueChange}>
            <Select.Trigger
              className="inline-flex items-center justify-between rounded-lg px-6 py-2 text-sm
                       bg-black/10 border-2 border-accent/50 w-full md:w-auto min-w-[280px]
                       focus:outline-none focus:border-accent transition-colors
                       hover:border-accent/80 cursor-pointer"
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDownIcon className="h-4 w-4 text-accent" />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content
                className="overflow-hidden bg-black/50 backdrop-blur-sm border border-accent rounded-lg shadow-xl
                         animate-fadein fadein-0 zoomin-95 z-50"
              >
                <Select.Viewport className="p-1">
                  {Object.keys(trees).map((treeId) => (
                    <Select.Item
                      key={treeId}
                      value={treeId}
                      className="relative flex items-center px-8 py-2 text-sm text-white
                              rounded-md hover:bg-white/20 cursor-pointer
                              data-[highlighted]:bg-white/20 data-[highlighted]:outline-none"
                    >
                      <Select.ItemText>{treeId}</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                        <CheckIcon className="h-4 w-4 text-accent" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        
        <div className="flex justify-between sm:justify-start items-center gap-3">
          <HoverCard.Root openDelay={200} closeDelay={100}>
            <HoverCard.Trigger asChild>
              <button className="bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors cursor-pointer">
                <InfoCircledIcon className="h-5 w-5" />
              </button>
            </HoverCard.Trigger>
            <HoverCard.Portal>
              <HoverCard.Content
                className="w-80 max-w-[calc(100vw-1rem)] 
                        bg-black/50 backdrop-blur-sm rounded-lg p-4
                        border border-accent/70 shadow-xl z-50"
                sideOffset={5}
                align="center"
              >
                <div className="text-sm text-white/80 space-y-2">
                  <p>Each skill point spent increases your level. Default skills don't count toward your level.</p>
                  <p>Left-click on skills to add points, right-click to remove points.</p>
                  <p>For "Choose One Skill" nodes, you can only select one skill to level up. Remove all points from a skill to select another.</p>
                </div>
                <HoverCard.Arrow className="fill-accent/70" />
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>
          
          <div className="bg-accent/20 rounded-lg px-4 py-2 text-white font-medium text-xs sm:text-sm">
            Level: {playerLevel}/{maxPlayerLevel}
          </div>
          
          <button 
            className="bg-red-500/20 hover:bg-red-500/30 rounded-lg px-4 py-2 text-white font-medium flex items-center gap-2 transition-colors text-xs sm:text-sm cursor-pointer"
            onClick={resetAllSkills}
          >
            <ResetIcon className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
} 