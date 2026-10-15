// Limitador en memoria por clave (IP, token…). Es "best effort": en serverless cada
// instancia lleva su propia cuenta, así que complementa —no sustituye— los límites en BD.

const cubetas = new Map<string, { inicio: number; cuenta: number }>();

export function limitar(clave: string, max: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  if (cubetas.size > 5000) {
    for (const [k, v] of cubetas) if (ahora - v.inicio > ventanaMs) cubetas.delete(k);
  }
  const c = cubetas.get(clave);
  if (!c || ahora - c.inicio > ventanaMs) {
    cubetas.set(clave, { inicio: ahora, cuenta: 1 });
    return true;
  }
  c.cuenta++;
  return c.cuenta <= max;
}

export function ipDe(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "desconocida"
  );
}
