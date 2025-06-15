import toast from "react-hot-toast";


export const copyAddress = (
  user: any,
  setShowDropdown: (state: boolean) => void
) => {
  if (user?.addr) {
    // Added optional chaining for user
    navigator.clipboard.writeText(user.addr);
    toast.success("Address copied to clipboard");
    setShowDropdown(false); // Close desktop dropdown
    // setIsOpen(false); // Also close mobile menu if open, handled in onClick
  }
};

export const formatAmount = (amount: any): string => {
  if (amount === null || amount === undefined) return "0.00";
  const num = typeof amount === "number" ? amount : parseFloat(amount);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
