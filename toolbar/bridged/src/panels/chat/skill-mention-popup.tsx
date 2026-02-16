import { useEffect, useRef } from 'react';
import { FolderOpen, Globe } from 'lucide-react';
import { type SkillTag, filterSkills } from '@/config/skill-tags';
import { cn } from '@/utils';


interface SkillMentionPopupProps {
  query: string;
  selectedIndex: number;
  onSelect: (skill: SkillTag) => void;
  visible: boolean;
  skills: SkillTag[];
}

export function SkillMentionPopup({
  query,
  selectedIndex,
  onSelect,
  visible,
  skills,
}: SkillMentionPopupProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const filteredSkills = filterSkills(query, skills);

  useEffect(() => {
    if (!listRef.current) return;
    const selectedItem = listRef.current.children[selectedIndex + 1] as HTMLElement;
    selectedItem?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!visible || filteredSkills.length === 0) return null;

  return (
    <div
      ref={listRef}
      className="absolute bottom-full left-0 z-50 mb-1 max-h-52 w-72 overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-black/15 scrollbar-track-transparent rounded-xl border border-zinc-200 bg-white p-1 shadow-black/10 shadow-xl"
    >
      <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-foreground/40 uppercase">
        Agent Skills
      </div>
      {filteredSkills.map((skill, index) => (
        <button
          key={skill.name}
          type="button"
          onClick={() => onSelect(skill)}
          className={cn(
            'relative flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2 py-2 text-left',
            'outline-none transition-colors duration-150',
            index === selectedIndex
              ? 'bg-blue-600 text-white'
              : 'text-foreground/80 hover:bg-zinc-100/80',
          )}
        >
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-md',
              index === selectedIndex ? 'text-white/80' : 'text-foreground/50',
            )}
          >
            {skill.source === 'workspace' ? (
              <FolderOpen className="size-3.5" />
            ) : (
              <Globe className="size-3.5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium">
              {skill.name}
            </div>
            {skill.description && skill.description !== skill.name && (
              <div
                className={cn(
                  'truncate text-[10px]',
                  index === selectedIndex ? 'text-white/70' : 'text-foreground/40',
                )}
              >
                {skill.description}
              </div>
            )}
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 py-0.5 text-[9px]',
              index === selectedIndex
                ? 'bg-blue-500/40 text-white/80'
                : 'bg-zinc-100 text-foreground/40',
            )}
          >
            {skill.source}
          </span>
        </button>
      ))}
    </div>
  );
}
