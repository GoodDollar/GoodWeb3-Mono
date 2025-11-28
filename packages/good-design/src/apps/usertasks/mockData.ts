import { ClaimerTask } from "./managerTaskCard";
export const SAMPLE_TASKS: ClaimerTask[] = [
  {
    id: "treasury-vote",
    title: "Have your say in the Treasury Proposal",
    description: "Your vote decides where 10 MG$ goes.",
    category: "engagement",
    priority: "main",
    reward: {type: "tokens",amount: 10,description: "Cast My Vote"},
    duration: {startDate: "2025-09-01",endDate: "2025-12-31"},
    actionUrl: "https://www.gooddollar.org/",
    icon: "📦",
    type: "learn"
  },
  {
    id: "goodcollective-donate",
    title: "Donate to GoodCollective",
    description: "Support a verified cause",
    category: "donation",
    priority: "secondary",
    reward: {type: "tokens",amount: -50,description: "Donate 50G$"},
    duration: {startDate: "2025-09-01",endDate: "2025-12-31"},
    actionUrl: "https://www.gooddollar.org/",
    icon: "❤️",
    rewardAmount: "-50 G$",
    rewardColor: "red.500",
     type: "learn"
  },
  {
    id: "invite-friend",
    title: "Invite a friend & earn",
    description: "You both get rewarded!",
    category: "referral",
    priority: "secondary",
    reward: {type: "tokens",amount: 20,description: "Invite Friend"},
    duration: {startDate: "2025-09-01",endDate: "2025-12-31"},
    actionUrl: "https://www.gooddollar.org/",
    icon: "👥",
    rewardAmount: "+20 G$",
    rewardColor: "green.500",
    type: "learn"
  }
];