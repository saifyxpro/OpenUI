# @openui-dev/agent-interface

Agent communication protocol for connecting the OpenUI toolbar to IDE agents.

## Features

- **Availability Management**: Control agent availability with error handling
- **State Management**: Track agent state (idle, processing, etc.)
- **Messaging**: Handle user messages and stream agent responses
- **Chat Capability**: Full chat history support with multi-chat management

## Installation

```bash
npm install @openui-dev/agent-interface
```

## Usage

```typescript
import { createAgentServer } from '@openui-dev/agent-interface';

const { agent } = await createAgentServer({ port: 3000 });

agent.chat.setChatSupport(true);

const chatId = await agent.chat.createChat('My Chat');

agent.chat.addChatUpdateListener((update) => {
  console.log('Chat update:', update);
});

agent.messaging.addUserMessageListener(async (msg) => {
  agent.chat.streamMessagePart('msg-1', 0, {
    content: { type: 'text', text: 'Hello!' },
    updateType: 'create',
  });
});
```

See the [developer guide](https://openui.dev/docs/developer-guides/build-custom-agent-integrations) for full documentation.

## License

AGPL-3.0-only
