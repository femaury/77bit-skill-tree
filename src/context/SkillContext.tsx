import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SkillTreeData } from '../types';
import * as LZString from 'lz-string';

interface SkillPoints {
  [skillId: string]: number;
}

interface SavedBuild {
  skillPoints: SkillPoints;
  selectedSkillsInNodes: Record<string, string>;
  timestamp: string;
  className: string;
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
  saveBuildToLocalStorage: (buildName: string, className: string) => { exists: boolean };
  loadBuildFromLocalStorage: (buildName: string) => void;
  getSavedBuilds: () => Array<{ name: string; className: string; key: string }>;
  deleteSavedBuild: (buildKey: string) => void;
  exportBuildToURL: () => string;
  importBuildFromURL: (urlData: string) => void;
  currentClass: string;
  setCurrentClass: (className: string) => void;
  buildExists: (buildName: string, className: string) => boolean;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

// Helper function to encode skill points in a more compact format
const encodeSkillPoints = (skillPoints: SkillPoints): string => {
  // Filter out skills with 0 points
  const activeSkills = Object.entries(skillPoints).filter(([_, points]) => points > 0);
  
  if (activeSkills.length === 0) return '';
  
  // Sort by skill ID to ensure consistent encoding
  activeSkills.sort((a, b) => a[0].localeCompare(b[0]));
  
  // Create an ultra-compact string representation: skillId=points,skillId=points,...
  // Using = instead of : as it's more compression-friendly
  return activeSkills.map(([id, points]) => `${id}=${points}`).join(',');
};

// Helper function to decode the compact skill points format
const decodeSkillPoints = (encoded: string): SkillPoints => {
  if (!encoded) return {};
  
  const result: SkillPoints = {};
  encoded.split(',').forEach(pair => {
    const [id, pointsStr] = pair.split('=');
    const points = parseInt(pointsStr, 10);
    if (!isNaN(points) && points > 0) {
      result[id] = points;
    }
  });
  
  return result;
};

// Helper function to encode selected skills in nodes
const encodeSelectedSkills = (selectedSkills: Record<string, string>): string => {
  const entries = Object.entries(selectedSkills);
  if (entries.length === 0) return '';
  
  // Sort by node ID for consistency
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  
  // Create an ultra-compact string: nodeId=skillId,nodeId=skillId,...
  return entries.map(([nodeId, skillId]) => `${nodeId}=${skillId}`).join(',');
};

// Helper function to decode the compact selected skills format
const decodeSelectedSkills = (encoded: string): Record<string, string> => {
  if (!encoded) return {};
  
  const result: Record<string, string> = {};
  encoded.split(',').forEach(pair => {
    const [nodeId, skillId] = pair.split('=');
    if (nodeId && skillId) {
      result[nodeId] = skillId;
    }
  });
  
  return result;
};

// Helper function to decode the build from URL data
const decodeBuild = (urlData: string): { 
  skillPoints: SkillPoints, 
  selectedSkillsInNodes: Record<string, string>,
  className: string 
} => {
  try {
    // Decompress the URL data
    const decompressed = LZString.decompressFromEncodedURIComponent(urlData);
    if (!decompressed) throw new Error('Failed to decompress data');
    
    // Parse the compact format: className|skillPoints|selectedSkills
    // Using | as separator as it compresses better than ~
    const [className, skillPointsStr, selectedSkillsStr] = decompressed.split('|');
    
    return {
      className: className || 'Hacker',
      skillPoints: decodeSkillPoints(skillPointsStr),
      selectedSkillsInNodes: decodeSelectedSkills(selectedSkillsStr)
    };
  } catch (error) {
    console.error('Failed to decode build data:', error);
    return { skillPoints: {}, selectedSkillsInNodes: {}, className: 'Hacker' };
  }
};

export function SkillProvider({ children }: { children: ReactNode }) {
  const [skillPoints, setSkillPoints] = useState<SkillPoints>({});
  const [selectedSkillsInNodes, setSelectedSkillsInNodes] = useState<Record<string, string>>({});
  const [currentClass, setCurrentClass] = useState<string>('Hacker');
  
  const maxPlayerLevel = 30;
  // Calculate total spent points from user-allocated skill points
  const totalSpentPoints = Object.values(skillPoints).reduce((sum, points) => sum + points, 0);
  const playerLevel = Math.min(totalSpentPoints + 1, maxPlayerLevel);
  const remainingPoints = maxPlayerLevel - playerLevel;

  // Function to properly set the current class and reset skills
  const changeClass = (className: string) => {
    // Reset all skills and selections when changing class
    setSkillPoints({});
    setSelectedSkillsInNodes({});
    setCurrentClass(className);
  };

  // Check URL for build data on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    // Only check for the new short parameter 'b'
    const buildData = urlParams.get('b');
    
    if (buildData) {
      try {
        const { skillPoints: importedSkillPoints, selectedSkillsInNodes: importedSelectedSkills, className } = decodeBuild(buildData);
        
        // First set the class
        setCurrentClass(className);
        
        // Then set the skills in the next tick
        setTimeout(() => {
          setSkillPoints(importedSkillPoints);
          setSelectedSkillsInNodes(importedSelectedSkills);
          
          // Clear the URL after loading the build
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, '', newUrl);
        }, 0);
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

  const saveBuildToLocalStorage = (buildName: string, className: string) => {
    try {
      // Get existing builds or initialize empty object
      const savedBuilds = JSON.parse(localStorage.getItem('skillTreeBuilds') || '{}');
      
      // Create class-specific key to allow same name across different classes
      const buildKey = `${className}:${buildName}`;
      
      // Save current build state
      savedBuilds[buildKey] = {
        skillPoints,
        selectedSkillsInNodes,
        timestamp: new Date().toISOString(),
        className
      };
      
      // Save back to localStorage
      localStorage.setItem('skillTreeBuilds', JSON.stringify(savedBuilds));
      
      return { exists: false }; // Return existence status for UI handling
    } catch (error) {
      console.error('Failed to save build to localStorage:', error);
      return { exists: false };
    }
  };

  // Check if a build exists with the given name for the specified class
  const buildExists = (buildName: string, className: string): boolean => {
    try {
      const savedBuilds = JSON.parse(localStorage.getItem('skillTreeBuilds') || '{}');
      const buildKey = `${className}:${buildName}`;
      return !!savedBuilds[buildKey];
    } catch (error) {
      console.error('Failed to check if build exists:', error);
      return false;
    }
  };

  const loadBuildFromLocalStorage = (buildName: string) => {
    try {
      const savedBuilds = JSON.parse(localStorage.getItem('skillTreeBuilds') || '{}');
      
      // First try to load with class-specific key (new format)
      const classSpecificKey = `${currentClass}:${buildName}`;
      let build = savedBuilds[classSpecificKey] as SavedBuild;
      
      // If not found, try the old format for backward compatibility
      if (!build) {
        build = savedBuilds[buildName] as SavedBuild;
      }
      
      if (build) {
        setSkillPoints(build.skillPoints);
        setSelectedSkillsInNodes(build.selectedSkillsInNodes);
        // Don't override current class if using class-specific key
        if (!classSpecificKey && build.className) {
          setCurrentClass(build.className);
        }
      }
    } catch (error) {
      console.error('Failed to load build from localStorage:', error);
    }
  };

  const getSavedBuilds = () => {
    try {
      const savedBuilds = JSON.parse(localStorage.getItem('skillTreeBuilds') || '{}');
      return Object.entries(savedBuilds).map(([key, build]) => {
        const isNewFormat = key.includes(':');
        const name = isNewFormat ? key.split(':', 2)[1] : key;
        const className = (build as SavedBuild).className || 'Unknown';
        return {
          name,
          className,
          key // Return the full key for deletion
        };
      });
    } catch (error) {
      console.error('Failed to get saved builds from localStorage:', error);
      return [];
    }
  };

  const deleteSavedBuild = (buildKey: string) => {
    try {
      const savedBuilds = JSON.parse(localStorage.getItem('skillTreeBuilds') || '{}');
      
      if (savedBuilds[buildKey]) {
        delete savedBuilds[buildKey];
        localStorage.setItem('skillTreeBuilds', JSON.stringify(savedBuilds));
      }
    } catch (error) {
      console.error('Failed to delete build from localStorage:', error);
    }
  };

  const exportBuildToURL = () => {
    try {
      // Use the ultra-compact format
      const skillPointsStr = encodeSkillPoints(skillPoints);
      const selectedSkillsStr = encodeSelectedSkills(selectedSkillsInNodes);
      
      // Format: className|skillPoints|selectedSkills
      // Using | as separator as it compresses better than ~
      const compactData = `${currentClass}|${skillPointsStr}|${selectedSkillsStr}`;
      
      // Use the URL-safe compression method
      const compressed = LZString.compressToEncodedURIComponent(compactData);
      
      // Use a shorter parameter name 'b'
      return `${window.location.origin}${window.location.pathname}?b=${compressed}`;
    } catch (error) {
      console.error('Failed to export build to URL:', error);
      return window.location.href;
    }
  };

  const importBuildFromURL = (urlData: string) => {
    try {
      const { skillPoints: importedSkillPoints, selectedSkillsInNodes: importedSelectedSkills, className } = decodeBuild(urlData);
      
      // First set the class
      setCurrentClass(className);
      
      // Then set the skills
      setTimeout(() => {
        setSkillPoints(importedSkillPoints);
        setSelectedSkillsInNodes(importedSelectedSkills);
      }, 0);
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
        importBuildFromURL,
        currentClass,
        setCurrentClass: changeClass,
        buildExists
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