import React from "react";
import { AuthProvider } from "./app/context/AuthContext.js";
import AppNav from "./app/navigation/AppNav.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StripeProvider } from "@stripe/stripe-react-native";

const STRIPE_PUBLISHER_KEY =
  "pk_test_51Nrio5KNzvB8kAUQrO4bFcvvhio9qrJ3XOQKZXLpYhBmUJKcAehiTgCruc1wXL4W95sXh75HG2iu2zMKW0OiyUJf00GV2CK0Pv";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        if (error.response) {
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          error.message = responseError;
        } else {
          error.message = "Network error occurred!";
        }
        console.error("Error:", error.message);
      },
    },
    mutations: {
      onError: (error) => {
        if (error.response) {
          const responseError =
            error.response.data.message || "Unknown error occurred.";
          error.message = responseError;
        } else {
          error.message = "Network error occurred!";
        }
        console.error("Error:", error.message);
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHER_KEY}>
          <AppNav />
        </StripeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
