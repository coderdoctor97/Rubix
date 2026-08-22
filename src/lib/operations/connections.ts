import type { Connection } from '../types';

export function connectionKey(c: Connection): string {
  return [c.a, c.b].sort().join('\0');
}

export function isDuplicate(connections: Connection[], a: string, b: string): boolean {
  const key = [a, b].sort().join('\0');
  return connections.some(cn => [cn.a, cn.b].sort().join('\0') === key);
}
