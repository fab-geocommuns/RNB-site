import { useEffect } from 'react';

export default function InputErrors({ errors }) {
  if (errors && errors.length > 0) {
    return (
      <>
        <p id="text-input-error-desc-error" class="fr-error-text">
          {errors.map((error, index) => {
            return (
              <span key={index}>
                {error}
                <br />
              </span>
            );
          })}
        </p>
      </>
    );
  } else {
    return <></>;
  }
}
