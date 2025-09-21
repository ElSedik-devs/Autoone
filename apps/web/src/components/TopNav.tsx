import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { logout } from "../features/auth/authSlice";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

// If you already export CartItem from cartSlice, import it instead.
// This local type matches what you dispatch in add({ id,name,price,image_url,qty })
type CartItem = { id: number; name: string; price: number; image_url?: string | null; qty: number };

export default function TopNav() {
  const { t } = useTranslation("common");
  const { user } = useSelector((s: RootState) => s.auth);

  // Type-safe count (no `any`)
  const cartCount = useSelector((s: RootState) =>
    Object.values(s.cart.items as Record<string, CartItem>).reduce((n, it) => n + it.qty, 0)
  );

  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();

  const doLogout = () => {
    dispatch(logout());
    nav("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        {/* Left: brand -> /home */}
        <Link to="/home" className="text-lg font-semibold tracking-wide hover:opacity-80">
          AutoOne
        </Link>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-3">
          {/* Cart button with badge */}
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-md border px-3 py-2
                       bg-white text-neutral-800 hover:bg-neutral-50
                       dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800
                       focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40"
            aria-label={t("parts.cart", { defaultValue: "Cart" })}
          >
            <span aria-hidden>🛒</span>
            <span className="hidden sm:inline">{t("parts.cart", { defaultValue: "Cart" })}</span>
            <span
              className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1
                         rounded-full bg-[#0052CC] text-white text-xs font-semibold
                         flex items-center justify-center"
            >
              {cartCount}
            </span>
          </Link>

          <LanguageSwitcher />

          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-80">{user.name}</span>
              <button
                className="px-3 py-1.5 rounded-md border hover:bg-gray-50 dark:hover:bg-neutral-800"
                onClick={doLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
