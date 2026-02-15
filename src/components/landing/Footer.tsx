import { Link } from "react-router-dom";
import { Brain, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-sidebar text-sidebar-foreground">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EduTrace</span>
          </div>
          
          <p className="text-muted-foreground text-center md:text-left">
            Helping schools see understanding, not just marks.
          </p>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/auth/admin" className="flex items-center gap-1.5 hover:text-sidebar-foreground transition-colors">
              <Shield className="w-4 h-4" />
              Platform Admin
            </Link>
            <span>© 2026 EduTrace. Evidence-Based Learning Intelligence.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
