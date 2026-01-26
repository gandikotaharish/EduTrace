import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  BarChart3 
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Thinking Tasks, Not MCQs",
    description: "Students explain, predict, compare, and fix problems. We capture how they think, not just what they click.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: AlertTriangle,
    title: "Gap Detection Engine",
    description: "Automatically identifies false confidence, misconceptions, and missing prerequisites before they compound.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: TrendingUp,
    title: "Dynamic Mastery Scores",
    description: "Mastery scores update based on accuracy, confidence alignment, improvement trends, and explanation quality.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: MessageSquare,
    title: "Reflection Capture",
    description: "Students articulate confusion points and mistakes. This data reveals what assessments miss.",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Users,
    title: "Teacher Intervention Signals",
    description: "Clear dashboards show which students need attention and which concepts need re-teaching.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: BarChart3,
    title: "Class Concept Heatmaps",
    description: "Visual overview of entire class understanding. Spot weak concepts and struggling students instantly.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Replace Guesswork with{" "}
            <span className="gradient-text">Learning Intelligence</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Traditional systems measure results. EduTrace measures learning itself.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="evidence-card group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
