// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
// import RoleRedirect from "./components/RoleRedirect"; // kept in case you still use elsewhere
import Login from "./pages/Login";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { logout } from "./features/auth/authSlice";
import { useTranslation } from "react-i18next";

// Pages
import WorkshopsList from "./pages/workshops/WorkshopsList";
import WorkshopDetail from "./pages/workshops/WorkshopDetail";
import MyBookings from "./pages/bookings/MyBookings";
import UserHome from "./pages/user/Home";
import PartnerBookings from "./pages/partner/Bookings";
import PartnerServices from "./pages/partner/Services";
import AdminDashboard from "./pages/admin/Dashboard";
import Profile from "./pages/user/Profile";
import Signup from "./pages/auth/Signup";
import Forgot from "./pages/auth/Forgot";
import ResetPassword from "./pages/auth/ResetPassword";
import CarWashList from "./pages/carwash/CarWashList";
import CarWashDetail from "./pages/carwash/Detail";
import CarsList from "./pages/cars/List";
import CarDetail from "./pages/cars/Detail";
import RentalList from "./pages/rental/List";
import RentalDetail from "./pages/rental/Detail";
import MyRentals from "./pages/rental/MyRentals";

import ImportsList from "./pages/imports/ImportsList";
import ImportOrderForm from "./pages/imports/ImportOrderForm";
import MyImports from "./pages/imports/MyImports";

import PartsList from "./pages/parts/PartsList";
import PartDetail from "./pages/parts/PartDetail";
import MyPartOrders from "./pages/parts/MyPartOrders";
import PartnerHome from "./pages/partner/Home";
import Reports from "./pages/partner/Reports";
import Cart from "./pages/parts/Cart";

import PartsManager from "./pages/partner/parts/PartsManager";
import PartOrders from "./pages/partner/parts/PartOrders";
import PartnerSignup from "./pages/auth/PartnerSignup";

import PartnerPending from "./pages/partner/Pending";
import PartnerApprovedRoute from "./components/PartnerApprovedRoute";
import AdminPartners from "./pages/admin/Partners";

// ---- public demo pages ----
import PublicHome from "./pages/public/PublicHome";
import DemoWorkshops from "./pages/public/DemoWorkshops";
import DemoCarwash from "./pages/public/DemoCarwash";
import DemoWorkshopDetail from "./pages/public/DemoWorkshopDetail";

/* ---------------- Smart root: public if logged out, redirect if logged in ---------------- */
function Entry() {
  const user = useSelector((s: RootState) => s.auth.user);
  if (user?.role === "user") return <Navigate to="/home" replace />;
  if (user?.role === "partner") return <Navigate to="/partner" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  return <PublicHome />; // logged-out visitors see public landing (demo)
}

/* ---------------- Header (with smart logo target) ---------------- */
function Header() {
  const { t } = useTranslation("common");
  const user = useSelector((s: RootState) => s.auth.user);
  const role = user?.role;

  // Compute cart count only for users
  type CartItem = { id:number; name:string; price:number; image_url?:string|null; qty:number };
  const cartCount = useSelector((s: RootState) => {
    if (role !== "user") return 0;
    const items = s.cart.items as Record<string, CartItem>;
    return Object.values(items).reduce((n, it) => n + it.qty, 0);
  });

  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();
  const doLogout = () => { dispatch(logout()); nav("/login", { replace: true }); };

  const logoTarget = (() => {
    if (!role) return "/";         // logged out -> public landing (Entry will render PublicHome)
    if (role === "user") return "/home";
    if (role === "partner") return "/partner";
    if (role === "admin") return "/admin"; // change if your admin home differs
    return "/";
  })();

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        {/* LEFT: brand -> smart route */}
        <Link to={logoTarget} className="text-lg font-semibold tracking-wide hover:opacity-80">
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

/* ---------------- App routes ---------------- */
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* SMART ROOT */}
        <Route path="/" element={<Entry />} />

        {/* PUBLIC DEMO (no auth) */}
        <Route path="/demo" element={<PublicHome />} />
        <Route path="/demo/workshops" element={<DemoWorkshops />} />
        <Route path="/demo/carwash" element={<DemoCarwash />} />
        <Route path="/demo/workshops/:id" element={<DemoWorkshopDetail />} />

        {/* AUTH PAGES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* USER PORTAL */}
        <Route
          path="/home"
          element={
            <ProtectedRoute roles={["user"]}>
              <UserHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workshops"
          element={
            <ProtectedRoute roles={["user"]}>
              <WorkshopsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workshops/:id"
          element={
            <ProtectedRoute roles={["user"]}>
              <WorkshopDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={["user"]}>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* PARTNER PORTAL */}
        <Route path="/partner-signup" element={<PartnerSignup />} />
        <Route
          path="/partner"
          element={
            <ProtectedRoute roles={["partner", "admin"]}>
              <PartnerApprovedRoute>
                <PartnerHome />
              </PartnerApprovedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/pending"
          element={
            <ProtectedRoute roles={["partner"]}>
              <PartnerPending />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/reports"
          element={
            <ProtectedRoute roles={["partner", "admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/bookings"
          element={
            <ProtectedRoute roles={["partner", "admin"]}>
              <PartnerBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/services"
          element={
            <ProtectedRoute roles={["partner", "admin"]}>
              <PartnerServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/parts"
          element={
            <ProtectedRoute roles={["partner","admin"]}>
              <PartsManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/parts/orders"
          element={
            <ProtectedRoute roles={["partner","admin"]}>
              <PartOrders />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPartners />
            </ProtectedRoute>
          }
        />

        {/* PROFILE (any logged-in role) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["user","partner","admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* CARS / RENTALS / IMPORT / PARTS (user) */}
        <Route
          path="/rental"
          element={
            <ProtectedRoute roles={["user"]}>
              <RentalList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rental/:id"
          element={
            <ProtectedRoute roles={["user"]}>
              <RentalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-rentals"
          element={
            <ProtectedRoute roles={["user"]}>
              <MyRentals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/import"
          element={
            <ProtectedRoute roles={["user"]}>
              <ImportsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/import/new"
          element={
            <ProtectedRoute roles={["user"]}>
              <ImportOrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-imports"
          element={
            <ProtectedRoute roles={["user"]}>
              <MyImports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parts"
          element={
            <ProtectedRoute roles={["user"]}>
              <PartsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parts/:id"
          element={
            <ProtectedRoute roles={["user"]}>
              <PartDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-part-orders"
          element={
            <ProtectedRoute roles={["user"]}>
              <MyPartOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute roles={["user"]}>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* CAR WASH (user) */}
        <Route
          path="/car-wash"
          element={
            <ProtectedRoute roles={["user"]}>
              <CarWashList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/car-wash/:id"
          element={
            <ProtectedRoute roles={["user"]}>
              <CarWashDetail />
            </ProtectedRoute>
          }
        />

        {/* Legacy aliases preserved */}
        <Route
          path="/carwash"
          element={
            <ProtectedRoute roles={["user"]}>
              <CarWashList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/carwash/:id"
          element={
            <ProtectedRoute roles={["user"]}>
              <WorkshopDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cars"
          element={
            <ProtectedRoute roles={["user"]}>
              <CarsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars/:id"
          element={
            <ProtectedRoute roles={["user"]}>
              <CarDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
