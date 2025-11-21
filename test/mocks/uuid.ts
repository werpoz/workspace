let count = 0;
export const v4 = () => {
    count++;
    return `550e8400-e29b-41d4-a716-44665544000${count}`;
};
export const validate = (uuid: string) => {
    return uuid !== 'invalid-uuid';
};
export const MAX = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
export const NIL = '00000000-0000-0000-0000-000000000000';
