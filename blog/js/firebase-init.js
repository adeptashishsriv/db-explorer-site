// Firebase initialization — modular SDK v10 loaded from CDN
// Project: astroadept-ab9a8
//
// To update this config: Firebase Console -> Project Settings -> General
// -> Your apps -> Firebase SDK snippet -> Config

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore }  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth }       from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const firebaseConfig = {
  apiKey:            'AIzaSyC_5UiTTnUw9fBA0hGHA1vFQL9Q42_1bk8',
  authDomain:        'astroadept-ab9a8.firebaseapp.com',
  projectId:         'astroadept-ab9a8',
  storageBucket:     'astroadept-ab9a8.firebasestorage.app',
  messagingSenderId: '163038088109',
  appId:             '1:163038088109:web:643a292601a4cbff83af24',
  measurementId:     'G-N2844T2J7L'
};

const app = initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);
