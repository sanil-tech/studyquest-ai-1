import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Create a client with authentication required
export const base44 = createClient({
  appId: appId || "6a3f271e41dc4ee0d0d5abdf",
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl,
  headers: {
    "api_key": "b634df8dc2874d42a26e406c5e258f54"
  }
});
