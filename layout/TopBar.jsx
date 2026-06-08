import { motion } from "framer-motion";
import { Bell, Settings, Sun, Moon, Grid3X3 } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import ProfileMenu from "./ProfileMenu";


function TopBarButton({ icon: Icon, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 bg-white/[0.08] dark:bg-white/[0.08] hover:bg-black/10 dark:hover:bg-white/[0.14] text-foreground/60 hover:text-foreground"
    >
      <Icon className="w-[18px] h-[18px]" />
    </motion.button>
  );
}

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between h-14 px-6">
        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <TopBarButton icon={Bell} />
          <TopBarButton
            icon={theme === "dark" ? Sun : Moon}
            onClick={toggleTheme}
          />
          <TopBarButton icon={Settings} />
          <TopBarButton icon={Grid3X3} />

          {/* User Profile */}
          <ProfileMenu />
        </div>
      </div>
    </motion.header>
  );
}