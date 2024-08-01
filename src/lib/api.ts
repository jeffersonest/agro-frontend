const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    console.error('Failed to refresh access token');
    return null;
  }

  const data = await response.json();
  return data.accessToken;
};

const fetcher = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401 && refreshToken) {
      const newToken = await refreshAccessToken(refreshToken);
      if (newToken) {
        localStorage.setItem('token', newToken);
        return fetcher(url, options);
      }
    }
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};

export default fetcher;
export { refreshAccessToken };
