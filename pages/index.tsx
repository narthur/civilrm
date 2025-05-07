import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "../convex/_generated/dataModel";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  useAuth,
} from "@clerk/clerk-react";

export default function ProfilePage() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  // Convex queries and mutations
  const userProfileQuery = useQuery(api.users.getMyProfile);
  const storeUserMutation = useMutation(api.users.storeUser);
  const updateUserProfileMutation = useMutation(api.users.updateProfile);

  // Local state for the user profile data
  const [currentUser, setCurrentUser] = useState<
    Doc<"users"> | null | undefined
  >(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Effect to store user in Convex when authenticated
  useEffect(() => {
    if (isSignedIn && userProfileQuery === null) {
      // No profile found for authenticated user, store them
      storeUserMutation({})
        .then(() => {
          console.log("User stored in Convex");
        })
        .catch((err) => {
          console.error("Failed to store user:", err);
          alert("Failed to initialize user profile.");
        });
    }
  }, [isSignedIn, userProfileQuery, storeUserMutation]);

  // Effect to update local state when profile changes
  useEffect(() => {
    if (userProfileQuery) {
      setCurrentUser(userProfileQuery);
      setName(userProfileQuery.name);
      setEmail(userProfileQuery.email);
    }
  }, [userProfileQuery]);

  async function handleUpdateProfile(event: FormEvent) {
    event.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    try {
      await updateUserProfileMutation({
        name,
        email,
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!authLoaded) {
    return <main>Loading authentication...</main>;
  }

  return (
    <main style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>My Profile</h1>
      <div>
        <SignedIn>
          {currentUser === undefined ? (
            <div>Loading profile...</div>
          ) : currentUser === null ? (
            <div>Creating your profile...</div>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div>
                <label
                  htmlFor="name"
                  style={{ display: "block", marginBottom: "5px" }}
                >
                  Name:
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "10px",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  style={{ display: "block", marginBottom: "5px" }}
                >
                  Email:
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "15px",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !currentUser ||
                  (name === currentUser.name && email === currentUser.email)
                }
                style={{ padding: "10px 15px", cursor: "pointer" }}
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </button>
            </form>
          )}
        </SignedIn>

        <SignedOut>
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <p>Please sign in to view and edit your profile.</p>
            <SignInButton mode="modal" />
          </div>
        </SignedOut>
      </div>
    </main>
  );
}
