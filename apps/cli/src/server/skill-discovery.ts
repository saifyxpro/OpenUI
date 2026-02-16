import { readdir, readFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { homedir } from 'node:os';
import { existsSync } from 'node:fs';
import { log } from '../utils/logger.js';

export interface DiscoveredSkill {
  name: string;
  description: string;
  source: 'workspace' | 'global';
}

const SKILL_METADATA_FILE = 'SKILL.md';

async function parseSkillMetadata(
  skillDir: string,
  skillName: string,
  source: 'workspace' | 'global',
): Promise<DiscoveredSkill | null> {
  const metadataPath = resolve(skillDir, SKILL_METADATA_FILE);

  try {
    const content = await readFile(metadataPath, 'utf-8');

    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let description = skillName;

    if (frontmatterMatch?.[1]) {
      const lines = frontmatterMatch[1].split('\n');
      const descLineIdx = lines.findIndex((l) => l.startsWith('description:'));

      if (descLineIdx !== -1) {
        const descLine = lines[descLineIdx] ?? '';
        const inlineValue = descLine.replace('description:', '').trim();

        if (inlineValue === '>' || inlineValue === '|') {
          const continuationLines: string[] = [];
          for (let i = descLineIdx + 1; i < lines.length; i++) {
            const line = lines[i] ?? '';
            const isIndented = line.startsWith('  ') || line.startsWith('\t');
            const isBlank = line.trim() === '';

            if (isIndented) {
              continuationLines.push(line.trim());
            } else if (isBlank) {
              continuationLines.push('');
            } else {
              break;
            }
          }
          const MAX_DESC_LENGTH = 200;
          const joined = continuationLines
            .join(inlineValue === '>' ? ' ' : '\n')
            .trim()
            .replace(/\s+/g, ' ');
          description = joined.length > MAX_DESC_LENGTH
            ? `${joined.slice(0, MAX_DESC_LENGTH)}...`
            : joined;
        } else if (inlineValue) {
          description = inlineValue.replace(/^['"]|['"]$/g, '');
        }
      }
    }

    return { name: skillName, description, source };
  } catch {
    return { name: skillName, description: skillName, source };
  }
}

async function scanSkillsDirectory(
  dirPath: string,
  source: 'workspace' | 'global',
): Promise<DiscoveredSkill[]> {
  if (!existsSync(dirPath)) return [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const skillDirs = entries.filter((entry) => entry.isDirectory());

    const skills = await Promise.all(
      skillDirs.map((entry) =>
        parseSkillMetadata(
          resolve(dirPath, entry.name),
          entry.name,
          source,
        ),
      ),
    );

    return skills.filter(
      (skill): skill is DiscoveredSkill => skill !== null,
    );
  } catch (error) {
    log.debug(`Failed to scan skills directory ${dirPath}: ${error}`);
    return [];
  }
}

export async function discoverSkills(
  workspaceDir: string,
): Promise<DiscoveredSkill[]> {
  const workspaceSkillsPath = resolve(workspaceDir, '.agents', 'skills');
  const globalSkillsPath = resolve(homedir(), '.agents', 'skills');

  const [workspaceSkills, globalSkills] = await Promise.all([
    scanSkillsDirectory(workspaceSkillsPath, 'workspace'),
    scanSkillsDirectory(globalSkillsPath, 'global'),
  ]);

  const seen = new Set<string>();
  const merged: DiscoveredSkill[] = [];

  for (const skill of workspaceSkills) {
    seen.add(skill.name);
    merged.push(skill);
  }

  for (const skill of globalSkills) {
    if (!seen.has(skill.name)) {
      merged.push(skill);
    }
  }

  return merged;
}
