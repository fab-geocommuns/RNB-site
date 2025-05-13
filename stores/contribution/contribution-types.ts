export const BuildingStatusMap = {
  constructionProject: 'En projet',
  canceledConstructionProject: 'Projet annulé',
  ongoingConstruction: 'Construction en cours',
  constructed: 'Construit',
  ongoingChange: 'En cours de modification',
  notUsable: 'Non utilisable',
  demolished: 'Démoli',
};

export type BuildingStatusType = keyof typeof BuildingStatusMap;
