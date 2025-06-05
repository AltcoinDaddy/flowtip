// Fixed Creator Dashboard with all syntax errors corrected
import React from "react";
import { Creator, Tip } from "../../lib/flow/scripts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "@/context/auth-context";
import { registerCreator } from "../../lib/flow/transactions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  User,
  DollarSign,
  TrendingUp,
  Calendar,
  MessageCircle,
  Loader2,
  Copy,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { checkIsCreator } from "@/utils/creator";
import { copyProfileLink, formatAmount } from "@/lib/utils";
import toast from "react-hot-toast";

// ====================== SUCCESS MODAL COMPONENT ======================
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  transactionId?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  transactionId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {transactionId && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Transaction ID:</p>
              <p className="text-xs font-mono text-gray-700 break-all">
                {transactionId}
              </p>
            </div>
          )}
          
          <Button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

// ====================== Component Interfaces ======================
interface CreatorDashboardProps {
  creator: Creator | null;
  tips: Tip[];
  onCreatorRegistered: () => Promise<void>;
}

interface ImageUploadSectionProps {
  imageURL: string;
  setImageURL: (url: string) => void;
  isUploading: boolean;
  disabled: boolean;
  onFileSelected: (file: File) => void;
}

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit?: string;
}

interface TipItemProps {
  tip: Tip;
  index: number;
}

interface CreatorFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  disabled: boolean;
  submitText: string;
  submittingText: string;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  imageURL: string;
  setImageURL: (url: string) => void;
  isUploading: boolean;
  handleFileUpload: (file: File) => Promise<void>;
}

// ====================== Helper Components ======================
const AlertBanner: React.FC<{ type: "error" | "success"; message: string }> = ({
  type,
  message,
}) => (
  <div
    className={`${
      type === "error" 
        ? "bg-red-50 border-red-400 text-red-700" 
        : "bg-green-50 border-green-400 text-green-700"
    } border-l-4 px-6 py-4 rounded-xl shadow-sm`}
  >
    <div className="flex items-center">
      {type === "error" ? (
        <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
      ) : (
        <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  </div>
);

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, unit }) => (
  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-green-100 rounded-xl">{icon}</div>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900">
        {value} {unit && <span className="text-lg text-gray-600">{unit}</span>}
      </p>
    </CardContent>
  </Card>
);

const TipItem: React.FC<TipItemProps> = ({ tip, index }) => (
  <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          {index + 1}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">
            {tip.from.slice(0, 8)}...{tip.from.slice(-6)}
          </p>
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(tip.timestamp * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg">
        <span className="font-bold text-lg">
          {formatAmount(tip?.amount)} FLOW
        </span>
      </div>
    </div>
    {tip.message && (
      <div className="mt-4 bg-white rounded-xl p-4 border-l-4 border-green-400 shadow-sm">
        <div className="flex items-start space-x-2">
          <MessageCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700 italic">"{tip.message}"</p>
        </div>
      </div>
    )}
  </div>
);

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  imageURL,
  setImageURL,
  isUploading,
  disabled,
  onFileSelected,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-900">
        Profile Image
      </label>

      {imageURL && (
        <div className="relative inline-block group">
          <img
            src={imageURL}
            alt="Profile preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={() => setImageURL("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
            disabled={disabled}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        variant="outline"
        className="w-full border-2 border-dashed border-gray-300 hover:border-green-400 bg-gray-50 hover:bg-green-50 h-24 text-black hover:text-black"
      >
        {isUploading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Uploading to Cloudinary...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 py-2">
            <Upload className="w-4 h-4" />
            <span>{imageURL ? "Change Image" : "Upload Image"}</span>
          </div>
        )}
      </Button>
    </div>
  );
};

// ====================== CreatorForm Component ======================
const CreatorForm: React.FC<CreatorFormProps> = ({ 
  onSubmit, 
  isSubmitting, 
  disabled, 
  submitText, 
  submittingText,
  name,
  setName,
  description,
  setDescription,
  imageURL,
  setImageURL,
  isUploading,
  handleFileUpload
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <ImageUploadSection
      imageURL={imageURL}
      setImageURL={setImageURL}
      isUploading={isUploading}
      disabled={disabled}
      onFileSelected={handleFileUpload}
    />

    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        Display Name
      </label>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your creator name"
        required
        disabled={disabled || isUploading}
        className="w-full px-4 py-4 text-lg border-2 text-black placeholder:text-gray-700 border-gray-200 focus:border-green-400 rounded-xl"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        About You
      </label>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Tell supporters about yourself and your content..."
        rows={4}
        required
        disabled={disabled || isUploading}
        className="w-full px-4 py-4 text-base border-2 border-gray-200 placeholder:text-gray-500 focus:border-green-400 rounded-xl resize-none text-black"
      />
    </div>

    <Button
      type="submit"
      disabled={disabled || isUploading}
      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-semibold rounded-xl"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          {submittingText}
        </>
      ) : (
        submitText
      )}
    </Button>
  </form>
);

// ====================== Main Component ======================
const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  creator,
  tips,
  onCreatorRegistered,
}) => {
  const { user, isCreator, uploadFile } = useAuth();
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [name, setName] = React.useState(creator?.name || "");
  const [description, setDescription] = React.useState(
    creator?.description || ""
  );
  const [imageURL, setImageURL] = React.useState(creator?.imageURL || "");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  
  // Modal state
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalMessage, setModalMessage] = React.useState("");
  const [transactionId, setTransactionId] = React.useState<string | null>(null);

  // Handle file upload using Cloudinary
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
        const result = await uploadFile(file, "avatar");

        if (result.success && result.url) {
          setImageURL(result.url);
        } else {
          throw new Error(result.error || "Failed to upload image");
        }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // FIXED: Updated handleAction function
  const handleAction = async (
    e: React.FormEvent,
    actionType: "register" | "update"
  ) => {
    e.preventDefault();

    if (!user?.addr) {
      setError("Please connect your wallet first");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsRegistering(actionType === "register");
    setIsUpdating(actionType === "update");

    try {
      console.log(`Starting ${actionType} with:`, { name, description, imageURL });
      
      const result = await registerCreator(name, description, imageURL);
      
      console.log("Transaction result:", result);

      // FIXED: Check for successful transaction (status 4 = SEALED)
      if (result && result?.status === 4) {
        const successTitle = actionType === "register" ? "Registration Successful!" : "Profile Updated!";
        const successMessage = actionType === "register" 
          ? "You have successfully registered as a creator. You can now receive tips from supporters!"
          : "Your creator profile has been updated successfully.";

        // Show success modal
        setModalTitle(successTitle);
        setModalMessage(successMessage);
        setTransactionId(result.blockId || result.transactionId || "");
        setShowSuccessModal(true);

        // Also set banner success message
        setSuccess(
          actionType === "register"
            ? "Successfully registered as a creator!"
            : "Successfully updated your profile!"
        );

        // Handle post-success actions
        setTimeout(async () => {
          if (actionType === "register" && user.addr) {
            const isCreatorNow = await checkIsCreator(user.addr);
            if (isCreatorNow) await onCreatorRegistered();
          } else {
            await onCreatorRegistered();
          }
        }, 2000);

      } else {
        throw new Error(`Transaction failed with status: ${result?.status || 'unknown'}`);
      }
    } catch (error: any) {
      console.error(`${actionType} error:`, error);
      setError(
        error.message ||
          (actionType === "register"
            ? "Failed to register as creator. Please try again."
            : "Failed to update profile. Please try again.")
      );
    } finally {
      actionType === "register"
        ? setIsRegistering(false)
        : setIsUpdating(false);
    }
  };

  const handleCopyProfile = async () => {
    if (user?.addr) await copyProfileLink(user.addr);
  };

  // Modal close handler
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setModalTitle("");
    setModalMessage("");
    setTransactionId(null);
  };

  const CreatorProfileCard = () => (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Your Creator Profile
              </h3>
              <p className="text-gray-600">
                Share your profile link with supporters to receive tips
              </p>
            </div>
          </div>

          <Button
            onClick={handleCopyProfile}
            className="bg-white text-green-600 hover:bg-gray-50 border-2 border-green-200 hover:border-green-300 px-6 py-3 rounded-xl font-semibold"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Profile Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const StatsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        title="Total Tips"
        value={creator?.tipCount || 0}
      />
      <StatsCard
        icon={<DollarSign className="w-6 h-6 text-green-600" />}
        title="Total Earned"
        value={formatAmount(creator?.totalTipped)}
        unit="FLOW"
      />
      <StatsCard
        icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        title="Average Tip"
        value={
          creator && creator.tipCount > 0
            ? (Number(creator.totalTipped) / creator.tipCount).toFixed(2)
            : "0.00"
        }
        unit="FLOW"
      />
    </div>
  );

  const RecentTipsCard = () => (
    <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-8">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
          <MessageCircle className="w-6 h-6 mr-3 text-green-600" />
          Recent Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        {tips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tips yet
            </h3>
            <p className="text-gray-600">
              Share your profile to start receiving tips from supporters!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tips.map((tip, index) => (
              <TipItem key={tip.id} tip={tip} index={index} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        title={modalTitle}
        message={modalMessage}
        transactionId={transactionId || ""}
      />

      {error && <AlertBanner type="error" message={error} />}
      {success && <AlertBanner type="success" message={success} />}

      {(isCreator && creator) || (creator && creator.address === user?.addr) ? (
        <>
          <CreatorProfileCard />
          <StatsSection />

          <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-8">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <User className="w-6 h-6 mr-3 text-green-600" />
                Your Creator Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <CreatorForm
                onSubmit={(e) => handleAction(e, "update")}
                isSubmitting={isUpdating}
                disabled={isUploading}
                submitText="Update Profile"
                submittingText="Updating Profile..."
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                imageURL={imageURL}
                setImageURL={setImageURL}
                isUploading={isUploading}
                handleFileUpload={handleFileUpload}
              />
            </CardContent>
          </Card>

          <RecentTipsCard />
        </>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Become a Creator
                </CardTitle>
                <p className="text-gray-600">
                  Start receiving tips from your supporters
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <CreatorForm
                onSubmit={(e) => handleAction(e, "register")}
                isSubmitting={isRegistering}
                disabled={!user?.addr || isUploading}
                submitText="Create Creator Profile"
                submittingText="Creating Profile..."
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                imageURL={imageURL}
                setImageURL={setImageURL}
                isUploading={isUploading}
                handleFileUpload={handleFileUpload}
              />

              {!user?.addr && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  Please connect your wallet to continue
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;