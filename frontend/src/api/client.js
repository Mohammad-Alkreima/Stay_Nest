const API_BASE = '/api/v1';
const REQUEST_TIMEOUT = 13000;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type');
  let data;
  if (contentType?.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message = typeof data === 'string' ? data : data?.message || 'An error occurred';
    throw new ApiError(message, res.status, data);
  }
  return data;
}

export async function api(path, options = {}) {
  const { body, headers, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...rest,
    });
    return handleResponse(res);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 0, null);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network error. Please check your connection.', 0, null);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function uploadFiles(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  return api('/uploads/external', { method: 'POST', body: formData });
}
