// Auth module — wraps Firebase Authentication
// Provides sign-in (Google / GitHub / Facebook), sign-out, session access, and admin check.

import { auth } from './firebase-init.js';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/**
 * Sign in using an OAuth popup for the given provider.
 *
 * @param {'google'|'github'|'facebook'} providerName
 * @returns {Promise<import('firebase/auth').UserCredential>}
 * @throws {Error} with a user-friendly message on failure
 */
export async function signInWithProvider(providerName) {
  let provider;

  switch (providerName) {
    case 'google':
      provider = new GoogleAuthProvider();
      break;
    case 'github':
      provider = new GithubAuthProvider();
      break;
    case 'facebook':
      provider = new FacebookAuthProvider();
      break;
    default:
      throw new Error('Unsupported provider: ' + providerName);
  }

  try {
    const credential = await signInWithPopup(auth, provider);
    return credential;
  } catch (error) {
    throw new Error('Sign-in failed: ' + error.message + '. Please try again.');
  }
}

/**
 * Sign out the currently authenticated user.
 *
 * @returns {Promise<void>}
 */
export function signOut() {
  return firebaseSignOut(auth);
}

/**
 * Return the currently authenticated Firebase User, or null if unauthenticated.
 *
 * @returns {import('firebase/auth').User|null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Return true iff the given user is the designated admin.
 * The admin is identified by a specific verified email address.
 *
 * @param {import('firebase/auth').User|null} user
 * @returns {boolean}
 */
export function isAdmin(user) {
  return (
    user !== null &&
    user.email === 'adeptashish@gmail.com' &&
    user.emailVerified === true
  );
}

/**
 * Subscribe to Firebase auth state changes.
 *
 * @param {(user: import('firebase/auth').User|null) => void} cb
 * @returns {() => void} unsubscribe function
 */
export function onAuthStateChanged(cb) {
  return firebaseOnAuthStateChanged(auth, cb);
}
