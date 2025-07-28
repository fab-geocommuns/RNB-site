import { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';

export function getHumanFriendlyOperation(
  historyIterm: ApiHistoryItem,
): string {
  if (historyIterm.event?.type === 'creation') return 'Création';
  if (historyIterm.event?.type === 'update') return 'Mise à jour';
  if (historyIterm.event?.type === 'deactivation') return 'Désactivation';
  if (historyIterm.event?.type === 'reactivation') return 'Réactivation';
  if (historyIterm.event?.type === 'merge') {
    if (historyIterm.event?.details?.merge_role === 'parent') {
      return 'Désactivation suite à une fusion';
    }
    if (historyIterm.event?.details?.merge_role === 'child') {
      return 'Création suite à une fusion';
    }
  }
  if (historyIterm.event?.type === 'split') {
    if (historyIterm.event?.details?.split_role === 'parent') {
      return 'Désactivation suite à une scission';
    }
    if (historyIterm.event?.details?.split_role === 'child') {
      return 'Création suite à une scission';
    }
  }
  return historyIterm.event?.type || 'Inconnu';
}
