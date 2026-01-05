declare const importMeta: any;
// Vite exposes env on import.meta.env. If VITE_API_URL isn't provided, default
// to the common dev backend address so the frontend doesn't call the wrong host
// (causing 404s). You can override by setting VITE_API_URL in frontend/.env.
const env = import.meta.env
const API_BASE = env.VITE_API_URL;
if (!env.VITE_API_URL) {
  // Helpful warning in dev so you know which base is being used
  // eslint-disable-next-line no-console
  console.warn('[api] VITE_API_URL not set — defaulting API base to', API_BASE);
}

class API {
  base: string;
  token: string | null;

  constructor(base = API_BASE) {
    this.base = base.replace(/\/$/, '');
    this.token = null;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private handleUnauthorized() {
    // If we get a 401, the token is invalid - clear it and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  async get(path: string) {
    const res = await fetch(`${this.base}${path}`, {
      method: 'GET',
      headers: {
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // not json
      data = text;
    }
    if (!res.ok) {
      if (res.status === 401) {
        this.handleUnauthorized();
      }
      const detail = data?.detail || data?.message || data || res.statusText;
      const err: any = new Error(detail);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  async post(path: string, body: any, p0: { headers: { 'Content-Type': string; }; }) {
    const res = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // not json
      data = text;
    }
    if (!res.ok) {
      if (res.status === 401) {
        this.handleUnauthorized();
      }
      const detail = data?.detail || data?.message || data || res.statusText;
      const err: any = new Error(detail);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  async put(path: string, body: any) {
    const res = await fetch(`${this.base}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // not json
      data = text;
    }
    if (!res.ok) {
      if (res.status === 401) {
        this.handleUnauthorized();
      }
      const detail = data?.detail || data?.message || data || res.statusText;
      const err: any = new Error(detail);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  async patch(path: string, body: any) {
    const res = await fetch(`${this.base}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // not json
      data = text;
    }
    if (!res.ok) {
      if (res.status === 401) {
        this.handleUnauthorized();
      }
      const detail = data?.detail || data?.message || data || res.statusText;
      const err: any = new Error(detail);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  async delete(path: string) {
    const res = await fetch(`${this.base}${path}`, {
      method: 'DELETE',
      headers: {
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });
    if (res.status === 204) {
      return null; // No content
    }
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // not json
      data = text;
    }
    if (!res.ok) {
      if (res.status === 401) {
        this.handleUnauthorized();
      }
      const detail = data?.detail || data?.message || data || res.statusText;
      const err: any = new Error(detail);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  async upload(path: string, formData: FormData) {
    const res = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: {
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        // Don't set Content-Type for FormData - browser sets it with boundary
      },
      body: formData,
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // not json
      data = text;
    }
    if (!res.ok) {
      if (res.status === 401) {
        this.handleUnauthorized();
      }
      const detail = data?.detail || data?.message || data || res.statusText;
      const err: any = new Error(detail);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }
}

const api = new API();
export default api;
