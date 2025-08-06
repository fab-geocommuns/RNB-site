import { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';

export function getHistoryLongTitle(historyItem: ApiHistoryItem): string {
  if (historyItem.event?.type === 'creation') return 'Création';
  if (historyItem.event?.type === 'update') return 'Mise à jour';
  if (historyItem.event?.type === 'deactivation') return 'Désactivation';
  if (historyItem.event?.type === 'reactivation') return 'Réactivation';
  if (historyItem.event?.type === 'merge') {
    if (historyItem.event?.details?.merge_role === 'parent') {
      return (
        'Désactivation suite à la fusion de ' +
        historyItem.event?.details?.merge_parents?.length +
        ' bâtiments'
      );
    }
    if (historyItem.event?.details?.merge_role === 'child') {
      return (
        'Création suite à la fusion de ' +
        historyItem.event?.details?.merge_parents?.length +
        ' bâtiments'
      );
    }
  }
  if (historyItem.event?.type === 'split') {
    if (historyItem.event?.details?.split_role === 'parent') {
      return (
        'Désactivation suite à scission en ' +
        historyItem.event?.details?.split_children?.length +
        ' bâtiments'
      );
    }
    if (historyItem.event?.details?.split_role === 'child') {
      return 'Création suite à une scission';
    }
  }
  return historyItem.event?.type || 'Inconnu';
}

export function getHistoryShortTitle(historyItem: ApiHistoryItem): string {
  if (historyItem.event?.type === 'creation') return 'Créé';
  if (historyItem.event?.type === 'update') return 'Mis à jour';
  if (historyItem.event?.type === 'deactivation') return 'Désactivé';
  if (historyItem.event?.type === 'reactivation') return 'Réactivé';
  if (historyItem.event?.type === 'merge') {
    if (historyItem.event?.details?.merge_role === 'parent') {
      return 'Fusionné';
    }
    if (historyItem.event?.details?.merge_role === 'child') {
      return 'Créé suite à fusion';
    }
  }
  if (historyItem.event?.type === 'split') {
    if (historyItem.event?.details?.split_role === 'parent') {
      return 'Scindé en ' + historyItem.event?.details?.split_children?.length;
    }
    if (historyItem.event?.details?.split_role === 'child') {
      return 'Créé suite à scission';
    }
  }
  return historyItem.event?.type || 'Inconnu';
}

export function displayAuthor(historyItem: ApiHistoryItem): string | null {
  if (historyItem?.event?.origin?.type === 'import') return 'Équipe RNB';
  if (historyItem?.event?.origin?.type === 'data_fix') return 'Équipe RNB';
  if (historyItem?.event?.author?.username)
    return historyItem.event.author.username;
  return null;
}
