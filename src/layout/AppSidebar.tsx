"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type NavItem = {
  key: string;
  icon: React.ReactNode;
  path?: string;
  new?: boolean;
  target?: string;
  subItems?: {
    key: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    target?: string;
  }[];
};

const baseNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    key: "dashboard",
    subItems: [{ key: "ecommerceHome", path: "/" }],
  },
  {
    icon: <CalenderIcon />,
    key: "calendar",
    path: "/calendar",
  },
  {
    icon: <UserCircleIcon />,
    key: "userProfile",
    path: "/profile",
  },
  {
    key: "forms",
    icon: <ListIcon />,
    subItems: [{ key: "formElements", path: "/form-elements", pro: false }],
  },
  {
    key: "tables",
    icon: <TableIcon />,
    subItems: [{ key: "basicTables", path: "/basic-tables", pro: false }],
  },
  {
    key: "pages",
    icon: <PageIcon />,
    subItems: [
      { key: "blankPage", path: "/blank" },
      { key: "error404", path: "/error-404" },
    ],
  },
];

const baseOthersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    key: "charts",
    subItems: [
      { key: "lineChart", path: "/line-chart", pro: false },
      { key: "barChart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    key: "uiElements",
    subItems: [
      { key: "alerts", path: "/alerts" },
      { key: "avatar", path: "/avatars" },
      { key: "badge", path: "/badge" },
      { key: "buttons", path: "/buttons" },
      { key: "images", path: "/images" },
      { key: "videos", path: "/videos" },
    ],
  },
  {
    icon: <PlugInIcon />,
    key: "authentication",
    subItems: [
      { key: "signIn", path: "/signin", pro: false },
      { key: "signUp", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  const [role, setRole] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 1. Fetch role on mount and path changes
  useEffect(() => {
    async function fetchRole() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1];

        if (!token) {
          setRole("guest"); // Explicit guest state
          return;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setRole(data.role.name);
        } else {
          setRole("guest");
        }
      } catch (err) {
        setRole("guest");
      }
    }
    fetchRole();
  }, [pathname]);

  // 2. Memoize menus so they don't trigger re-renders
  const { main: navItems, others: othersItems } = useMemo(() => {
    if (role === null) return { main: [], others: [] }; // Loading state
    if (role === "guest") {
      return {
        main: [baseNavItems[0]], // Just dashboard
        others: [baseOthersItems[2]], // Just auth
      };
    }

    // B & C: Admin or User
    let filteredMain = baseNavItems.filter((item) => 
      item.key !== "userProfile" && item.key !== "pages"
    );
    
    let filteredOthers = baseOthersItems.filter((item) => 
      item.key !== "charts" && item.key !== "uiElements" && item.key !== "authentication"
    );

    filteredMain = filteredMain.map((item) => {
      if (item.key === "forms") {
        return {
          ...item,
          subItems: [{ 
            key: role === "admin" ? "registerUser" : "rateMovie", 
            path: "/form-elements", 
            pro: false 
          }],
        };
      }
      if (item.key === "tables") {
        if (role === "admin") {
          return {
            ...item,
            subItems: [{ key: "users", path: "/basic-tables", pro: false }],
          };
        }
        return null;
      }
      return item;
    }).filter(Boolean) as NavItem[];

    return { main: filteredMain, others: filteredOthers };
  }, [role]);

  // 3. Safely handle active path matching
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // 4. Update submenu state ONLY on path change, not on render
  useEffect(() => {
    if (role === null) return; // Wait for role to load

    let matched = false;
    
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu((prev) => {
              if (prev?.type === "main" && prev?.index === index) return prev;
              return { type: "main", index };
            });
            matched = true;
          }
        });
      }
    });

    othersItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu((prev) => {
              if (prev?.type === "others" && prev?.index === index) return prev;
              return { type: "others", index };
            });
            matched = true;
          }
        });
      }
    });

    if (!matched) {
      setOpenSubmenu(null);
    }
  }, [pathname, role, navItems, othersItems, isActive]);

  // 5. Dynamically calculate height when dropdown opens
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const el = subMenuRefs.current[key];
      if (el) {
        setSubMenuHeight((prev) => {
          const newHeight = el.scrollHeight;
          if (prev[key] === newHeight) return prev;
          return { ...prev, [key]: newHeight };
        });
      }
    }
  }, [openSubmenu, navItems, othersItems]);

  const handleSubmenuToggle = (index: number, type: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev?.type === type && prev?.index === index) return null;
      return { type, index };
    });
  };

  // 6. Render items
  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => (
        <li key={nav.key}>
          {nav.subItems ? (
            <button
              type="button"
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={cn(
                "group menu-item cursor-pointer w-full",
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive",
                !isExpanded && !isHovered && !isMobileOpen
                  ? "lg:justify-center"
                  : "lg:justify-start",
              )}
            >
              <span
                className={cn(
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive",
                )}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">
                  {t(`items.${nav.key === "forms" && nav.subItems.length === 1 ? nav.subItems[0].key : nav.key}`)}
                </span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={cn(
                    "ms-auto h-5 w-5 transition-transform duration-200",
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : "",
                  )}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                target={nav.target}
                className={cn(
                  "group menu-item",
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive",
                )}
              >
                <span
                  className={cn(
                    isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive",
                  )}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">
                    {t(`items.${nav.key}`)}
                  </span>
                )}
              </Link>
            )
          )}
          
          {/* Sub Items Dropdown */}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`] || 0}px`
                    : "0px",
              }}
            >
              <ul className="ms-9 mt-2 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.key}>
                    <Link
                      href={subItem.path}
                      target={subItem.target}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {t(`items.${subItem.key}`)}
                      <span className="ms-auto flex items-center gap-1">
                        {subItem.pro && (
                          <span
                            className={`ms-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-pro-active"
                                : "menu-dropdown-badge-pro-inactive"
                            } menu-dropdown-badge-pro`}
                          >
                            {t("badges.pro")}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  // Prevent flash of un-styled content while role is fetching
  if (role === null) {
    return (
      <aside className="fixed top-0 left-0 z-50 flex h-full w-22.5 flex-col border-r border-gray-200 bg-white px-5 xl:w-72.5 dark:border-gray-800 dark:bg-gray-900" />
    );
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out xl:mt-0 rtl:right-0 rtl:left-auto rtl:border-r-0 rtl:border-l dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5"
      } ${
        isMobileOpen
          ? "translate-x-0"
          : "-translate-x-full rtl:translate-x-full"
      } xl:translate-x-0 xl:rtl:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-8 ${
          !isExpanded && !isHovered && !isMobileOpen ? "xl:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40} priority style={{ width: "auto", height: "auto" }} />
              <Image className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} priority style={{ width: "auto", height: "auto" }} />
            </>
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} priority style={{ width: "auto", height: "auto" }} />
          )}
        </Link>
      </div>
      
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {navItems.length > 0 && (
              <div>
                <h2 className={`mb-4 flex text-xs leading-5 text-gray-400 uppercase ${!isExpanded && !isHovered && !isMobileOpen ? "xl:justify-center" : "justify-start"}`}>
                  {isExpanded || isHovered || isMobileOpen ? t("groups.menu") : <HorizontaLDots />}
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>
            )}

            {othersItems.length > 0 && (
              <div>
                <h2 className={`mb-4 flex text-xs leading-5 text-gray-400 uppercase ${!isExpanded && !isHovered && !isMobileOpen ? "xl:justify-center" : "justify-start"}`}>
                  {isExpanded || isHovered || isMobileOpen ? t("groups.others") : <HorizontaLDots />}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
