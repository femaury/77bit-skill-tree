import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons';
import { SkillTrees } from '../types';

interface TreeSelectProps {
  trees: SkillTrees;
  value: keyof SkillTrees;
  onValueChange: (value: keyof SkillTrees) => void;
}

export function TreeSelect({ trees, value, onValueChange }: TreeSelectProps) {
  return (
    <Select.Root value={String(value)} onValueChange={onValueChange}>
      <Select.Trigger
        className="inline-flex items-center justify-between rounded-lg px-6 py-2 text-sm
                   bg-gray-800 border-2 border-blue-500/20 w-full max-w-md
                   focus:outline-none focus:border-blue-500/40 transition-colors
                   hover:border-blue-500/30"
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="overflow-hidden bg-gray-800 border border-gray-700 rounded-lg shadow-xl
                     animate-fadein fadein-0 zoomin-95"
        >
          <Select.Viewport className="p-1">
            {Object.keys(trees).map((treeId) => (
              <Select.Item
                key={treeId}
                value={treeId}
                className="relative flex items-center px-8 py-2 text-sm text-gray-300
                          rounded-md hover:bg-gray-700 cursor-pointer
                          data-[highlighted]:bg-gray-700 data-[highlighted]:outline-none"
              >
                <Select.ItemText>{treeId}</Select.ItemText>
                <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <CheckIcon className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
} 