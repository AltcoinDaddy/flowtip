import { AuthContextType, User } from "@/types";

export const initialUser: User = { addr: "", loggedIn: false };

export const initialAuthContext: AuthContextType = {
  user: initialUser,
  logIn: async () => {},
  logOut: async () => {},
  isCreator: false,
  checkIsCreator: async () => false,
  isLoading: true,
  isCheckingCreator: false,
  creator: null,
  refreshCreatorData: async () => {},
  uploadFile: async () => ({ success: false, error: "Not implemented" }),
  getAllCreators: async () => [],
  getTopCreators: async () => [],
  searchCreators: async () => [],
  needsRegistrationFix: false,
  runManualFix: async () => {},
};