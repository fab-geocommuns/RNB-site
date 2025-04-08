import { useEffect } from 'react';

// @ts-ignore
export default function InputErrors({ errors }) {
  if (errors && errors.length > 0) {
    return (
      <>
        // @ts-ignore
        <p id="text-input-error-desc-error" class="fr-error-text">
          // @ts-ignore
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
