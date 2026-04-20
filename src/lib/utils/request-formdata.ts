export async function parseJsonField<T>(formData: FormData, key: string): Promise<T> {
  const raw = formData.get(key);

  if (typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`Missing form-data field: ${key}`);
  }

  return JSON.parse(raw) as T;
}
