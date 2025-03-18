import { ThemeMode } from "~/types";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

// 设置亮色主题
// 将文档的根元素的类名设置为 light，从而应用亮色主题
function light() {
  document.documentElement.classList.remove("dark");
  document.documentElement.classList.add("light");
}

// 设置暗色主题
function dark() {
  document.documentElement.classList.remove("light");
  document.documentElement.classList.add("dark");
}

// 判断系统是否处于暗色模式
function isSystemDarkMode() {
  return !!window.matchMedia(COLOR_SCHEME_QUERY).matches;
}

// 监听系统颜色模式
// 这意味着当系统的颜色模式发生变化时，不会自动切换应用的主题
function colorSchemeListener(e: MediaQueryListEvent) {
  const colorScheme = e.matches ? "dark" : "light";
  if (colorScheme === "dark") {
    dark();
  } else {
    light();
  }
}

function applyThemeMode(mode: ThemeMode) {
  if (mode === ThemeMode.Light) {
    light();
    window
      .matchMedia(COLOR_SCHEME_QUERY)
      .removeEventListener("change", colorSchemeListener);
    return;
  }

  if (mode === ThemeMode.Dark) {
    dark();
    window
      .matchMedia(COLOR_SCHEME_QUERY)
      .removeEventListener("change", colorSchemeListener);
    return;
  }

  if (isSystemDarkMode()) {
    dark();
  } else {
    light();
  }

  window
    .matchMedia(COLOR_SCHEME_QUERY)
    .addEventListener("change", colorSchemeListener);
}

export { applyThemeMode };
