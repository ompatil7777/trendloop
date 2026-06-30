import AccountDashboard from "../account-dashboard";

export const metadata = {
  title: "My Saved Products — Trendloop",
  description: "View all your bookmarked Gen-Z streetwear products, desk accessories, and room decors.",
};

export default function AccountSavedPage() {
  return <AccountDashboard initialTab="saved" />;
}
