import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { AnimatePresence, motion } from "framer-motion/dist/framer-motion";
import React, { useEffect, useState } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";

export default function ThemeSwitcher({ inline = false, className = "" }) {
  const theme = window.localStorage.getItem("theme");
  const [isDarkMode, setIsDarkMode] = useState(!(!theme || theme === "light"));
  const { switcher, currentTheme, themes } = useThemeSwitcher();

  useEffect(() => {
    window.localStorage.setItem("theme", currentTheme);
    document.documentElement.setAttribute("data-theme-mode", currentTheme);
    document.body.setAttribute("data-theme-mode", currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    const nextChecked = !isDarkMode;
    setIsDarkMode(nextChecked);
    switcher({ theme: nextChecked ? themes.dark : themes.light });
  };

  const wrapperStyle = inline ? undefined : { position: "fixed", right: 12, bottom: 12, zIndex: 60 };
  const wrapperClassName = `main fade-in ${inline ? "xoco-theme-toggle-inline-wrap" : ""} ${className}`.trim();

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <motion.button
        onClick={toggleTheme}
        className="xoco-theme-toggle"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          {currentTheme === "light" ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SunOutlined className="xoco-theme-icon xoco-theme-icon-sun" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MoonOutlined className="xoco-theme-icon xoco-theme-icon-moon" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
