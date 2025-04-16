import React, { useEffect, useState } from 'react';
import { SelectedBuilding } from '@/stores/map/map-slice';
import panelStyles from '@/styles/panel.module.scss';

type BuildingAdresseProps = {
  adresse: Partial<SelectedBuilding['addresses'][number]>;
};

function banLookupApiUrl(interopBanId: string) {
  return process.env.NEXT_PUBLIC_API_BAN_URL + '/lookup/' + interopBanId;
}
function NewBANId({ interopBanId }: { interopBanId: string }) {
  const [newBanId, setNewBanId] = useState(null);

  useEffect(() => {
    const fetchBanId = async () => {
      try {
        const banResponse = await fetch(banLookupApiUrl(interopBanId));
        if (banResponse.ok) {
          const banData = await banResponse.json();
          setNewBanId(banData.banId);
        }
      } catch (error) {
        console.error('Error fetching BAN ID:', error);
      }
    };
    fetchBanId();
  }, [interopBanId]);

  if (!newBanId) {
    return null;
  }

  return (
    <>
      <br />
      Identifiant BAN : {newBanId}
    </>
  );
}

export function BuildingAdresse({ adresse }: BuildingAdresseProps) {
  return (
    <div key={adresse.id} className={panelStyles.sectionListItem}>
      {adresse.street_number}
      {adresse.street_rep} {adresse.street}
      <br />
      {adresse.city_zipcode} {adresse.city_name}
      <br />
      <small>
        Clé BAN : {adresse.id}
        {adresse.id && <NewBANId interopBanId={adresse.id} />}
      </small>
    </div>
  );
}
