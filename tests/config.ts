export const MOCK_PORT = 8001;
// Use 127.0.0.1 instead of `localhost` so the choice between IPv4 and IPv6 is
// unambiguous on CI runners that disable IPv6.
export const MOCK_HOST = '127.0.0.1';
export const API_BASE = `http://${MOCK_HOST}:${MOCK_PORT}/api/alpha`;
export const GHOST_BASE = `http://${MOCK_HOST}:${MOCK_PORT}`;
export const APP_URL = 'http://localhost:3000';
