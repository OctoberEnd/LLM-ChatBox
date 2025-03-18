import { useTheme } from "next-themes";
import { Switch } from "./switch";
import { applyThemeMode } from "../../utils/color-scheme";
import { ThemeMode } from "../../types";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Switch
      checked={theme === "dark"}
      onCheckedChange={(checked) => {
        setTheme(checked ? "dark" : "light");
        applyThemeMode(checked ? ThemeMode.Dark : ThemeMode.Light);
      }}
    />
  );
}
