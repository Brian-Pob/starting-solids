import type { RouteSectionProps } from "@solidjs/router";
import {
	type Accessor,
	createSignal,
	Match,
	type Setter,
	Show,
	Switch,
} from "solid-js";
import {
	GoogleAuthProvider,
	getAuth,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import { useAuth, useDatabase, useFirebaseApp } from "solid-firebase";
import {
	getStorage,
	ref as storageRef,
	uploadBytesResumable,
} from "firebase/storage";
import { getFirestore, addDoc, collection } from "firebase/firestore/lite";
import { Title } from "@solidjs/meta";
import * as _ from 'lodash-es';

function FirebaseLogin() {
	const app = useFirebaseApp();
	const login = async () => {
		await signInWithPopup(getAuth(app), new GoogleAuthProvider());
	};

	return (
		<>
			<button onClick={login} type="button">
				Login with Google
			</button>
		</>
	);
}

async function writeMessage(content: string) {
	const db = getFirestore();
	try {
		await addDoc(collection(db, "messages"), { content });
		console.log("🔥 - Wrote message to Firebase:", content);
	} catch (error) {
		console.error("🔥 - Error writing message to Firebase: ", content);
	}
}

async function handleImageUpload(
	e: SubmitEvent,
	setIsUploading: Setter<boolean>,
) {
	if (!e || !e.target) {
		console.error("No event found!");
		return;
	}
	e.preventDefault();
	const formData = new FormData(e.target as HTMLFormElement);
	const file = formData.get("imageUpload") as File;
	console.log("🔥 - Uploading file: ", file.name, file.type);

	const storage = getStorage();
	const stRef = storageRef(
		storage,
		`images/${new Date().getTime()}.${file.name}`,
	);

	const uploadTask = uploadBytesResumable(stRef, file);
	uploadTask.on(
		"state_changed",
		(snapshot) => {
			setIsUploading(true);

			const progress = _.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100, 2)
			console.log(`Upload is ${progress}% done`);
			switch (snapshot.state) {
				case "paused":
					console.log("Upload is paused");
					break;
				case "running":
					console.log("Upload is running");
					break;
			}
		},
		(error) => {
			console.error("🔥 - Error uploading file: ", file.name, file.type);
			setIsUploading(false);
		},
		() => {
			console.log("Upload is complete");
			setIsUploading(false);
		},
	);
}

function handleImageChange(e: Event, setSelectedImage: Setter<File | null>) {
	const target = e.target as HTMLInputElement;
	if (target.files && target.files.length > 0) {
		setSelectedImage(target.files[0]);
	}
}

export default function Login(props: RouteSectionProps) {
	const app = useFirebaseApp();
	const state = useAuth(getAuth(app));
	const [selectedImage, setSelectedImage] = createSignal<File | null>(null);
	const [isUploading, setIsUploading] = createSignal(false);
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
					<button
						onClick={() =>
							writeMessage(`Hello, Firebase! ${new Date().toLocaleString()}`)
						}
						type="button"
					>
						Write to Firebase
					</button>
					<Show when={selectedImage()}>
						<img
							src={URL.createObjectURL(selectedImage() as Blob)}
							alt=""
							style={{ "max-width": "250px", margin: "0 auto" }}
						/>
					</Show>
					<Show when={isUploading()}>
						<p>Uploading...</p>
					</Show>
					<form
						onSubmit={(e) => handleImageUpload(e, setIsUploading)}
					>
						<input
							type="file"
							name="imageUpload"
							id="imageUpload"
							onChange={(e: Event) => {
								handleImageChange(e, setSelectedImage);
							}}
						/>
						<button type="submit">Upload</button>
					</form>
					<button onClick={() => signOut(getAuth(app))} type="button">
						Logout
					</button>
				</Match>
			</Switch>
		</main>
	);
}
