// App Layout with Navigation - Broadcast-Grade Design

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Avatar, AvatarFallback, Badge } from "@/components/ui";
import { NotificationBell } from "@/components/notifications";
import { TenantProvider, useTenant } from "@/components/tenant-provider";
import { SportSelector } from "@/components/sport-selector";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  Settings,
  Users,
  MonitorPlay,
  ChevronDown,
  Menu,
  X,
  Activity,
  Search,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItemWithChildren extends NavItem {
  children?: NavItem[];
}

const navigation: NavItemWithChildren[] = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { 
    name: "Lookup", 
    href: "#", 
    icon: Search,
    children: [
      { name: "Matches", href: "/app/matches", icon: Calendar },
      { name: "Teams", href: "/app/teams", icon: Users },
      { name: "Players", href: "/app/players", icon: Activity },
    ]
  },
  { name: "Competitions", href: "/app/competitions", icon: Trophy },
  { name: "Leagues", href: "/app/leagues", icon: Trophy },
  { name: "Displays", href: "/app/displays", icon: MonitorPlay },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

function NavDropdown({ item, pathname }: { item: NavItemWithChildren; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = item.children?.some(child => 
    pathname === child.href || pathname.startsWith(child.href + "/")
  ) ?? false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <item.icon className="w-4 h-4" />
        {item.name}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-40 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50"
          >
            <div className="p-1">
              {item.children?.map((child) => {
                const childIsActive = pathname === child.href || pathname.startsWith(child.href + "/");
                return (
                  <Link
                    key={child.name}
                    href={child.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      childIsActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <child.icon className="w-4 h-4" />
                    {child.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <TenantProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </TenantProvider>
  );
}

function AppLayoutInner({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileLookupOpen, setMobileLookupOpen] = useState(false);
  const { user: authUser } = useAuth({ ensureSignedIn: true });
  const { tenant } = useTenant();

  const user = {
    name: authUser
      ? `${authUser.firstName ?? ""}${authUser.lastName ? ` ${authUser.lastName}` : ""}`.trim() || authUser.email
      : "",
    email: authUser?.email ?? "",
    initials: authUser
      ? `${(authUser.firstName ?? "")[0] ?? ""}${(authUser.lastName ?? "")[0] ?? ""}`.toUpperCase() || authUser.email[0]?.toUpperCase() || "?"
      : "?",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="flex h-16 items-center px-4 lg:px-6">
          {/* Logo */}
          <Link href="/app" className="flex items-center gap-3 mr-8 group">
            <motion.div 
              className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-accent"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-primary-foreground font-bold text-lg font-display">S</span>
            </motion.div>
            <span className="font-bold text-xl hidden sm:block font-display group-hover:text-primary transition-colors">
              Scorr Studio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navigation.map((item) => {
              if (item.children) {
                return <NavDropdown key={item.name} item={item} pathname={pathname} />;
              }

              const isActive = pathname === item.href || 
                (item.href !== "/app" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative"
                >
                  <motion.div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification Bell */}
            <NotificationBell userId="mock-user-id" />
            
            {/* Sport Selector */}
            <div className="hidden sm:block">
              <SportSelector />
            </div>
            
            {/* Tenant Selector */}
            <motion.button 
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm font-medium">{tenant.name}</span>
              <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-0">
                {tenant.plan}
              </Badge>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.button>

            {/* User Menu */}
            <motion.div 
              className="flex items-center gap-3 pl-3 border-l border-border"
              whileHover={{ scale: 1.02 }}
            >
              <Avatar className="w-9 h-9 border-2 border-border hover:border-primary transition-colors">
                <AvatarFallback className="bg-secondary text-sm font-medium">{user.initials}</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="p-4 space-y-1">
                {navigation.map((item, index) => {
                  if (item.children) {
                    const isChildActive = item.children.some(child => 
                      pathname === child.href || pathname.startsWith(child.href + "/")
                    );
                    return (
                      <div key={item.name}>
                        <motion.button
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setMobileLookupOpen(!mobileLookupOpen)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                            isChildActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${mobileLookupOpen ? 'rotate-180' : ''}`} />
                        </motion.button>
                        <AnimatePresence>
                          {mobileLookupOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-4"
                            >
                              {item.children.map((child) => {
                                const childIsActive = pathname === child.href || pathname.startsWith(child.href + "/");
                                return (
                                  <Link
                                    key={child.name}
                                    href={child.href}
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setMobileLookupOpen(false);
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                      childIsActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    <child.icon className="w-4 h-4" />
                                    {child.name}
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  const isActive = pathname === item.href || 
                    (item.href !== "/app" && pathname.startsWith(item.href));

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                        {isActive && (
                          <motion.div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
