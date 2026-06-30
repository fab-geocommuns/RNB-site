import { TROPHIES } from './data';

// Mock de `GET /editions/trophies` : liste des trophées et nombre de gagnants.
// Voir `app/api/mock/editions/trophies/data.ts`.
export async function GET() {
  return Response.json(TROPHIES);
}
