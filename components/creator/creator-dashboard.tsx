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
  ExternalLink,
  Copy,
} from "lucide-react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import Link from "next/link";
import { copyProfileLink } from "@/lib/utils";

// Helper function to check if user is registered as creator
const checkIsCreator = async (address: string): Promise<boolean> => {
  try {
    const result = await fcl.query({
      cadence: `
        import FlowTip from 0x6c1b12e35dca8863
        
        access(all) fun main(address: Address): Bool {
          let account = getAccount(address)
          return account.capabilities.check<&FlowTip.Creator>(FlowTip.CreatorPublicPath)
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });

    return result;
  } catch (error) {
    console.error("Error checking creator status:", error);
    return false;
  }
};

interface CreatorDashboardProps {
  creator: Creator | null;
  tips: Tip[];
  onCreatorRegistered: () => Promise<void>;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  creator,
  tips,
  onCreatorRegistered,
}) => {
  const { user, isCreator } = useAuth();
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [name, setName] = React.useState(creator?.name || "");
  const [description, setDescription] = React.useState(
    creator?.description || ""
  );
  const [imageURL, setImageURL] = React.useState(creator?.imageURL || "");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [transactionId, setTransactionId] = React.useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: any): string => {
    if (amount === null || amount === undefined) return "0.00";
    const num = typeof amount === "number" ? amount : parseFloat(amount);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.addr) {
      setError("Please connect your wallet first");
      return;
    }

    setError(null);
    setSuccess(null);
    setTransactionId(null);

    try {
      setIsRegistering(true);
      console.log("Starting registration with:", {
        name,
        description,
        imageURL,
      });

      const transactionId = await registerCreator(name, description, imageURL);

      if (transactionId) {
        console.log("✅ Registration successful!");
        setSuccess("Successfully registered as a creator!");
        setTransactionId(transactionId.blockId);

        setTimeout(async () => {
          if (user.addr) {
            const isCreatorNow = await checkIsCreator(user.addr);
            if (isCreatorNow) {
              await onCreatorRegistered();
            }
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(
        error.message || "Failed to register as creator. Please try again."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.addr) {
      setError("Please connect your wallet first");
      return;
    }

    setError(null);
    setSuccess(null);
    setTransactionId(null);

    try {
      setIsUpdating(true);
      console.log("Updating profile with:", { name, description, imageURL });

      const transactionId = await registerCreator(name, description, imageURL);

      if (transactionId) {
        console.log("✅ Update successful!");
        setSuccess("Successfully updated your profile!");
        setTransactionId(transactionId.blockId);

        setTimeout(async () => {
          await onCreatorRegistered();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Update error:", error);
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // In your component (no need for state management anymore!)
  const handleCopyClick = async () => {
    if (!user?.addr) return;

    await copyProfileLink(user.addr);
    // That's it! The function handles the toast notifications
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0" />
            <div>
              <span className="font-medium">{success}</span>
            </div>
          </div>
        </div>
      )}

      {/* FIXED CONDITION: Show dashboard when user IS a creator AND has creator data */}
      {(isCreator && creator) || (creator && creator.address === user.addr) ? (
        <>
          {/* Creator Profile Link Section */}
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
                  onClick={handleCopyClick}
                  className="bg-white text-green-600 hover:bg-gray-50 border-2 border-green-200 hover:border-green-300 px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Profile Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Total Tips
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {creator?.tipCount || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  
                </div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Total Earned
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {formatAmount(creator?.totalTipped)}{" "}
                  <span className="text-lg text-gray-600">FLOW</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl"></span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Average Tip
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {creator && creator.tipCount > 0
                    ? formatAmount(
                        Number(creator?.totalTipped) / creator?.tipCount
                      )
                    : "0.00"}{" "}
                  <span className="text-lg text-gray-600">FLOW</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Update Form */}
          <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-8">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <User className="w-6 h-6 mr-3 text-green-600" />
                Your Creator Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Display Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your creator name"
                    required
                    disabled={isUpdating}
                    className="w-full px-4 py-4 text-lg text-black border-2 border-gray-200 focus:border-green-400 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200"
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
                    disabled={isUpdating}
                    className="w-full px-4 py-4 text-base text-black border-2 border-gray-200 focus:border-green-400 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Profile Image URL{" "}
                    <span className="text-gray-500 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Input
                    value={imageURL}
                    onChange={(e) => setImageURL(e.target.value)}
                    placeholder="https://example.com/your-image.jpg"
                    disabled={isUpdating}
                    className="w-full px-4 py-4 text-lg text-black border-2 border-gray-200 focus:border-green-400 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Tips */}
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
                    <div
                      key={tip.id}
                      className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
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
                              <span>{formatDate(tip.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg">
                          <span className="font-bold text-lg">
                            {formatAmount(tip.amount)} FLOW
                          </span>
                        </div>
                      </div>
                      {tip.message && (
                        <div className="mt-4 bg-white rounded-xl p-4 border-l-4 border-green-400 shadow-sm">
                          <div className="flex items-start space-x-2">
                            <MessageCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 italic">
                              "{tip.message}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Registration Form - shown when NOT a creator */}
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
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Registration form content - same as before */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Display Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your creator name"
                      required
                      disabled={isRegistering}
                      className="w-full px-4 py-4 text-lg text-black border-2 border-gray-200 focus:border-green-400 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200"
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
                      disabled={isRegistering}
                      className="w-full px-4 py-4 text-base text-black border-2 border-gray-200 focus:border-green-400 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Profile Image URL{" "}
                      <span className="text-gray-500 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <Input
                      value={imageURL}
                      onChange={(e) => setImageURL(e.target.value)}
                      placeholder="https://example.com/your-image.jpg"
                      disabled={isRegistering}
                      className="w-full px-4 py-4 text-lg text-black border-2 border-gray-200 focus:border-green-400 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isRegistering || !user?.addr}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      "Create Creator Profile"
                    )}
                  </Button>

                  {!user?.addr && (
                    <p className="text-sm text-gray-500 text-center mt-4">
                      Please connect your wallet to continue
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default CreatorDashboard;
