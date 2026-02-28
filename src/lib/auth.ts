import { supabase } from './supabase';

export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: name ? { data: { full_name: name } } : undefined,
  });

  if (error) throw error;
  return data;
}

export async function updateDisplayName(name: string) {
  const { data, error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { clearSubscriptionCache } = await import('./subscription');
  clearSubscriptionCache();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function logout() {
  return signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/uk/reset-password`,
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/uk/dashboard`
    }
  });

  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/uk/dashboard`
    }
  });

  if (error) throw error;
  return data;
}

export async function signInWithFacebook() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/uk/dashboard`
    }
  });

  if (error) throw error;
  return data;
}
