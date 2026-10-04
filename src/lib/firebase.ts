/**
 * firebase.ts — Safe stub (Auth replaced by Supabase)
 * Preserved for backwards compatibility with any remaining legacy imports.
 */

export const auth = {
  currentUser: null,
} as any;

export const googleProvider = null as any;
export const db = null as any;

export const signInWithEmailAndPassword = async () => { throw new Error('Use Supabase auth instead.'); };
export const createUserWithEmailAndPassword = async () => { throw new Error('Use Supabase auth instead.'); };
export const signInWithPopup = async () => { throw new Error('Use Supabase auth instead.'); };
export const signOut = async () => {};
export const onAuthStateChanged = (_auth: any, callback: any) => {
  callback(null);
  return () => {};
};

export async function testFirestoreConnection(): Promise<boolean> {
  return false;
}

export type { } from 'firebase/auth';
