import { ClaimerTask } from "./managerTaskCard";
export const SAMPLE_TASKS: ClaimerTask[] = [
  {
    id: "treasury-vote",
    title: "Have your say in the Treasury Proposal",
    description: "Your vote decides where 10 MG$ goes.",
    category: "engagement",
    priority: "main",
    reward: { type: "tokens", amount: 10, description: "Vote on" },
    duration: { startDate: "2025-07-23", endDate: "2025-08-23" },
    actionUrl: "https://www.gooddollar.org/"
  },
  {
    id: "goodcollective-donate",
    title: "Donate 50G$ to GoodCollective",
    description: "Make a donation and help make a difference",
    category: "donation",
    priority: "secondary",
    reward: { type: "tokens", amount: 50, description: "50 G$" },
    duration: { startDate: "2025-07-23", endDate: "2025-08-30" },
    actionUrl: "https://www.gooddollar.org/"
  },
  {
    id: "invite-friend",
    title: "Invite a friend & earn 20G$",
    description: "Share GoodDollar with someone you care about",
    category: "referral",
    priority: "secondary",
    reward: { type: "tokens", amount: 20, description: "20 G$" },
    duration: { startDate: "2025-07-23", endDate: "2025-08-30" },
    actionUrl: "https://www.gooddollar.org/"
  }
];
