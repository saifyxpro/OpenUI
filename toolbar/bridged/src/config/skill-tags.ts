export interface SkillTag {
  name: string;
  description: string;
  source: 'workspace' | 'global';
}

const SKILL_MENTION_PREFIX = '@skill:';

let cachedSkills: SkillTag[] | null = null;
let fetchPromise: Promise<SkillTag[]> | null = null;

async function fetchSkillsFromServer(): Promise<SkillTag[]> {
  try {
    const response = await fetch('/openui-toolbar-app/api/skills');
    if (!response.ok) return [];
    const data = await response.json();
    return (data.skills ?? []) as SkillTag[];
  } catch {
    return [];
  }
}

export async function getAvailableSkills(): Promise<SkillTag[]> {
  if (cachedSkills) return cachedSkills;

  if (!fetchPromise) {
    fetchPromise = fetchSkillsFromServer().then((skills) => {
      cachedSkills = skills;
      fetchPromise = null;
      return skills;
    });
  }

  return fetchPromise;
}

export function invalidateSkillsCache(): void {
  cachedSkills = null;
  fetchPromise = null;
}

export function filterSkills(query: string, skills: SkillTag[]): SkillTag[] {
  const stripped = query.toLowerCase().replace(/^skill:/, '');
  if (!stripped) return skills;

  return skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(stripped) ||
      skill.description.toLowerCase().includes(stripped),
  );
}

export function extractSkillMentions(text: string): string[] {
  const mentionRegex = new RegExp(
    `${SKILL_MENTION_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\w-]+)`,
    'g',
  );
  const mentions: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

export function stripSkillMentions(text: string): string {
  const mentionRegex = new RegExp(
    `${SKILL_MENTION_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\w-]+`,
    'g',
  );
  return text.replace(mentionRegex, '').replace(/\s+/g, ' ').trim();
}

export { SKILL_MENTION_PREFIX };
