import { RemixBrowser } from '@remix-run/react';
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { initMonitoring } from './libs/monitoring/monitoring.client';

initMonitoring();

startTransition(() => {
  hydrateRoot(document, <RemixBrowser />);
});
