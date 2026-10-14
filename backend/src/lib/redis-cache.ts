
import { Redis } from 'ioredis';

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL?.trim();

  if (!redisUrl) return null;

  if (!redisClient || redisClient.status === 'end') {
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: () => null,
    });

    redisClient.on('error', () => {});
  }

  return redisClient;
}

async function getConnectedRedis(): Promise<Redis | null> {
  const client = getRedisClient();

  if (!client) return null;

  try {
    if (client.status === 'wait') await client.connect();
    return client.status === 'ready' ? client : null;
  } catch {
    return null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getConnectedRedis();
    if (!client) return null;

    const cached = await client.get(`memed:${key}`);
    return cached === null ? null : JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 15): Promise<void> {
  try {
    const client = await getConnectedRedis();
    if (!client) return;

    await client.set(`memed:${key}`, JSON.stringify(value), 'EX', Math.max(1, Math.floor(ttlSeconds)));
  } catch {
    return;
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = await getConnectedRedis();
    if (!client) return;

    await client.del(`memed:${key}`);
  } catch {
    return;
  }
}

export async function closeRedis(): Promise<void> {
  const client = redisClient;
  redisClient = null;

  if (!client) return;

  try {
    client.disconnect();
  } catch {
    return;
  }
}
