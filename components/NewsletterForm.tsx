"use client"

import styles from "@/styles/newsletter.module.scss"
import { useRef } from "react"

export default function NewsletterForm() {

    const form = useRef(null);
    const feedback = useRef(null);
    const btn = useRef(null);
    const input = useRef(null);

    const handleSubmit = async (e) => {

        console.log('submit')
        
        resetFeedback();

        disableBtn();

        e.preventDefault();
        
        const url = form.current.action + "?isAjax=1";
        const formData = new FormData(form.current);
        const method = form.current.method;

        const response = await fetch(url, {
            method: method,
            body: formData
        });

        const data = await response.json();
        console.log(data)


        enableBtn();

        if (!response.ok) {
            
            if (data.errors) {
                if ("EMAIL" in data.errors) {
                    failure("Veuillez renseigner une adresse email valide");
                } else {
                    failure("Une erreur est survenue. Merci de réessayer plus tard.");
                }
                return 
            }

        } else {
            success()
        }

        



  
        

    }

    const resetFeedback = () => {
        feedback.current.innerHTML = "";
    }

    const failure = (msg) => {
        feedback.current.innerHTML = msg;
    }
    const success = () => {
        feedback.current.innerHTML = "Merci de votre inscription !"
    }

    const disableBtn = () => {
        btn.current.disabled = true;
    }

    const enableBtn = () => {
        btn.current.disabled = false;
    }

   


   
  

    return (
        <>
        

        
      <form ref={form} className={styles.nl__form} onSubmit={handleSubmit}  method="POST" action="https://9468302f.sibforms.com/serve/MUIFAPYq1oJpmEs2x6ie3BS9jHJojZlq9vxvUbqk84cPxzdcyRJ9b2ckp_JOdn60FlypsKHryyzjRAoQjODmEDPmgrJFMopfS3KOYUr3EThWFnnfs-WFawbi0L-cUm6xzHhRKVFVWulC8jWJYrBcOexerRBI-k9cs6vPe84tyEstqpKcyRW_5ITKvlF8CZa6-pvnILLRJ5UxZSvm" data-type="subscription">
        
        <div className={styles.nl__inputs}>
            <div ref={feedback} className={styles.nl__feedback}></div>
            <input ref={input} className="fr-input" type="text" id="EMAIL" name="EMAIL" placeholder="Votre adresse email" />
            <input ref={btn} className="fr-btn" form="sib-form" type="submit" value="S'inscrire" onClick={handleSubmit} />
            <input type="hidden" name="email_address_check" />
            <input type="hidden" name="locale" value="fr" />
        </div>
      </form>
        
        </>
    )
}