import { BookOpen, Lightbulb, MessageCircle, Wrench, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    number: "01",
    title: "Concept Explanation",
    description: "Short, focused explanations. No long lectures. Clarity over volume.",
  },
  {
    icon: Lightbulb,
    number: "02",
    title: "Thinking Task",
    description: "Predict, explain, fix, or compare. Students write answers, not just click options.",
  },
  {
    icon: MessageCircle,
    number: "03",
    title: "Reflection Step",
    description: "Students articulate confusion, mistakes, and confidence. This is where gaps become visible.",
  },
  {
    icon: Wrench,
    number: "04",
    title: "Micro Application",
    description: "Apply only this concept. Small, focused tasks that verify real understanding.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">
            The Learning Flow
          </h2>
          <p className="text-xl text-muted-foreground">
            Every concept follows this evidence-capturing structure
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-info to-accent hidden lg:block" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="relative">
                  <div className="evidence-card text-center relative z-10 h-full">
                    {/* Step number */}
                    <div className="text-6xl font-bold text-muted/20 absolute top-4 right-4">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                      <step.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>

                  {/* Arrow for larger screens */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 z-20 w-6 h-6 rounded-full bg-background border border-border items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
