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
  useUser,
} from "@clerk/clerk-react";

export default function ProfilePage() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

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
    return (
      <main className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">My Profile</h1>
        
        <SignedIn>
          <div className="flex flex-col md:flex-row items-center mb-8 border-b pb-6">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold overflow-hidden">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.firstName?.charAt(0) || user?.username?.charAt(0) || '?'}</span>
                )}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold text-gray-800">
                {user?.fullName || user?.username || 'User'}
              </h2>
              <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </SignedIn>
        
        <div>
          <SignedIn>
            {currentUser === undefined ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-pulse flex space-x-4">
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                </div>
                <span className="ml-3 text-gray-600">Loading profile...</span>
              </div>
            ) : currentUser === null ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Creating your profile...</span>
              </div>
            ) : (
              <>
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Details</h3>
                  <p className="text-sm text-gray-600">Update your personal information below</p>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-500 w-full sm:w-auto">
                    {currentUser && (
                      <p>Last updated: {new Date(currentUser._creationTime).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex space-x-3 w-full sm:w-auto">
                    <button 
                      type="button"
                      className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                      onClick={() => {
                        if (currentUser) {
                          setName(currentUser.name);
                          setEmail(currentUser.email);
                        }
                      }}
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        !currentUser ||
                        (name === currentUser.name && email === currentUser.email)
                      }
                      className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : "Save Profile"}
                    </button>
                  </div>
                </div>
              </form>
              </>
            )}
          </SignedIn>

          <SignedOut>
            <div className="text-center py-10">
              <div className="mb-6 bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <h2 className="mt-4 text-lg font-medium text-gray-900">Authentication Required</h2>
              </div>
              <p className="text-gray-600 mb-4">Please sign in to view and edit your profile.</p>
              <p className="text-sm text-gray-500 mb-6">Your profile data is securely stored and only accessible to you.</p>
              <SignInButton mode="modal">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-md">
                  Sign in to continue
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </main>
  );
}
