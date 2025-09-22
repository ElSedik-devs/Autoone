// apps/web/src/components/TopNav.tsx
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { logout } from "../features/auth/authSlice";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

// If you already export this from cartSlice, import that instead.
type CartItem = { id: number; name: string; price: number; image_url?: string | null; qty: number };

function logoTarget(role?: string) {
  if (!role) return "/";          // logged-out -> public landing (or RoleRedirect)
  if (role === "user") return "/home";
  if (role === "partner") return "/partner";
  if (role === "admin") return "/admin"; // adjust if your admin home differs
  return "/";
}

export default function TopNav() {
  const { t } = useTranslation("common");
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;

  // Cart badge only for users
  const cartCount = useSelector((s: RootState) => {
    if (role !== "user") return 0;
    const items = s.cart.items as Record<string, CartItem>;
    return Object.values(items).reduce((n, it) => n + it.qty, 0);
  });

  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();

  const doLogout = () => {
    dispatch(logout());
    nav("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        {/* LEFT: brand -> smart home by role */}
        <Link
          to={logoTarget(role)}
          className="text-lg font-semibold tracking-wide hover:opacity-80"
        >
          AutoOne
        </Link>

        {/* RIGHT: (Cart for users) + language + profile/logout */}
        <div className="ml-auto flex items-center gap-3">
          {role === "user" && (
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 rounded-md border px-3 py-2
                         bg-white text-neutral-800 hover:bg-neutral-50
                         dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800
                         focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40"
              aria-label={t("parts.cart", { defaultValue: "Cart" })}
            >
              <span aria-hidden>🛒</span>
              <span className="hidden sm:inline">
                {t("parts.cart", { defaultValue: "Cart" })}
              </span>
              <span
                className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1
                           rounded-full bg-[#0052CC] text-white text-xs font-semibold
                           flex items-center justify-center"
              >
                {cartCount}
              </span>
            </Link>
          )}

          <LanguageSwitcher />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-80">{user.name}</span>
              {/* Optional profile link */}
              <Link to="/profile" className="btn-outline">
                {t("nav.profile", { defaultValue: "Profile" })}
              </Link>
              <button
                className="px-3 py-1.5 rounded-md border hover:bg-gray-50 dark:hover:bg-neutral-800"
                onClick={doLogout}
              >
                {t("btn.logout", { defaultValue: "Logout" })}
              </button>
            </div>
          ) : (
            // When logged out, show Login/Signup shortcuts if you like
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/signup" className="btn-primary">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
