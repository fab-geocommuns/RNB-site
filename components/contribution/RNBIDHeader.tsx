type Props = {
  rnbId: string;
};

export default function RNBIDheader({ rnbId }: Props) {
  return (
    <>
      <span>Identifiant RNB</span>
      <span>{rnbId}</span>
    </>
  );
}
