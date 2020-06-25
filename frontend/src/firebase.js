import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

if (!firebase.apps.length) {
  const config = Buffer.from(process.env.REACT_APP_FIREBASE_CONFIG, 'base64').toString('ascii');
  firebase.initializeApp(JSON.parse(config));
}

const firestore = firebase.firestore();

export const auth = firebase.auth();

const DEFAULT_ERROR = 'Sorry, something went wrong. Try again later.';
export const newCustomerRegistration = async ({ email, password }, additionalData) => {
  // User registration
  let firebaseUser;
  try {
    let { user } = await auth.createUserWithEmailAndPassword(email, password);
    if (!user) {
      return [DEFAULT_ERROR, null];
    }

    firebaseUser = user;
  } catch (e) {
    return [e.message || DEFAULT_ERROR, null];
  }

  // Storing user profile
  const userRef = firestore.doc(`users/${firebaseUser.uid}`);
  const snapshot = await userRef.get();
  if (!snapshot.exists) {
    let { email, displayName } = firebaseUser;

    // TODO profiles and displayName
    displayName = email.split('@')[0];
    try {
      await userRef.set({
        displayName,
        email,
        ...additionalData
      });
    } catch (error) {
      return [error.message || DEFAULT_ERROR, null];
    }
  }

  return [false, firebaseUser];
};

export const customerLogin = async ({ email, password }) => {
  try {
    let { user } = await auth.signInWithEmailAndPassword(email, password);

    return [null, user]
  } catch (e) {
    return [e.message || DEFAULT_ERROR, null];
  }
};

export const customerLogout = async () => {
  try {
    return await auth.signOut();
  } catch (e) {
    return [e.message || DEFAULT_ERROR, null];
  }
};


// export const getUserDocument = async (uid) => {
//   if (!uid) {
//     return null;
//   }

//   try {
//     const userDocument = await firestore.doc(`users/${uid}`).get();
//     return {
//       uid,
//       ...userDocument.data()
//     };
//   } catch (error) {
//     console.error("Error fetching user", error);
//   }
// };
