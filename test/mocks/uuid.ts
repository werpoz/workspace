let count = 0;
export const v4 = () => {
  count++;
  // Pad count to ensure it's always 3 digits max (000-999)
  const paddedCount = String(count).padStart(3, '0').slice(-3);
  return `550e8400-e29b-41d4-a716-4466554400${paddedCount.slice(0, 2)}`;
};

// Proper UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validate = (uuid: string) => {
  return UUID_REGEX.test(uuid);
};

export const MAX = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
export const NIL = '00000000-0000-0000-0000-000000000000';
