import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

interface SummaryCard {
  label: string;
  value: string;
  change: string;
  tone: "indigo" | "emerald" | "amber" | "rose";
}

interface VaultEntry {
  title: string;
  username: string;
  category: string;
  updated: string;
  status: "Active" | "Needs review";
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent {
  summaryCards: SummaryCard[] = [
    {
      label: "Total entries",
      value: "128",
      change: "+12 this week",
      tone: "indigo",
    },
    {
      label: "Strong passwords",
      value: "94%",
      change: "+4.2%",
      tone: "emerald",
    },
    {
      label: "Security checks",
      value: "18",
      change: "3 pending",
      tone: "amber",
    },
    { label: "At risk", value: "2", change: "Needs review", tone: "rose" },
  ];

  vaultEntries: VaultEntry[] = [
    {
      title: "Eurobank",
      username: "tauromanix",
      category: "Banking",
      updated: "2 hours ago",
      status: "Active",
    },
    {
      title: "Gmail",
      username: "iordanidischr@gmail.com",
      category: "Email",
      updated: "5 hours ago",
      status: "Active",
    },
    {
      title: "JetBrains",
      username: "Ulysses31",
      category: "Developer",
      updated: "Yesterday",
      status: "Needs review",
    },
    {
      title: "Apple Store",
      username: "iordanidischr@gmail.com",
      category: "Shopping",
      updated: "2 days ago",
      status: "Active",
    },
  ];

  categories = [
    { name: "Banking", count: 12, color: "bg-indigo-100 text-indigo-700" },
    { name: "Email", count: 8, color: "bg-sky-100 text-sky-700" },
    { name: "Developer", count: 17, color: "bg-violet-100 text-violet-700" },
    { name: "Shopping", count: 10, color: "bg-amber-100 text-amber-700" },
  ];
}
