'use client';

import { Input, type InputProps } from '@codegouvfr/react-dsfr/Input';
import Button from '@codegouvfr/react-dsfr/Button';
import styles from '@/styles/InlineInputButton.module.scss';

type Props = {
  label: string;
  buttonLabel: string;
  nativeInputProps: InputProps.RegularInput['nativeInputProps'];
  disabled?: boolean;
};

export default function InlineInputButton({
  label,
  buttonLabel,
  nativeInputProps,
  disabled,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <Input label={label} hideLabel nativeInputProps={nativeInputProps} />
      <Button type="submit" disabled={disabled}>
        {buttonLabel}
      </Button>
    </div>
  );
}
