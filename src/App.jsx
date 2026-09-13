import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EnquiryModal from './components/EnquiryModal';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import EBooks from './pages/EBooks';
import HolidayCalendar from './pages/HolidayCalendar';
import SubjectPage from './pages/SubjectPage';
import ClassesPage from './pages/ClassesPage';
import NewsPage from './pages/NewsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { subjectsData } from './config/subjectsData';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/Sweb_frontend">
        <ScrollToTop />
        <Navbar />
        <Routes>
          {/* ── Main pages ──────────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/ebooks" element={<EBooks />} />
          <Route path="/e-books" element={<EBooks />} />
          <Route path="/calendar" element={<HolidayCalendar />} />

          {/* ── News & Events public page ────────────────────── */}
          <Route path="/news" element={<NewsPage />} />

          {/* ── Admin routes ─────────────────────────────────── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Academic Class & Stage pages ─────────────────── */}
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/:stage" element={<ClassesPage />} />

          {/* ── Subject detail pages ──────────────────────────── */}
          <Route path="/subjects/:id"            element={<SubjectPage />} />
          <Route path="/subjects/languages"      element={<SubjectPage data={subjectsData.languages}   />} />
          <Route path="/subjects/mathematics"    element={<SubjectPage data={subjectsData.mathematics} />} />
          <Route path="/subjects/science"        element={<SubjectPage data={subjectsData.science}     />} />
          <Route path="/subjects/social-studies" element={<SubjectPage data={subjectsData.social}      />} />
          <Route path="/subjects/computer"       element={<SubjectPage data={subjectsData.computer}    />} />
          <Route path="/subjects/arts"           element={<SubjectPage data={subjectsData.arts}        />} />
        </Routes>
        <Footer />
        <EnquiryModal />
      </BrowserRouter>
    </AuthProvider>
  );
}

