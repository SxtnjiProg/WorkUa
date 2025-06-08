import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VacancyListPage from "./pages/VacancyListPage";
import AppliedVacanciesPage from "./pages/AppliedVacanciesPage";
import VacancyDetailPage from "./pages/VacancyDetailPage";
import RegisterPage from "./pages/RegisterPage";
import ResumePage from "./pages/ResumePage";
import LoginPage from "./pages/LoginPage";
import ApplyPage from "./pages/ApplyPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import Error from "./pages/Error";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<VacancyListPage />} />
                <Route path="/applied" element={<AppliedVacanciesPage />} />
                <Route path="/vacancy/:id" element={<VacancyDetailPage />} />
                <Route path="/apply/:id" element={<ApplyPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/resume" element={<ResumePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/User" element={<UserPage />} />
                <Route path="*" element={<Error />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;