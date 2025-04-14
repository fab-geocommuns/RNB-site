import { useEffect } from 'react';

// @ts-ignore
export default function InputErrors({ errors }) {
  if (errors && errors.length > 0) {
    return (
      <>
        <p id="text-input-error-desc-error" className="fr-error-text">
          {errors.map((error: any, index: any) => {
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
