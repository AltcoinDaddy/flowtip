

export type User = {
  addr: string;
  loggedIn: boolean;
} | null

export type BlockchainCreator = {
  address: string;
  name: string;
  description?: string;
  imageURL?: string;
  createdAt: string;
  totalTipped?: string; // Add totalTipped
  tipCount?: number; // Add tipCount
};

export type PublicCreatorInfo = {
  id: number;
  address: string;
  name: string;
  description: string;
  imageURL: string;
  tipCount: number;
  totalTipped: number;
};

export type AuthContextType = {
  user: User;
  logIn: () => Promise<void>;
  logOut: () => Promise<void>;
  isCreator: boolean;
  checkIsCreator: (address?: string) => Promise<boolean>;
  isLoading: boolean;
  isCheckingCreator: boolean;
  creator: BlockchainCreator | null;
  refreshCreatorData: () => Promise<void>;
  uploadFile: (
    file: File,
    fileType: "avatar" | "banner"
  ) => Promise<{ success: boolean; url?: string; error?: string }>;

  // Public creator queries
  getAllCreators: () => Promise<PublicCreatorInfo[]>;
  getTopCreators: (limit: number) => Promise<PublicCreatorInfo[]>;
  searchCreators: (query: string) => Promise<PublicCreatorInfo[]>;

  // 🆕 Manual fix functionality
  needsRegistrationFix: boolean;
  runManualFix: () => Promise<void>;
};
