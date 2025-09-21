import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";
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

// ---- header with single portal link per role ----
function Header() {
  const { t } = useTranslation("common");
  const user = useSelector((s: RootState) => s.auth.user);
  const isUser = user?.role === "user";

  // Compute cart count only for users
  type CartItem = { id:number; name:string; price:number; image_url?:string|null; qty:number };
  const cartCount = useSelector((s: RootState) => {
    if (!isUser) return 0;
    const items = s.cart.items as Record<string, CartItem>;
    return Object.values(items).reduce((n, it) => n + it.qty, 0);
  });

  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();
  const doLogout = () => { dispatch(logout()); nav("/login", { replace: true }); };

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        {/* LEFT: brand -> /home */}
        <Link to="/home" className="text-lg font-semibold tracking-wide hover:opacity-80">
          AutoOne
        </Link>

        {/* RIGHT: (Cart for users) + language + profile/logout */}
        <div className="ml-auto flex items-center gap-3">
          {isUser && (
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

          {user && (
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
          )}
        </div>
      </div>
    </header>
  );
}


// ---- app routes ----
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* after login, / sends you to the correct portal */}
        <Route path="/" element={<RoleRedirect />} />

        {/* public login */}
        <Route path="/login" element={<Login />} />

        {/* user portal (only users) */}
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

        {/* partner portal (partners + admins) */}
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
<Route path="/partner/signup" element={<PartnerSignup />} />

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
        {/* admin portal (admins only) */}
        <Route
  path="/admin"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute roles={["user","partner","admin"]}>
      <Profile />
    </ProtectedRoute>
  }
/>
<Route path="/signup" element={<Signup />} />

<Route path="/forgot" element={<Forgot />} />
<Route path="/reset-password" element={<ResetPassword />} />

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

<Route
  path="/admin/partners"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminPartners />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}
