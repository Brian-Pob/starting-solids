// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { StyleRegistry, css, renderSheets, type StyleData } from "solid-styled";

// import "./app.css";
import { initializeApp } from "firebase/app";
import { FirebaseProvider } from "solid-firebase";
import { useAssets } from "solid-js/web";
import { MetaProvider, Title } from "@solidjs/meta";

const firebaseConfig = {
	apiKey: "AIzaSyD0TUgKDuFAJ8RYC8eywLAgx86ZoXrok6M",
	authDomain: "helloworld-c1de3.firebaseapp.com",
	projectId: "helloworld-c1de3",
	storageBucket: "helloworld-c1de3.appspot.com",
	messagingSenderId: "246000984184",
	appId: "1:246000984184:web:5de668f57870b181140d8d",
	measurementId: "G-P3YJ5XP867",
};

const app = initializeApp(firebaseConfig);

function GlobalStyles() {
	css`
    @global {
      body {
        font-family: Gordita, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
          'Helvetica Neue', sans-serif;
      }

      a {
        margin-right: 1rem;
      }

      main {
        text-align: center;
        padding: 1em;
        margin: 0 auto;
      }

      h1 {
        color: #335d92;
        text-transform: uppercase;
        font-size: 4rem;
        font-weight: 100;
        line-height: 1.1;
        margin: 4rem auto;
        max-width: 14rem;
      }

      p {
        max-width: 14rem;
        margin: 2rem auto;
        line-height: 1.35;
      }

      @media (min-width: 480px) {
        h1 {
          max-width: none;
        }

        p {
          max-width: none;
        }
      }
    }
  `;
	return null;
}

export default function App() {
	const sheets: StyleData[] = [];
	useAssets(() => renderSheets(sheets));

	return (
		<FirebaseProvider app={app}>
			<MetaProvider>
				<Title>My SolidJS App</Title>

				<Router
					root={(props) => (
						<>
							<a href="/">Index</a>
							<a href="/about">About</a>
							<Suspense>{props.children}</Suspense>
						</>
					)}
				>
					<StyleRegistry styles={sheets}>
						<GlobalStyles />
						<FileRoutes />
					</StyleRegistry>
				</Router>
			</MetaProvider>
		</FirebaseProvider>
	);
}
