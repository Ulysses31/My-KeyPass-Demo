import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-data",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./data.component.html",
})
export class DataComponent {
  records = [
    {
      title: "Eurobank",
      username: "tauromanix",
      category: "Banking",
      status: "Active",
    },
    {
      title: "Gmail",
      username: "iordanidischr@gmail.com",
      category: "Email",
      status: "Active",
    },
    {
      title: "JetBrains",
      username: "Ulysses31",
      category: "Developer",
      status: "Needs review",
    },
    {
      title: "Apple Store",
      username: "iordanidischr@gmail.com",
      category: "Shopping",
      status: "Active",
    },
  ];
}
