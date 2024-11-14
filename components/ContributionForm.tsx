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
import Cookies from 'js-cookie';
import Bus from '@/utils/Bus';
import { Actions, RootState } from '@/stores/map/store';

export default function ContributionForm() {
  const url = process.env.NEXT_PUBLIC_API_BASE + '/contributions/?ranking=true';

  const selectedBuilding = useSelector(
    (state: RootState) => state.map.selectedItem,
  );

  const msgInput = useRef<HTMLInputElement>(null);

  const emptyMsgInput = () => {
    msgInput.current.value = '';
  };

  const resize = (e) => {
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

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

    // submit the form to the url
    let data = new FormData(e.target);
    fetch(url, {
      method: 'POST',
      body: data,
    })
      .then(async (res) => {
        // Temporary block for the summer games
        const data = await res.json();
        if (Object.hasOwn(data, 'contributor_rank')) {
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

        // Warn the map and the contribution counter there is a new one
        Bus.emit('contribution:new', {
          rnb_id: selectedBuilding!.rnb_id,
        });

        /* Empty textarea */

        setSending(false);
        setSuccess(true);
        emptyMsgInput();

        /* Store email in cookie */
        Cookies.set('email', email, { expires: 365 });

        // Reload map buildings
        dispatch(Actions.map.reloadBuildings());

        va.track('contribution-success');

        setTimeout(() => {
          setSuccess(false);
        }, 10000);
      })
      .catch((err) => {
        console.error(err);
        va.track('contribution-error', { error: err.message });
      });
  };

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
    <form method="post" action={url} onSubmit={handleSubmit}>
      <input
        name="rnb_id"
        type="hidden"
        className="fr-input"
        value={selectedBuilding?.rnb_id}
      />
      <textarea
        onFocus={handleFocus}
        onChange={resize}
        ref={msgInput}
        required
        name="text"
        className={`fr-text--sm fr-input fr-mb-4v ${styles.msgInput}`}
        placeholder="Il manque un bâtiment ? Une adresse semble erronée ? Envoyez votre signalement; tout le monde peut apporter sa pierre au RNB. "
      ></textarea>

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
