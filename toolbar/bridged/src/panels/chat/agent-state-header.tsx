import { PanelHeader } from '@/components/ui/panel';
import { cn } from '@/utils';
import { AgentStateType } from '@openui-xio/agent-interface/toolbar';
import {
  Loader2Icon,
  MessageCircleQuestionIcon,
  XCircleIcon,
  CheckIcon,
  CogIcon,
} from 'lucide-react';
import {
  GradientBackgroundChat,
  type GradientBackgroundVariant,
} from '@/components/ui/gradient-background-chat';

const AGENT_STATE_TEXT: Record<AgentStateType, string> = {
  [AgentStateType.WAITING_FOR_USER_RESPONSE]: 'Waiting for user response',
  [AgentStateType.IDLE]: '',
  [AgentStateType.THINKING]: 'Thinking',
  [AgentStateType.FAILED]: 'Failed',
  [AgentStateType.COMPLETED]: 'Completed',
  [AgentStateType.WORKING]: 'Working',
  [AgentStateType.CALLING_TOOL]: 'Calling tool',
};

const AGENT_STATE_ICONS: Record<AgentStateType, React.ReactNode> = {
  [AgentStateType.WAITING_FOR_USER_RESPONSE]: (
    <MessageCircleQuestionIcon className="size-6" />
  ),
  [AgentStateType.IDLE]: <></>,
  [AgentStateType.THINKING]: (
    <Loader2Icon className="size-6 animate-spin stroke-violet-600" />
  ),
  [AgentStateType.FAILED]: <XCircleIcon className="size-6 stroke-rose-600" />,
  [AgentStateType.COMPLETED]: (
    <CheckIcon className="size-6 stroke-green-600" />
  ),
  [AgentStateType.WORKING]: (
    <Loader2Icon className="size-6 animate-spin stroke-blue-600" />
  ),
  [AgentStateType.CALLING_TOOL]: (
    <CogIcon className="size-6 animate-spin stroke-fuchsia-700" />
  ),
};

const GRADIENT_VARIANTS: Record<AgentStateType, GradientBackgroundVariant> = {
  [AgentStateType.WAITING_FOR_USER_RESPONSE]: {
    activeSpeed: 'slow',
    backgroundColor: 'var(--color-blue-200)',
    colors: [
      'var(--color-blue-200)',
      'var(--color-indigo-400)',
      'var(--color-sky-100)',
      'var(--color-cyan-200)',
    ],
  },
  [AgentStateType.IDLE]: {
    activeSpeed: 'slow',
    backgroundColor: 'var(--color-white/0)',
    colors: [
      'var(--color-white/0)',
      'var(--color-white/0)',
      'var(--color-white/0)',
      'var(--color-white/0)',
    ],
  },
  [AgentStateType.THINKING]: {
    activeSpeed: 'medium',
    backgroundColor: 'var(--color-blue-400)',
    colors: [
      'var(--color-orange-300)',
      'var(--color-teal-300)',
      'var(--color-fuchsia-400)',
      'var(--color-indigo-200)',
    ],
  },
  [AgentStateType.WORKING]: {
    activeSpeed: 'medium',
    backgroundColor: 'var(--color-indigo-400)',
    colors: [
      'var(--color-sky-300)',
      'var(--color-teal-500)',
      'var(--color-violet-400)',
      'var(--color-indigo-200)',
    ],
  },
  [AgentStateType.CALLING_TOOL]: {
    activeSpeed: 'fast',
    backgroundColor: 'var(--color-fuchsia-400)',
    colors: [
      'var(--color-fuchsia-400)',
      'var(--color-violet-400)',
      'var(--color-indigo-500)',
      'var(--color-purple-200)',
    ],
  },
  [AgentStateType.FAILED]: {
    activeSpeed: 'slow',
    backgroundColor: 'var(--color-red-200)',
    colors: [
      'var(--color-red-100)',
      'var(--color-rose-300)',
      'var(--color-fuchsia-400)',
      'var(--color-indigo-300)',
    ],
  },
  [AgentStateType.COMPLETED]: {
    activeSpeed: 'slow',
    backgroundColor: 'var(--color-green-400)',
    colors: [
      'var(--color-green-300)',
      'var(--color-teal-400)',
      'var(--color-emerald-500)',
      'var(--color-lime-200)',
    ],
  },
};

interface AgentStateHeaderProps {
  state: AgentStateType;
  description?: string;
}

function StateIcon({
  children,
  shouldRender,
}: {
  children: React.ReactNode;
  shouldRender: boolean;
}) {
  return (
    <div
      className={cn(
        'absolute origin-center transition-all duration-500 ease-spring-soft',
        shouldRender ? 'scale-100' : 'scale-0 opacity-0 blur-md',
      )}
    >
      {children}
    </div>
  );
}

export function AgentStateHeader({ state, description }: AgentStateHeaderProps) {
  return (
    <PanelHeader
      className={cn(
        'mb-0 origin-bottom transition-all duration-300 ease-out',
        state !== AgentStateType.IDLE
          ? '!h-[calc-size(auto,size)] h-auto'
          : 'h-0 scale-x-75 scale-y-0 p-0 opacity-0 blur-md',
      )}
      title={
        <span className="text-base">{AGENT_STATE_TEXT[state]}</span>
      }
      description={
        description && <span className="text-sm">{description}</span>
      }
      iconArea={
        <div className="flex size-8 items-center justify-center">
          {(Object.values(AgentStateType) as AgentStateType[]).map((s) => (
            <StateIcon key={s} shouldRender={state === s}>
              {AGENT_STATE_ICONS[s]}
            </StateIcon>
          ))}
        </div>
      }
      actionArea={
        <div className="-z-10 pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-50">
          <GradientBackgroundChat
            className="size-full"
            currentVariant={state}
            variants={GRADIENT_VARIANTS}
            transparent={state === AgentStateType.IDLE}
          />
        </div>
      }
    />
  );
}
