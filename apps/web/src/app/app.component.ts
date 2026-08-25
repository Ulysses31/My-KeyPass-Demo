import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  title = "Overview";
  theme: "light" | "dark" = "light";
  private readonly THEME_KEY = "keypass-theme";

  ngOnInit(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    this.theme = savedTheme === "dark" ? "dark" : "light";
    this.applyTheme();
  }

  get isDarkMode(): boolean {
    return this.theme === "dark";
  }

  toggleTheme(): void {
    this.theme = this.theme === "dark" ? "light" : "dark";
    this.applyTheme();
  }

  applyTheme(): void {
    const root = document.documentElement;
    root.classList.toggle("dark", this.isDarkMode);
    localStorage.setItem(this.THEME_KEY, this.theme);
  }
}
