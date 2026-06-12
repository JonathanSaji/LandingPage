"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, User, HelpCircle } from "lucide-react";

type MenuItem = { name: string; href: string; icon?: React.ReactNode; action?: () => void };

const Menu = ({ children, items }: { children: React.ReactNode; items: MenuItem[] }) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div>
      <button
        className="w-full flex items-center justify-between text-white/70 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 duration-150 text-sm font-medium"
        onClick={() => setIsOpened((v) => !v)}
        aria-expanded={isOpened}
        aria-controls="submenu"
      >
        <div className="flex items-center gap-x-2">{children}</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 duration-150 text-white/40 ${isOpened ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 11-1.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpened && (
        <ul id="submenu" className="mx-4 px-2 border-l border-white/10 text-xs font-medium space-y-1 mt-1">
          {items.map((item, idx) => (
            <li key={idx}>
              {item.action ? (
                <button
                  onClick={item.action}
                  className="w-full text-left flex items-center gap-x-2 text-white/55 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 duration-150 cursor-pointer"
                >
                  {item.icon ? <div className="text-white/40">{item.icon}</div> : null}
                  {item.name}
                </button>
              ) : (
                <a
                  href={item.href}
                  className="flex items-center gap-x-2 text-white/55 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 duration-150"
                >
                  {item.icon ? <div className="text-white/40">{item.icon}</div> : null}
                  {item.name}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function Sidebar({
  isOpen,
  onClose,
  onOpenSettings,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: (tab: "settings" | "general" | "dashboard") => void;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("Alivika Tony");
  const [email, setEmail] = useState("alivika@gmail.com");
  const [plan] = useState("Hobby Plan");

  useEffect(() => {
    const token = localStorage.getItem("subsync_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token));
        if (payload.displayName || payload.username) {
          setUsername(payload.displayName || payload.username);
        }
        if (payload.username) {
          setEmail(`${payload.username}@sub-sync.ca`);
        }
      } catch (e) {
        console.error("Failed to decode token in sidebar:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("subsync_token");
    window.dispatchEvent(new Event("storage"));
    router.replace("/");
  };

  const navigation: MenuItem[] = [
    {
      href: "javascript:void(0)",
      name: "Overview",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
          />
        </svg>
      ),
    },
    {
      href: "javascript:void(0)",
      name: "Integration",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
          />
        </svg>
      ),
    },
    {
      href: "javascript:void(0)",
      name: "Plans",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
      ),
    },
    {
      href: "javascript:void(0)",
      name: "Transactions",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
          />
        </svg>
      ),
    },
  ];

  const navsFooter: MenuItem[] = [
    {
      href: "javascript:void(0)",
      name: "Help",
      icon: <HelpCircle size={18} />,
    },
    {
      href: "/settings",
      name: "Settings",
      icon: <Settings size={18} />,
    },
  ];

  const nestedNav: MenuItem[] = [
    { name: "Cards", href: "javascript:void(0)" },
    { name: "Checkouts", href: "javascript:void(0)" },
    { name: "Payments", href: "javascript:void(0)" },
    { name: "Get paid", href: "javascript:void(0)" },
  ];

  const profileRef = useRef<HTMLButtonElement | null>(null);
  const [isProfileActive, setIsProfileActive] = useState(false);

  useEffect(() => {
    const handleProfile = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileActive(false);
      }
    };
    document.addEventListener("click", handleProfile);
    return () => document.removeEventListener("click", handleProfile);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar Drawer */}
          <motion.nav
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed top-0 left-0 w-80 h-full border-r border-white/10 bg-[#0C0C0E] space-y-8 z-[200] flex flex-col justify-between"
          >
            <div className="flex flex-col h-full px-4">
              {/* Header: User Profile Block */}
              <div className="h-20 flex items-center pl-2 border-b border-white/5 mb-4">
                <div className="w-full flex items-center justify-between">
                  <div 
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-x-3 cursor-pointer group flex-1 mr-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/25 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700]/20 transition-all">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-white text-sm font-semibold truncate group-hover:text-[#FFD700] transition-colors">
                        {username}
                      </span>
                      <span className="block mt-px text-white/40 text-[10px] uppercase font-bold tracking-wider">
                        {plan}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Profile Trigger */}
                  <div className="relative">
                    <button
                      ref={profileRef}
                      className={`p-1.5 rounded-md text-white/50 hover:bg-white/5 hover:text-white transition-all cursor-pointer ${isProfileActive ? 'bg-white/5 text-white' : ''}`}
                      onClick={() => setIsProfileActive((v) => !v)}
                      aria-haspopup="menu"
                      aria-expanded={isProfileActive}
                      aria-controls="profile-menu"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Profile Dropdown Menu */}
                    <AnimatePresence>
                      {isProfileActive && (
                        <motion.div
                          id="profile-menu"
                          role="menu"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute z-10 top-12 right-0 w-64 rounded-xl bg-[#121214] shadow-2xl border border-white/10 text-xs text-white/70"
                        >
                          <div className="p-2 text-left space-y-1">
                            <span className="block text-white/40 p-2 truncate font-mono text-[10px] border-b border-white/5 mb-1">
                              {email}
                            </span>
                            
                            <button
                              onClick={() => {
                                setIsProfileActive(false);
                                router.push("/profile");
                              }}
                              className="w-full text-left block p-2 rounded-lg hover:bg-white/5 active:bg-white/10 duration-150 font-medium text-white/80 hover:text-white cursor-pointer"
                              role="menuitem"
                            >
                              View Profile
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileActive(false);
                                router.push("/settings?tab=general");
                              }}
                              className="w-full text-left block p-2 rounded-lg hover:bg-white/5 active:bg-white/10 duration-150 font-medium text-white/80 hover:text-white cursor-pointer"
                              role="menuitem"
                            >
                              Add another account
                            </button>

                            <button
                              onClick={() => {
                                setIsProfileActive(false);
                                router.push("/settings");
                              }}
                              className="w-full text-left block p-2 rounded-lg hover:bg-white/5 active:bg-white/10 duration-150 font-medium text-white/80 hover:text-white cursor-pointer"
                              role="menuitem"
                            >
                              SyncBot Toggles
                            </button>

                            <button
                              onClick={handleLogout}
                              className="w-full text-left block p-2 rounded-lg hover:bg-red-500/10 active:bg-red-500/20 text-red-400 font-semibold duration-150 cursor-pointer"
                            >
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-thin">
                <ul className="space-y-1 font-medium">
                  {navigation.map((item, idx) => (
                    <li key={idx}>
                      {item.action ? (
                        <button
                          onClick={item.action}
                          className="w-full text-left flex items-center gap-x-3 text-white/70 p-2.5 rounded-lg hover:bg-white/5 active:bg-white/10 duration-150 text-sm cursor-pointer"
                        >
                          <div className="text-white/40">{item.icon}</div>
                          {item.name}
                        </button>
                      ) : (
                        <a
                          href={item.href}
                          className="flex items-center gap-x-3 text-white/70 p-2.5 rounded-lg hover:bg-white/5 active:bg-white/10 duration-150 text-sm"
                        >
                          <div className="text-white/40">{item.icon}</div>
                          {item.name}
                        </a>
                      )}
                    </li>
                  ))}

                  <li>
                    <Menu items={nestedNav}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-white/40"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                        />
                      </svg>
                      Billing & Accounts
                    </Menu>
                  </li>
                </ul>

                <div className="pt-4 border-t border-white/5">
                  <ul className="space-y-1 font-medium">
                    {navsFooter.map((item, idx) => (
                      <li key={idx}>
                        {item.action ? (
                          <button
                            onClick={item.action}
                            className="w-full text-left flex items-center gap-x-3 text-white/70 p-2.5 rounded-lg hover:bg-white/5 active:bg-white/10 duration-150 text-sm cursor-pointer"
                          >
                            <div className="text-white/40">{item.icon}</div>
                            {item.name}
                          </button>
                        ) : (
                          <a
                            href={item.href}
                            className="flex items-center gap-x-3 text-white/70 p-2.5 rounded-lg hover:bg-white/5 active:bg-white/10 duration-150 text-sm"
                          >
                            <div className="text-white/40">{item.icon}</div>
                            {item.name}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Close sidebar button */}
            <div className="p-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-white/20 font-mono">v0.1.0</span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition duration-150 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
