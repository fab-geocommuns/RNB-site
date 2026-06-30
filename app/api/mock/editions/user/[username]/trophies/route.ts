import { getUserTrophies } from '../../../trophies/data';

// Mock de `GET /editions/user/<username>/trophies` : trophées gagnés par
// l'utilisateur. Voir `app/api/mock/editions/trophies/data.ts`.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  return Response.json(getUserTrophies(decodeURIComponent(username)));
}
