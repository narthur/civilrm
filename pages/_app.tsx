import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Layout } from "../components/layout/Layout";

import {
  ClerkProvider,
  useAuth,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
} from "convex/react";
import { dark } from "@clerk/themes";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignOutUrl="/"
      appearance={{ baseTheme: dark }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Layout>
          <Unauthenticated>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Welcome to CivilRM</h1>
                <p className="mb-4">Please sign in to access your dashboard.</p>
              </div>
            </div>
          </Unauthenticated>
          <Authenticated>
            <Component {...pageProps} />
          </Authenticated>
          <AuthLoading>
            <div className="flex items-center justify-center min-h-screen">
              <p>Loading...</p>
            </div>
          </AuthLoading>
        </Layout>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
