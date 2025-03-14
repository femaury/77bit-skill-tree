import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SkillTreeData } from '../types';

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
  removeSkillPointsForHub: (hubChildNodeIds: string[], allNodes: SkillTreeData['children']) => void;
  saveBuildToLocalStorage: (buildName: string) => void;
  loadBuildFromLocalStorage: (buildName: string) => void;
  getSavedBuilds: () => string[];
  deleteSavedBuild: (buildName: string) => void;
  exportBuildToURL: () => string;
  importBuildFromURL: (urlData: string) => void;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

// Helper functions for encoding/decoding builds
const encodeBuild = (skillPoints: SkillPoints, selectedSkillsInNodes: Record<string, string>): string => {
  const data = { skillPoints, selectedSkillsInNodes };
  return btoa(JSON.stringify(data));
};

const decodeBuild = (encoded: string): { skillPoints: SkillPoints, selectedSkillsInNodes: Record<string, string> } => {
  try {
    return JSON.parse(atob(encoded));
  } catch (error) {
    console.error('Failed to decode build data:', error);
    return { skillPoints: {}, selectedSkillsInNodes: {} };
  }
};

export function SkillProvider({ children }: { children: ReactNode }) {
  const [skillPoints, setSkillPoints] = useState<SkillPoints>({});
  const [selectedSkillsInNodes, setSelectedSkillsInNodes] = useState<Record<string, string>>({});
  
  const maxPlayerLevel = 30;
  // Calculate total spent points from user-allocated skill points
  const totalSpentPoints = Object.values(skillPoints).reduce((sum, points) => sum + points, 0);
  const playerLevel = Math.min(totalSpentPoints + 1, maxPlayerLevel);
  const remainingPoints = maxPlayerLevel - playerLevel;

  // Check URL for build data on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const buildData = urlParams.get('build');
    
    if (buildData) {
      try {
        const { skillPoints: importedSkillPoints, selectedSkillsInNodes: importedSelectedSkills } = decodeBuild(buildData);
        setSkillPoints(importedSkillPoints);
        setSelectedSkillsInNodes(importedSelectedSkills);
        
        // Clear the URL after loading the build
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      } catch (error) {
        console.error('Failed to import build from URL:', error);
      }
    }
  }, []);

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

  // Function to remove all skill points from skills in a locked hub
  const removeSkillPointsForHub = (hubChildNodeIds: string[], allNodes: SkillTreeData['children']) => {
    // Create a set of all skill IDs in this hub
    const skillIdsInHub = new Set<string>();
    
    // Collect all skill IDs from the hub's child nodes
    hubChildNodeIds.forEach(nodeId => {
      const node = allNodes[nodeId];
      if (node && node.skills) {
        node.skills.forEach((skill) => {
          skillIdsInHub.add(skill.id);
        });
      }
    });
    
    // Remove points from all skills in this hub
    setSkillPoints(prev => {
      const newPoints = { ...prev };
      
      // Remove points for each skill in the hub
      skillIdsInHub.forEach(skillId => {
        if (skillId in newPoints) {
          delete newPoints[skillId];
        }
      });
      
      return newPoints;
    });
    
    // Remove selected skills in nodes for this hub
    setSelectedSkillsInNodes(prev => {
      const newSelected = { ...prev };
      
      // Remove selections for each node in the hub
      hubChildNodeIds.forEach(nodeId => {
        if (nodeId in newSelected) {
          delete newSelected[nodeId];
        }
      });
      
      return newSelected;
    });
  };

  const saveBuildToLocalStorage = (buildName: string) => {
    try {
      // Get existing builds or initialize empty object
      const savedBuilds = JSON.parse(localStorage.getItem('skillTreeBuilds') || '{}');
      
      // Save current build state
      savedBuilds[buildName] = {
        skillPoints,
        selectedSkillsInNodes,
        timestamp: new Date().toISOString()
      };
      
      // Save back to localStorage
      localStorage.setItem('skillTreeBuilds', JSON.stringify(savedBuilds));
    } catch (error) {
      console.error('Failed to save build to localStorage:', error);
    }
  };

  const loadBuildFromLocalStorage = (buildName: string) => {
    try {
      const savedBuilds = JSON.parse(localStorage.getItem('skillTreeBuilds') || '{}');
      const build = savedBuilds[buildName];
      
      if (build) {
        setSkillPoints(build.skillPoints);
        setSelectedSkillsInNodes(build.selectedSkillsInNodes);
      }
    } catch (error) {
      console.error('Failed to load build from localStorage:', error);
    }
  };

  const getSavedBuilds = () => {
    try {
      const savedBuilds = JSON.parse(localStorage.getItem('skillTreeBuilds') || '{}');
      return Object.keys(savedBuilds);
    } catch (error) {
      console.error('Failed to get saved builds from localStorage:', error);
      return [];
    }
  };

  const deleteSavedBuild = (buildName: string) => {
    try {
      const savedBuilds = JSON.parse(localStorage.getItem('skillTreeBuilds') || '{}');
      
      if (savedBuilds[buildName]) {
        delete savedBuilds[buildName];
        localStorage.setItem('skillTreeBuilds', JSON.stringify(savedBuilds));
      }
    } catch (error) {
      console.error('Failed to delete build from localStorage:', error);
    }
  };

  const exportBuildToURL = () => {
    try {
      const encodedBuild = encodeBuild(skillPoints, selectedSkillsInNodes);
      return `${window.location.origin}${window.location.pathname}?build=${encodedBuild}`;
    } catch (error) {
      console.error('Failed to export build to URL:', error);
      return window.location.href;
    }
  };

  const importBuildFromURL = (urlData: string) => {
    try {
      const { skillPoints: importedSkillPoints, selectedSkillsInNodes: importedSelectedSkills } = decodeBuild(urlData);
      setSkillPoints(importedSkillPoints);
      setSelectedSkillsInNodes(importedSelectedSkills);
    } catch (error) {
      console.error('Failed to import build from URL data:', error);
    }
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
        resetAllSkills,
        removeSkillPointsForHub,
        saveBuildToLocalStorage,
        loadBuildFromLocalStorage,
        getSavedBuilds,
        deleteSavedBuild,
        exportBuildToURL,
        importBuildFromURL
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