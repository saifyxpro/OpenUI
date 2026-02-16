import { useState, useCallback, useMemo, useEffect } from 'react';
import { Textarea } from '@headlessui/react';
import { TextSlideshow } from '@/components/ui/text-slideshow';
import { cn } from '@/utils';
import {
  type SkillTag,
  filterSkills,
  getAvailableSkills,
  SKILL_MENTION_PREFIX,
} from '@/config/skill-tags';
import { SkillMentionPopup } from './skill-mention-popup';

interface ChatInputAreaProps {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  disabled: boolean;
}

interface MentionState {
  active: boolean;
  query: string;
  startIndex: number;
}

const INACTIVE_MENTION: MentionState = { active: false, query: '', startIndex: -1 };

function detectMention(text: string, cursorPos: number): MentionState {
  const before = text.slice(0, cursorPos);
  const atIdx = before.lastIndexOf('@');

  if (atIdx === -1) return INACTIVE_MENTION;
  if (atIdx > 0 && before[atIdx - 1] !== ' ') return INACTIVE_MENTION;

  const afterAt = before.slice(atIdx + 1);
  if (afterAt.includes(' ')) return INACTIVE_MENTION;

  return { active: true, query: afterAt, startIndex: atIdx };
}

export function ChatInputArea({
  inputRef,
  value,
  onChange,
  onFocus,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  disabled,
}: ChatInputAreaProps) {
  const [skills, setSkills] = useState<SkillTag[]>([]);
  const [mention, setMention] = useState<MentionState>(INACTIVE_MENTION);
  const [popupIndex, setPopupIndex] = useState(0);

  useEffect(() => {
    getAvailableSkills().then(setSkills);
  }, []);

  const filtered = useMemo(
    () => filterSkills(mention.query, skills),
    [mention.query, skills],
  );

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
      const cursor = inputRef.current?.selectionStart ?? newValue.length;
      const m = detectMention(newValue, cursor);
      setMention(m);
      if (m.active) setPopupIndex(0);
    },
    [onChange, inputRef],
  );

  const selectSkill = useCallback(
    (skill: SkillTag) => {
      const before = value.slice(0, mention.startIndex);
      const after = value.slice(mention.startIndex + 1 + mention.query.length);
      const tag = `${SKILL_MENTION_PREFIX}${skill.name}`;
      const newValue = `${before}${tag} ${after}`;
      onChange(newValue);
      setMention(INACTIVE_MENTION);
      setPopupIndex(0);

      requestAnimationFrame(() => {
        if (inputRef.current) {
          const pos = before.length + tag.length + 1;
          inputRef.current.selectionStart = pos;
          inputRef.current.selectionEnd = pos;
          inputRef.current.focus();
        }
      });
    },
    [value, mention, onChange, inputRef],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (mention.active && filtered.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setPopupIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setPopupIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          selectSkill(filtered[popupIndex]);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setMention(INACTIVE_MENTION);
          return;
        }
      }
      onKeyDown(e);
    },
    [mention.active, filtered, popupIndex, selectSkill, onKeyDown],
  );

  return (
    <div className="relative w-full">
      <SkillMentionPopup
        query={mention.query}
        selectedIndex={popupIndex}
        onSelect={selectSkill}
        visible={mention.active}
        skills={skills}
      />
      <Textarea
        ref={inputRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        disabled={disabled}
        className="m-1 h-16 w-full resize-none focus:outline-none"
      />
      <div className="pointer-events-none absolute inset-0 z-10 p-1">
        <TextSlideshow
          className={cn(
            'text-foreground/40 text-sm',
            value.length !== 0 && 'opacity-0',
          )}
          texts={[
            'Try: @skill:ui-ux-design-pro redesign the header',
            'Try: Add a new button into the top right corner',
            'Try: @skill:responsive make this layout adaptive',
          ]}
        />
      </div>
    </div>
  );
}
