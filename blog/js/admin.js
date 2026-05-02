// Admin CRUD module — Firestore write and delete operations
// Only the designated admin may create, update, or delete posts.
// Client-side admin check is performed before every Firestore call;
// Firebase Security Rules enforce the same restriction server-side.

import { db } from './firebase-init.js';
import { getCurrentUser, isAdmin } from './auth.js';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const PERMISSION_ERROR = 'You do not have permission to perform this action.';

/**
 * Save a blog post to Firestore.
 *
 * - If `postId` is provided (truthy): updates the existing document at
 *   `posts/{postId}` using `setDoc` with `merge: true` and sets `updatedAt`.
 * - If `postId` is NOT provided (falsy): creates a new document in the
 *   `posts` collection using `addDoc` and sets both `createdAt` and `updatedAt`.
 *
 * Checks `isAdmin(getCurrentUser())` client-side before calling Firestore.
 * Catches Firestore `permission-denied` errors and rethrows with a user-friendly message.
 *
 * @param {{
 *   title: string,
 *   authorName: string,
 *   authorEmail: string,
 *   authorUid: string,
 *   date: string,
 *   excerpt: string,
 *   tags: string[],
 *   content: string,
 *   readingTime: number,
 *   published: boolean
 * }} postData - The post fields to write.
 * @param {string|null|undefined} [postId] - Existing document ID for updates; omit or pass falsy to create.
 * @returns {Promise<import('firebase/firestore').DocumentReference>} The document reference.
 * @throws {Error} If the current user is not admin, or if Firestore returns permission-denied.
 */
export async function savePost(postData, postId) {
  if (!isAdmin(getCurrentUser())) {
    throw new Error(PERMISSION_ERROR);
  }

  try {
    if (postId) {
      // Update existing document
      const docRef = doc(db, 'posts', postId);
      await setDoc(
        docRef,
        { ...postData, updatedAt: serverTimestamp() },
        { merge: true }
      );
      return docRef;
    } else {
      // Create new document
      const colRef = collection(db, 'posts');
      const docRef = await addDoc(colRef, {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef;
    }
  } catch (error) {
    if (error.code === 'permission-denied') {
      throw new Error(PERMISSION_ERROR);
    }
    throw error;
  }
}

/**
 * Delete a blog post from Firestore.
 *
 * Checks `isAdmin(getCurrentUser())` client-side before calling Firestore.
 * Catches Firestore `permission-denied` errors and rethrows with a user-friendly message.
 *
 * @param {string} postId - The Firestore document ID of the post to delete.
 * @returns {Promise<void>}
 * @throws {Error} If the current user is not admin, or if Firestore returns permission-denied.
 */
export async function deletePost(postId) {
  if (!isAdmin(getCurrentUser())) {
    throw new Error(PERMISSION_ERROR);
  }

  try {
    const docRef = doc(db, 'posts', postId);
    await deleteDoc(docRef);
  } catch (error) {
    if (error.code === 'permission-denied') {
      throw new Error(PERMISSION_ERROR);
    }
    throw error;
  }
}
