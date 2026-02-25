import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Eagerly load homepage (LCP critical path)
import Index from "./pages/Index";

// Lazy load all other routes (reduces initial JS bundle ~60%)
const Auth = lazy(() => import("./pages/Auth"));
const SellerAuth = lazy(() => import("./pages/SellerAuth"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const SearchProducts = lazy(() => import("./pages/SearchProducts"));
const Category = lazy(() => import("./pages/Category"));
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const SellerGuide = lazy(() => import("./pages/SellerGuide"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Cart = lazy(() => import("./pages/Cart").then(m => ({ default: m.Cart })));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess").then(m => ({ default: m.PaymentSuccess })));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel").then(m => ({ default: m.PaymentCancel })));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));
const Sellers = lazy(() => import("./pages/Sellers"));
const Withdrawal = lazy(() => import("./pages/Withdrawal"));

const queryClient = new QueryClient();

// Minimal loading fallback (prevents CLS)
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Đang tải...</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/seller-auth" element={<SellerAuth />} />
              <Route path="/seller-signup" element={<SellerAuth />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/search" element={<SearchProducts />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/seller-guide" element={<SellerGuide />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="/admin/login" element={<AdminAuth />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/seller/:sellerId" element={<SellerProfile />} />
              <Route path="/sellers" element={<Sellers />} />
              <Route path="/withdrawal" element={<Withdrawal />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
