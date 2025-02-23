export interface Skill {
    id: string;
    name: string;
    description: string;
    slot: string;
    maxLevel: number;
    levelDescriptions: {
        [key: string]: Array<{
            key: string;
            value: string;
        }>;
    };
}

export interface SkillNode {
    id: string;
    type: string;
    pointsToUnlock?: number;
    nextHubNode?: string;
    parent?: string;
    children?: string[];
    skills?: Skill[];
}

export interface SkillTreeData {
    startHubId: string;
    children: Record<string, SkillNode>;
}

export interface SkillTrees {
    [key: string]: SkillTreeData;
} 