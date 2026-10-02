import React from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES } from "../constants";
import { RootLayout, DashboardLayout, AuthLayout } from "../layouts";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  PartnerPage,
  HabitsPage,
  ActivityPage,
  GoalsPage,
  CompanionPage,
  SurprisesPage,
  AnalyticsPage,
  SettingsPage,
  NotFoundPage,
} from "../pages";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<RootLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
      </Route>

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      {/* Protected Couple Space */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.PARTNER} element={<PartnerPage />} />
          <Route path={ROUTES.HABITS} element={<HabitsPage />} />
          <Route path={ROUTES.GOALS} element={<GoalsPage />} />
          <Route path={ROUTES.ACTIVITY} element={<ActivityPage />} />
          <Route path={ROUTES.COMPANION} element={<CompanionPage />} />
          <Route path={ROUTES.SURPRISES} element={<SurprisesPage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
