import { GOAL, GLOBAL, individual, organization, departement } from './data';

// Mock de `GET /editions/ranking/?max_rank=N` (classement global).
// Voir `app/api/mock/editions/ranking/data.ts`.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maxRankParam = Number(searchParams.get('max_rank'));
  const maxRank =
    Number.isFinite(maxRankParam) && maxRankParam > 0 ? maxRankParam : 100;

  return Response.json({
    goal: GOAL,
    global: GLOBAL,
    individual: individual.slice(0, maxRank),
    organization: organization.slice(0, maxRank),
    departement: departement.slice(0, maxRank),
  });
}
