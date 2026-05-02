// Admin CRUD module — Firestore write and delete operations
// Any authenticated user may CREATE posts.
// Only the designated admin may UPDATE or DELETE posts.
// Client-side checks are performed before every Firestore call;
// Firebase Security Rules enforce the same restrictions server-side.

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
 * - CREATE (no postId): any authenticated user may create a new post.
 * - UPDATE (with postId): only the admin may update an existing post.
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
 * }} postData
 * @param {string|null|undefined} [postId]
 * @returns {Promise<import('firebase/firestore').DocumentReference>}
 */
export async function savePost(postData, postId) {
  const user = getCurrentUser();

  if (postId) {
    // UPDATE — admin OR the post's own author
    if (!user) {
      throw new Error(PERMISSION_ERROR);
    }
    const isOwner = postData.authorUid && user.uid === postData.authorUid;
    if (!isAdmin(user) && !isOwner) {
      throw new Error(PERMISSION_ERROR);
    }
    try {
      const docRef = doc(db, 'posts', postId);
      await setDoc(
        docRef,
        { ...postData, updatedAt: serverTimestamp() },
        { merge: true }
      );
      return docRef;
    } catch (error) {
      if (error.code === 'permission-denied') throw new Error(PERMISSION_ERROR);
      throw error;
    }
  } else {
    // CREATE — any authenticated user
    if (!user) {
      throw new Error(PERMISSION_ERROR);
    }
    try {
      const colRef = collection(db, 'posts');
      const docRef = await addDoc(colRef, {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef;
    } catch (error) {
      if (error.code === 'permission-denied') throw new Error(PERMISSION_ERROR);
      throw error;
    }
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
