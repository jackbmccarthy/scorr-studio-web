import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface HeadToHeadCardProps {
  team1: {
    id: string;
    name: string;
    logoUrl?: string;
    wins: number;
  };
  team2: {
    id: string;
    name: string;
    logoUrl?: string;
    wins: number;
  };
  totalMatches: number;
  draws: number;
  recentMatches?: {
    date: string;
    winnerId?: string;
    score: string;
  }[];
  className?: string;
}

export function HeadToHeadCard({ team1, team2, totalMatches, draws, recentMatches, className }: HeadToHeadCardProps) {
  const chartData = [
    { name: team1.name, value: team1.wins, color: '#3b82f6' }, // blue-500
    { name: 'Draw', value: draws, color: '#6b7280' }, // gray-500
    { name: team2.name, value: team2.wins, color: '#ef4444' }, // red-500
  ].filter(d => d.value > 0);

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader>
        <CardTitle className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">Head to Head</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparison Header */}
        <div className="flex justify-between items-center px-4">
          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-500">
              {team1.logoUrl ? <img src={team1.logoUrl} className="h-full w-full object-cover rounded-full" /> : team1.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{team1.wins}</div>
              <div className="text-xs text-muted-foreground">Wins</div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-1/3 h-[100px]">
             {/* Simple Donut Chart */}
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={chartData}
                   cx="50%"
                   cy="50%"
                   innerRadius={25}
                   outerRadius={40}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="text-xs font-mono text-muted-foreground mt-1">{totalMatches} Matches</div>
          </div>

          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center font-bold text-red-500">
              {team2.logoUrl ? <img src={team2.logoUrl} className="h-full w-full object-cover rounded-full" /> : team2.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{team2.wins}</div>
              <div className="text-xs text-muted-foreground">Wins</div>
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        {recentMatches && recentMatches.length > 0 && (
          <div className="border-t border-border/50 pt-4">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 px-2">Recent Encounters</h4>
            <div className="space-y-2">
              {recentMatches.map((match, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-2 py-1 hover:bg-secondary/10 rounded">
                  <span className="text-muted-foreground text-xs">{format(new Date(match.date), "MMM d, yyyy")}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={match.winnerId === team1.id ? "default" : "outline"} className={match.winnerId === team1.id ? "bg-blue-500 hover:bg-blue-600" : ""}>
                      {team1.name}
                    </Badge>
                    <span className="font-mono text-xs">{match.score}</span>
                    <Badge variant={match.winnerId === team2.id ? "default" : "outline"} className={match.winnerId === team2.id ? "bg-red-500 hover:bg-red-600" : ""}>
                      {team2.name}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
