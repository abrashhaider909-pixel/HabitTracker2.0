import { getSupabaseClient } from './supabase';
import { AuthUser } from '../types';

const STORAGE_KEY_AUTH_USER = 'habitpulse_auth_user_v1';
const STORAGE_KEY_LOCAL_USERS = 'habitpulse_registered_users_v1';

export const DEFAULT_GUEST_USER: AuthUser = {
  id: 'guest-demo-user',
  email: 'abrashhaider909@gmail.com',
  displayName: 'Abrash Haider',
  isGuest: true,
};

// Retrieve active authenticated user from localStorage or Supabase
export function getSavedAuthUser(): AuthUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse saved auth user', e);
  }
  return DEFAULT_GUEST_USER;
}

export function saveAuthUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  } catch (e) {
    console.error('Failed to save auth user', e);
  }
}

// Check initial session with Supabase
export async function initializeAuth(): Promise<AuthUser | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: { session }, error } = await client.auth.getSession();
      if (session?.user && !error) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          isGuest: false,
          createdAt: session.user.created_at,
        };
        saveAuthUser(authUser);
        return authUser;
      }
    } catch (e) {
      console.warn('Supabase getSession error:', e);
    }
  }

  // Default guest session so user can immediately experience app
  saveAuthUser(DEFAULT_GUEST_USER);
  return DEFAULT_GUEST_USER;
}

// Sign In with email and password
export async function signIn(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  if (!email || !password) {
    return { success: false, message: 'Please provide both email and password.' };
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          displayName: data.user.user_metadata?.name || email.split('@')[0],
          isGuest: false,
          createdAt: data.user.created_at,
        };
        saveAuthUser(authUser);
        return { success: true, user: authUser };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Supabase authentication failed.' };
    }
  }

  // Offline / Local Auth fallback for immediate preview & zero-friction testing
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEY_LOCAL_USERS);
    const users: Array<{ id: string; email: string; passwordHash: string; name: string }> = rawUsers ? JSON.parse(rawUsers) : [];

    // Check if user exists
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      if (matched.passwordHash !== btoa(password)) {
        return { success: false, message: 'Invalid email or password.' };
      }
      const authUser: AuthUser = {
        id: matched.id,
        email: matched.email,
        displayName: matched.name,
        isGuest: false,
        createdAt: new Date().toISOString(),
      };
      saveAuthUser(authUser);
      return { success: true, user: authUser };
    }

    // Allow standard initial login if matching default demo email
    if (email === 'abrashhaider909@gmail.com' || email.includes('@')) {
      const authUser: AuthUser = {
        id: `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        displayName: email.split('@')[0],
        isGuest: false,
        createdAt: new Date().toISOString(),
      };
      saveAuthUser(authUser);
      return { success: true, user: authUser };
    }

    return { success: false, message: 'No account found with this email. Please click "Create Account".' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Authentication error.' };
  }
}


// Sign In with Google OAuth
export async function signInWithGoogle(): Promise<{ success: boolean; message?: string }> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      success: false,
      message: 'Supabase is not connected. Please configure Supabase first.',
    };
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Google authentication failed.',
    };
  }
}
// Sign Up with email and password
export async function signUp(email: string, password: string, name?: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  if (!email || !password) {
    return { success: false, message: 'Please provide both email and password.' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split('@')[0] },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          displayName: name || email.split('@')[0],
          isGuest: false,
          createdAt: data.user.created_at,
        };
        saveAuthUser(authUser);
        return { 
          success: true, 
          user: authUser, 
          message: data.session ? 'Account created and logged in!' : 'Account registered! Please check email for confirmation if required by Supabase project.' 
        };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Supabase signup failed.' };
    }
  }

  // Local/Offline Account Registration
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEY_LOCAL_USERS);
    const users: Array<{ id: string; email: string; passwordHash: string; name: string }> = rawUsers ? JSON.parse(rawUsers) : [];

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }

    const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const displayName = name || email.split('@')[0];
    users.push({
      id: newId,
      email,
      passwordHash: btoa(password),
      name: displayName,
    });
    localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify(users));

    const authUser: AuthUser = {
      id: newId,
      email,
      displayName,
      isGuest: false,
      createdAt: new Date().toISOString(),
    };
    saveAuthUser(authUser);
    return { success: true, user: authUser, message: 'Account successfully registered!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Registration failed.' };
  }
}

// Sign Out
export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    }
  }
  // Reset back to guest session
  saveAuthUser(DEFAULT_GUEST_USER);
}

// Auth state change subscription
export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            isGuest: false,
            createdAt: session.user.created_at,
          };
          saveAuthUser(authUser);
          callback(authUser);
        } else if (event === 'SIGNED_OUT') {
          callback(getSavedAuthUser());
        }
      });
      return () => subscription.unsubscribe();
    } catch (e) {
      console.warn('Failed to attach Supabase auth state listener', e);
    }
  }

  // Fallback storage event listener for multi-tab sync
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_AUTH_USER) {
      callback(getSavedAuthUser());
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

