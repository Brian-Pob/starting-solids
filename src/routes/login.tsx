import type {
    RouteSectionProps
} from "@solidjs/router";
import { Match, Show, Switch } from "solid-js";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from 'firebase/auth';
import { useAuth, useDatabase, useFirebaseApp } from 'solid-firebase';
import { getFirestore, addDoc, collection } from 'firebase/firestore/lite';
import { Title } from '@solidjs/meta';


function FirebaseLogin() {
    const app = useFirebaseApp();
    const login = async () => {
        await signInWithPopup(getAuth(app), new GoogleAuthProvider());
    }

    return (
        <button onClick={login} type='button'>Login with Google</button>
    );
}

function writeMessage(content: string) {
    const db = getFirestore();
    addDoc(collection(db, 'messages'), { content });

    console.log('🔥 - Wrote message to Firebase:', content);
}

export default function Login(props: RouteSectionProps) {
  const app = useFirebaseApp();
  const state = useAuth(getAuth(app));
  return (
    <main>
      <h1>Login</h1>
      <Switch fallback={<FirebaseLogin />}>
        <Match when={state.loading}>
          <p>Loading...</p>
        </Match>
        <Match when={state.error}>
          <FirebaseLogin />
        </Match>
        <Match when={state.data}>
          <Title>Welcome, {state.data?.displayName}</Title>
          <p>Welcome, {state.data?.displayName}!</p>
          <button onClick={() => writeMessage(`Hello, Firebase! ${Date.now()}`)} type='button'>Write to Firebase</button>
          <button onClick={() => signOut(getAuth(app))} type='button'>Logout</button>
        </Match>
      </Switch>
    </main>
  );
}
