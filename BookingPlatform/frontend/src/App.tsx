import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes";
import Navbar from "./components/layout/Navbar";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
              {/* Large emerald orb - top right */}
              <div className="orb orb-emerald w-[600px] h-[600px] -top-48 -right-48 animate-float-slow opacity-20 dark:opacity-10" />

              {/* Teal orb - bottom left */}
              <div className="orb orb-teal w-[500px] h-[500px] -bottom-32 -left-32 animate-float opacity-15 dark:opacity-10" style={{ animationDelay: '2s' }} />

              {/* Small amber accent - center */}
              <div className="orb orb-amber w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow opacity-10 dark:opacity-5" style={{ animationDelay: '4s' }} />

              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: '60px 60px'
                }}
              />
            </div>

            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
              <AppRoutes />
            </main>

            {/* Footer gradient line */}
            <div className="h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-50" />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;