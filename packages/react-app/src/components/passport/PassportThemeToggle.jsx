import React from "react";
import { Moon, Sun } from "lucide-react";

export default function PassportThemeToggle({ themeMode, onToggle, theme }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${theme.toggleWrap}`}
    >
      {themeMode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {themeMode === "light" ? "Modo oscuro" : "Modo claro"}
    </button>
  );
}
