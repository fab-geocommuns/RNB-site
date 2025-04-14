type BuildingAddressProps = {
  text: string;
};

export default function BuildingAddress({ text }: BuildingAddressProps) {
  return <div>{text}</div>;
}
