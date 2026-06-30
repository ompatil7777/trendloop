import AccountDashboard from "./account-dashboard";

export const metadata = {
  title: "My Account — Trendloop",
  description: "Manage your saved products, custom design boards, and currency configuration.",
};

export default function AccountPage() {
  return <AccountDashboard initialTab="saved" />;
}
