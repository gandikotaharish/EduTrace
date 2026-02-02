import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Eye, LineChart, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-info/5" />
      
      {/* Animated shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-info/5 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Brain className="w-4 h-4" />
            Evidence-Based Learning Intelligence
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            See{" "}
            <span className="gradient-text">Understanding</span>
            <br />
            Not Just Marks
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up stagger-1">
            EduTrace helps schools measure real student understanding, detect concept gaps early, 
            and give teachers actionable insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-2">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => navigate('/auth')}
              className="group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-fade-in stagger-3">
            {[
              { icon: Eye, label: 'Thinking Tracked', value: 'Every Step' },
              { icon: Target, label: 'Gaps Detected', value: 'In Real-time' },
              { icon: LineChart, label: 'Progress Visible', value: 'Over Time' },
              { icon: Brain, label: 'Understanding', value: 'Not Memorization' },
            ].map((stat, i) => (
              <div key={i} className="evidence-card text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-lg font-semibold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
