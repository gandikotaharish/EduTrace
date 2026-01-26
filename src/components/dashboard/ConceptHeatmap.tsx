import { Concept, User, ConceptMastery } from "@/types";
import { getMasteryColorClass } from "@/data/sampleData";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConceptHeatmapProps {
  concepts: Concept[];
  students: User[];
  masteryData: ConceptMastery[];
}

export function ConceptHeatmap({ concepts, students, masteryData }: ConceptHeatmapProps) {
  const getMasteryForCell = (studentId: string, conceptId: string) => {
    return masteryData.find(m => m.studentId === studentId && m.conceptId === conceptId);
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Header row with concept names */}
        <div className="flex gap-1 mb-2">
          <div className="w-32 shrink-0" /> {/* Empty cell for student names column */}
          {concepts.slice(0, 6).map((concept) => (
            <Tooltip key={concept.id}>
              <TooltipTrigger asChild>
                <div className="w-12 h-8 flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground truncate px-1 -rotate-45 origin-center">
                    {concept.name.split(' ')[0]}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{concept.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Student rows */}
        {students.map((student) => (
          <div key={student.id} className="flex gap-1 mb-1">
            <div className="w-32 shrink-0 flex items-center">
              <span className="text-sm font-medium truncate">{student.name}</span>
            </div>
            {concepts.slice(0, 6).map((concept) => {
              const mastery = getMasteryForCell(student.id, concept.id);
              const score = mastery?.masteryScore ?? 0;
              
              return (
                <Tooltip key={`${student.id}-${concept.id}`}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "w-12 h-8 rounded-md heatmap-cell cursor-pointer transition-all",
                        mastery ? getMasteryColorClass(score) : "bg-muted"
                      )}
                      style={{
                        opacity: mastery ? 0.4 + (score / 100) * 0.6 : 0.2
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{concept.name}</p>
                      <p className="text-lg font-bold mt-1">
                        {mastery ? `${score}%` : 'Not started'}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Mastery Level:</span>
          <div className="flex items-center gap-2">
            {[
              { label: 'Expert', color: 'bg-emerald-500' },
              { label: 'Proficient', color: 'bg-teal-500' },
              { label: 'Developing', color: 'bg-amber-500' },
              { label: 'Emerging', color: 'bg-orange-500' },
              { label: 'Novice', color: 'bg-red-500' },
            ].map((level) => (
              <div key={level.label} className="flex items-center gap-1">
                <div className={cn("w-4 h-4 rounded", level.color)} />
                <span className="text-xs text-muted-foreground">{level.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
