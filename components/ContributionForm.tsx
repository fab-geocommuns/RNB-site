'use client';

// Hooks
import React, { useState, useRef, useEffect } from 'react';

// Store
import { useDispatch, useSelector } from 'react-redux';

// Analytics
import va from '@vercel/analytics';

// Styles
import styles from '@/styles/contributionForm.module.scss';

// Comps
import Button from '@codegouvfr/react-dsfr/Button';
import Badge from '@codegouvfr/react-dsfr/Badge';

// Utils
// @ts-ignore
import Cookies from 'js-cookie';
import { Actions, RootState } from '@/stores/store';
import { rnbApiUrl } from '@/utils/rnbApi';
import { useRnbApi } from '@/utils/useRnbApi';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';

export default function ContributionForm() {
  const rnbApi = useRnbApi();
  const { isAuthenticated } = useRNBAuthentication();
  const selectedBuilding = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const msgInput = useRef<HTMLInputElement>(null);

  const emptyMsgInput = () => {
    // @ts-ignore
    msgInput.current.value = '';
  };

  // @ts-ignore
  const resize = (e) => {
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // @ts-ignore
  const handleFocus = (e) => {
    va.track('contribution-textarea-focus');
  };

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [summerGamesMessage, setSummerGamesMessage] = useState<string>();
  const dispatch = useDispatch();

  const handleSubmit = async (e: any) => {
    setSending(true);
    setSuccess(false);

    e.preventDefault();

    // Connecté, le champ email n'est pas rendu : le back rattache le signalement au compte
    const data = Object.fromEntries(new FormData(e.target));
    rnbApi
      .post<any>('/reports/', data)
      .then((data) => {
        // Temporary block for the summer games
        if (data && Object.hasOwn(data, 'contributor_rank')) {
          let pluralS = '';
          if (data.contributor_count > 1) {
            pluralS = 's';
          }

          setSummerGamesMessage(
            `<b>Vous avez envoyé ${data.contributor_count} signalement${pluralS}</b>.`,
          );
        } else {
          setSummerGamesMessage(undefined);
        }

        setSending(false);
        setSuccess(true);
        emptyMsgInput();

        /* Store email in cookie */
        if (!isAuthenticated) Cookies.set('email', email, { expires: 365 });

        // Reload map buildings and reports
        dispatch(Actions.map.reloadBuildings());
        dispatch(Actions.report.setLastReportUpdate());

        va.track('contribution-success');

        setTimeout(() => {
          setSuccess(false);
        }, 10000);
      })
      .catch((err) => {
        setSending(false);
        console.error(err);
        va.track('contribution-error', { error: err.message });
      });
  };

  // @ts-ignore
  const changeEmail = (e) => {
    setEmail(e.target.value);
  };

  useEffect(() => {
    const storedEmail = Cookies.get('email');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <form method="post" action={rnbApiUrl('/reports/')} onSubmit={handleSubmit}>
      <input
        name="rnb_id"
        type="hidden"
        className="fr-input"
        // @ts-ignore
        value={selectedBuilding?.rnb_id}
      />
      <textarea
        onFocus={handleFocus}
        onChange={resize}
        // @ts-ignore
        ref={msgInput}
        required
        name="text"
        className={`fr-text--sm fr-input fr-mb-4v ${styles.msgInput}`}
        placeholder="Il manque un bâtiment ? Une adresse semble erronée ? Envoyez votre signalement; tout le monde peut apporter sa pierre au RNB. "
      ></textarea>

      {!isAuthenticated && (
        <>
          <div className="fr-mb-1v">
            <label className="fr-text--sm ">
              Suivez le traitement de votre signalement
            </label>
          </div>
          <input
            onChange={changeEmail}
            value={email}
            name="email"
            type="email"
            className="fr-input fr-text--sm fr-mb-2v"
            placeholder="Votre adresse email (optionnelle)"
          />
        </>
      )}
      <Button disabled={sending} size="small" type="submit">
        {sending && <span>Envoi en cours ...</span>}
        {!sending && <span>Envoyer mon signalement</span>}
      </Button>
      {success && (
        <div className="fr-mt-2v">
          <Badge small severity="success">
            Signalement envoyé. Merci.
          </Badge>
          {summerGamesMessage && (
            <div
              className={styles.summerGameMessage}
              dangerouslySetInnerHTML={{ __html: summerGamesMessage }}
            ></div>
          )}
        </div>
      )}
    </form>
  );
}
