import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc, Id } from "../convex/_generated/dataModel";

export default function ProfilePage() {
  // Attempt to get the profile
  const userProfileQuery = useQuery(api.users.getMyProfile);
  const createUserMutation = useMutation(api.users.createUser);
  const updateUserProfileMutation = useMutation(api.users.updateProfile);

  // Local state for the user profile data, separate from the query result
  const [currentUser, setCurrentUser] = useState<Doc<"users"> | null | undefined>(undefined);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For update mutation
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    if (userProfileQuery === undefined) {
      setCurrentUser(undefined); // Still loading
      return;
    }
    if (userProfileQuery === null && !isCreatingUser) {
      // No user found, and not already trying to create one.
      setIsCreatingUser(true);
      createUserMutation({})
        .then((newUserId) => {
          // After creating, we need to refetch or manually set.
          // For simplicity, we'll rely on Convex's reactivity to update userProfileQuery
          console.log("User created with ID:", newUserId);
        })
        .catch((err) => {
          console.error("Failed to create user:", err);
          alert("Failed to initialize user profile.");
        })
        .finally(() => {
          setIsCreatingUser(false);
        });
    } else if (userProfileQuery) {
      setCurrentUser(userProfileQuery);
      setName(userProfileQuery.name);
      setEmail(userProfileQuery.email);
    }
  }, [userProfileQuery, createUserMutation, isCreatingUser]);

  async function handleUpdateProfile(event: FormEvent) {
    event.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    try {
      await updateUserProfileMutation({
        id: currentUser._id,
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

  if (currentUser === undefined) {
    return <main>Loading profile...</main>;
  }

  if (currentUser === null) {
    // This state might be briefly visible while user is being created
    return <main>Initializing profile...</main>;
  }

  return (
    <main style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>My Profile</h1>
      <form onSubmit={handleUpdateProfile}>
        <div>
          <label htmlFor="name" style={{ display: "block", marginBottom: "5px" }}>Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !currentUser || (name === currentUser.name && email === currentUser.email)}
          style={{ padding: "10px 15px", cursor: "pointer" }}
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </main>
  );
}
