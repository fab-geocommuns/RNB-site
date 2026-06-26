import { GOAL, GLOBAL, getUserRanking } from '../data';

// Mock de `GET /editions/ranking/{username}/` (score et rang d'un joueur).
// Voir `app/api/mock/editions/ranking/data.ts`.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const { user_score, user_rank } = getUserRanking(
    decodeURIComponent(username),
  );

  return Response.json({
    global: GLOBAL,
    goal: GOAL,
    user_score,
    user_rank,
  });
}
