import {
  BufferJSON,
  initAuthCreds,
  type AuthenticationState,
  type SignalDataTypeMap,
} from 'baileys';
import Redis from 'ioredis';

const keyField = (type: keyof SignalDataTypeMap, id: string) =>
  `${type}:${id}`;

export async function useMultiRedisAuthState(
  redis: Redis,
  sessionId: string,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
  const credsKey = `wa:auth:${sessionId}:creds`;
  const keysKey = `wa:auth:${sessionId}:keys`;

  const credsJson = await redis.get(credsKey);
  const creds = credsJson
    ? JSON.parse(credsJson, BufferJSON.reviver)
    : initAuthCreds();

  const saveCreds = async () => {
    await redis.set(credsKey, JSON.stringify(creds, BufferJSON.replacer));
  };

  const get = async <T extends keyof SignalDataTypeMap>(
    type: T,
    ids: string[],
  ) => {
    const fields = ids.map((id) => keyField(type, id));
    const res = await redis.hmget(keysKey, ...fields);
    const data: Record<string, SignalDataTypeMap[T]> = {};
    res.forEach((val, idx) => {
      if (val) {
        data[ids[idx]] = JSON.parse(val, BufferJSON.reviver);
      }
    });
    return data;
  };

  const set = async (
    data: {
      [T in keyof SignalDataTypeMap]?: {
        [id: string]: SignalDataTypeMap[T] | null;
      };
    },
  ) => {
    const pipeline = redis.pipeline();
    for (const key in data) {
      const inner = data[key as keyof SignalDataTypeMap];
      if (!inner) continue;
      for (const id in inner) {
        const value = inner[id];
        const field = keyField(key as keyof SignalDataTypeMap, id);
        if (value) {
          pipeline.hset(
            keysKey,
            field,
            JSON.stringify(value, BufferJSON.replacer),
          );
        } else {
          pipeline.hdel(keysKey, field);
        }
      }
    }
    await pipeline.exec();
  };

  const del = async (data: {
    [T in keyof SignalDataTypeMap]?: string[];
  }) => {
    const fields: string[] = [];
    for (const key in data) {
      const ids = data[key as keyof SignalDataTypeMap];
      if (!ids) continue;
      for (const id of ids) {
        fields.push(keyField(key as keyof SignalDataTypeMap, id));
      }
    }
    if (fields.length > 0) {
      await redis.hdel(keysKey, ...fields);
    }
  };

  return {
    state: {
      creds,
      keys: {
        get,
        set,
        delete: del,
      },
    } as AuthenticationState,
    saveCreds,
  };
}
