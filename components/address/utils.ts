export const queryIsRnbId = (q: string) => {
  return q.match(/^[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}[\s|-]?[a-zA-Z0-9]{4}$/);
};

export const queryIsCoordinates = (q: string) => {
  // Format is `lat,lng` and optionally `,zoom`
  return q.match(
    /^-?[0-9]{1,2}\.[0-9]{1,16},\s?-?[0-9]{1,2}\.[0-9]{1,16}(?:,\s?[0-9]{1,2}\.?[0-9]{0,10})?$/,
  );
};
