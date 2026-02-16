import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HotkeyComboText } from '@/components/hotkey-combo-text';
import { HotkeyActions } from '@/utils';
import { cn } from '@/utils';
import {
  ArrowUpIcon,
  CopyIcon,
  CheckIcon,
  MousePointerIcon,
} from 'lucide-react';

interface ChatActionButtonsProps {
  isPromptCreationActive: boolean;
  isContextSelectorActive: boolean;
  onToggleContextSelector: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  connected: boolean;
  canSendMessage: boolean;
  chatInputTrimmed: boolean;
  isCopied: boolean;
  onCopy: () => void;
  onSubmit: () => void;
}

export function ChatActionButtons({
  isPromptCreationActive,
  isContextSelectorActive,
  onToggleContextSelector,
  inputRef,
  connected,
  canSendMessage,
  chatInputTrimmed,
  isCopied,
  onCopy,
  onSubmit,
}: ChatActionButtonsProps) {
  return (
    <div className="flex shrink-0 flex-row gap-2">
      {isPromptCreationActive && (
        <Tooltip>
          <TooltipTrigger>
            <Button
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleContextSelector();
                inputRef.current?.focus();
              }}
              aria-label="Select context elements"
              variant="ghost"
              className={cn(
                'size-8 cursor-pointer rounded-full border-none bg-transparent p-1 backdrop-blur-lg',
                isContextSelectorActive
                  ? 'bg-blue-600/10 text-blue-600'
                  : 'text-zinc-500 opacity-70',
              )}
            >
              <MousePointerIcon className={'size-4'} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isContextSelectorActive ? (
              <>
                Stop selecting elements (
                <HotkeyComboText action={HotkeyActions.ESC} />)
              </>
            ) : (
              <>
                Add reference elements (
                <HotkeyComboText action={HotkeyActions.CTRL_ALT_PERIOD} />
                )
              </>
            )}
          </TooltipContent>
        </Tooltip>
      )}
      {!connected && (
        <Button
          disabled={!chatInputTrimmed && !isCopied}
          onClick={onCopy}
          glassy
          variant="primary"
          className="h-8 cursor-pointer"
        >
          <div
            className={cn(
              'flex items-center justify-center gap-2 transition-all duration-300 ease-out',
            )}
          >
            <div>{isCopied ? 'Copied' : 'Copy'}</div>
            {isCopied ? (
              <CheckIcon className="size-4" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </div>
        </Button>
      )}
      {connected && (
        <Button
          disabled={!canSendMessage}
          onClick={onSubmit}
          glassy
          variant="primary"
          className="size-8 cursor-pointer rounded-full p-1"
        >
          <ArrowUpIcon className="size-4 stroke-3" />
        </Button>
      )}
    </div>
  );
}
