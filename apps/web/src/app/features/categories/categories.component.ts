import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-categories",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./categories.component.html",
})
export class CategoriesComponent {
  categories = [
    {
      name: "Banking",
      count: 12,
      description: "Financial accounts and online banking credentials.",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      name: "Email",
      count: 8,
      description: "Mailboxes, newsletters, and account recovery options.",
      color: "bg-sky-100 text-sky-700",
    },
    {
      name: "Developer",
      count: 17,
      description: "API tokens, IDE access, and internal tools.",
      color: "bg-violet-100 text-violet-700",
    },
    {
      name: "Shopping",
      count: 10,
      description: "Store accounts and digital purchase subscriptions.",
      color: "bg-amber-100 text-amber-700",
    },
  ];
}
