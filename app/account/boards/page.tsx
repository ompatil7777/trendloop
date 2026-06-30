import AccountDashboard from "../account-dashboard";

export const metadata = {
  title: "My Boards & Collections — Trendloop",
  description: "View and organize your custom design boards and curation folders.",
};

export default function AccountBoardsPage() {
  return <AccountDashboard initialTab="boards" />;
}
