'use client';

import styles from '@/styles/newsletter.module.scss';
import { useRef } from 'react';

type Props = {
  formId?: string;
};

export default function NewsletterForm({ formId = 'newsletter-form' }: Props) {
  const form = useRef(null);
  const feedback = useRef(null);
  const btn = useRef(null);
  const input = useRef(null);

  // @ts-ignore
  const handleSubmit = async (e) => {
    resetFeedback();

    disableBtn();

    e.preventDefault();

    // @ts-ignore
    const url = form.current.action + '?isAjax=1';
    // @ts-ignore
    const formData = new FormData(form.current);
    // @ts-ignore
    const method = form.current.method;

    const response = await fetch(url, {
      method: method,
      body: formData,
    });

    const data = await response.json();

    enableBtn();

    if (!response.ok) {
      if (data.errors) {
        if ('EMAIL' in data.errors) {
          failure('Veuillez renseigner une adresse email valide');
        } else {
          failure('Une erreur est survenue. Merci de réessayer plus tard.');
        }
        return;
      }
    } else {
      success();
    }
  };

  const resetFeedback = () => {
    // @ts-ignore
    feedback.current.innerHTML = '';
  };

  // @ts-ignore
  const failure = (msg) => {
    // @ts-ignore
    feedback.current.innerHTML = msg;
  };
  const success = () => {
    // @ts-ignore
    feedback.current.innerHTML = 'Merci de votre inscription !';
  };

  const disableBtn = () => {
    // @ts-ignore
    btn.current.disabled = true;
  };

  const enableBtn = () => {
    // @ts-ignore
    btn.current.disabled = false;
  };

  return (
    <>
      <form
        ref={form}
        id={formId}
        className={styles.nl__form}
        onSubmit={handleSubmit}
        method="POST"
        action="https://9468302f.sibforms.com/serve/MUIFAPYq1oJpmEs2x6ie3BS9jHJojZlq9vxvUbqk84cPxzdcyRJ9b2ckp_JOdn60FlypsKHryyzjRAoQjODmEDPmgrJFMopfS3KOYUr3EThWFnnfs-WFawbi0L-cUm6xzHhRKVFVWulC8jWJYrBcOexerRBI-k9cs6vPe84tyEstqpKcyRW_5ITKvlF8CZa6-pvnILLRJ5UxZSvm"
        data-type="subscription"
      >
        <div className={styles.nl__inputs}>
          <div ref={feedback} className={styles.nl__feedback}></div>
          <input
            ref={input}
            className="fr-input"
            type="text"
            id="EMAIL"
            name="EMAIL"
            aria-label="Adresse email"
            placeholder="Votre adresse email"
          />
          <input
            ref={btn}
            className="fr-btn"
            form="sib-form"
            type="submit"
            value="S'inscrire"
            onClick={handleSubmit}
          />
          <input type="hidden" name="email_address_check" />
          <input type="hidden" name="locale" value="fr" />
        </div>
      </form>
    </>
  );
}
