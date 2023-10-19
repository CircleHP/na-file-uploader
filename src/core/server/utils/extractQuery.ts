export const extractQuery = (searchParams: URLSearchParams) =>
  Array.from(searchParams).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {} as Record<string, string>
  );
