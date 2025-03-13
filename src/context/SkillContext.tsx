import { createContext, useContext, useState, ReactNode } from 'react';
import { Skill } from '../types';

interface SkillPoints {
  [skillId: string]: number;
}

interface SkillContextType {
  skillPoints: SkillPoints;
  addSkillPoint: (skillId: string) => void;
  removeSkillPoint: (skillId: string) => void;
  getSkillLevel: (skillId: string) => number;
  totalSpentPoints: number;
  playerLevel: number;
  maxPlayerLevel: number;
  remainingPoints: number;
  selectedSkillsInNodes: Record<string, string>;
  selectSkillInNode: (nodeId: string, skillId: string) => void;
  isSkillDisabled: (nodeId: string, skillId: string) => boolean;
  resetAllSkills: () => void;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

export function SkillProvider({ children }: { children: ReactNode }) {
  const [skillPoints, setSkillPoints] = useState<SkillPoints>({});
  const [selectedSkillsInNodes, setSelectedSkillsInNodes] = useState<Record<string, string>>({});
  
  const maxPlayerLevel = 30;
  // Calculate total spent points from user-allocated skill points
  const totalSpentPoints = Object.values(skillPoints).reduce((sum, points) => sum + points, 0);
  const playerLevel = Math.min(totalSpentPoints + 1, maxPlayerLevel);
  const remainingPoints = maxPlayerLevel - playerLevel;

  const addSkillPoint = (skillId: string) => {
    setSkillPoints(prev => {
      const currentPoints = prev[skillId] || 0;
      // Don't add more points if we've reached the max player level or max skill level
      if (totalSpentPoints >= maxPlayerLevel - 1) {
        return prev;
      }
      return {
        ...prev,
        [skillId]: currentPoints + 1
      };
    });
  };

  const removeSkillPoint = (skillId: string) => {
    setSkillPoints(prev => {
      const currentPoints = prev[skillId] || 0;
      if (currentPoints <= 0) {
        return prev;
      }
      
      const newPoints = { ...prev };
      newPoints[skillId] = currentPoints - 1;
      
      // If points are reduced to 0, remove the skill from the selected skills in nodes
      if (newPoints[skillId] === 0) {
        const nodeId = Object.entries(selectedSkillsInNodes).find(
          ([, selectedSkillId]) => selectedSkillId === skillId
        )?.[0];
        
        if (nodeId) {
          setSelectedSkillsInNodes(prev => {
            const newSelected = { ...prev };
            delete newSelected[nodeId];
            return newSelected;
          });
        }
      }
      
      return newPoints;
    });
  };

  const getSkillLevel = (skillId: string) => {
    return skillPoints[skillId] || 0;
  };

  const selectSkillInNode = (nodeId: string, skillId: string) => {
    // If this skill is already selected, do nothing
    if (selectedSkillsInNodes[nodeId] === skillId) {
      return;
    }
    
    // If there was a previously selected skill in this node, remove all its points
    const previousSelectedSkillId = selectedSkillsInNodes[nodeId];
    if (previousSelectedSkillId && previousSelectedSkillId !== skillId) {
      setSkillPoints(prev => {
        const newPoints = { ...prev };
        // Remove the previous skill's points completely
        if (previousSelectedSkillId in newPoints) {
          delete newPoints[previousSelectedSkillId];
        }
        return newPoints;
      });
    }
    
    // Update the selected skill for this node
    setSelectedSkillsInNodes(prev => ({
      ...prev,
      [nodeId]: skillId
    }));
  };

  const isSkillDisabled = (nodeId: string, skillId: string) => {
    // If this is a ChooseOneSkill node and another skill is already selected
    const selectedSkillId = selectedSkillsInNodes[nodeId];
    return selectedSkillId !== undefined && selectedSkillId !== skillId;
  };

  const resetAllSkills = () => {
    setSkillPoints({});
    setSelectedSkillsInNodes({});
  };

  return (
    <SkillContext.Provider
      value={{
        skillPoints,
        addSkillPoint,
        removeSkillPoint,
        getSkillLevel,
        totalSpentPoints,
        playerLevel,
        maxPlayerLevel,
        remainingPoints,
        selectedSkillsInNodes,
        selectSkillInNode,
        isSkillDisabled,
        resetAllSkills
      }}
    >
      {children}
    </SkillContext.Provider>
  );
}

export function useSkill() {
  const context = useContext(SkillContext);
  if (context === undefined) {
    throw new Error('useSkill must be used within a SkillProvider');
  }
  return context;
} 