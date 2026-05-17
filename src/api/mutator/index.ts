export const customInstance = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}${url}`, {
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    throw { response: { status: res.status, data: await res.json() } };
  }

  const data = await res.json();
  return { data, status: res.status, headers: res.headers } as T;
};
