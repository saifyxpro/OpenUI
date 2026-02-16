import type { KartonContract } from '@openui-dev/karton-contract-bridged';
import {
  createKartonReactClient,
  useComparingSelector,
} from '@openui-dev/karton/react/client';

const [KartonProvider, useKartonState, useKartonProcedure, useKartonConnected] =
  createKartonReactClient<KartonContract>({
    webSocketPath: `${window.location.protocol}//${window.location.host}/openui-toolbar-app/karton`,
    procedures: {
      noop: async () => {},
    },
    fallbackState: {
      noop: false,
    },
  });

export {
  KartonProvider,
  useKartonState,
  useKartonProcedure,
  useKartonConnected,
  useComparingSelector,
};
