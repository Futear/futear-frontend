"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Medal,
  Award,
  Users,
  Shield,
  CalendarRange,
  CalendarDays,
  CalendarClock,
  Crown,
  ChevronDown,
} from "lucide-react";
import { useRankings } from "@/hooks/rankings/useRankings";
import { useRankingData } from "@/hooks/rankings/useRankingData";
import { CLUB_LIST } from "@/config/club";

const MAX_VISIBLE = 20;

export default function Rankings() {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [selectedType, setSelectedType] = useState("users");
  const [selectedClub, setSelectedClub] = useState(CLUB_LIST[0].id);
  const [clubDropdownOpen, setClubDropdownOpen] = useState(false);

  const { rankings, loading, error } = useRankings();

  const data = useRankingData(
    rankings,
    selectedPeriod,
    selectedType,
    selectedType === "clubUsers" ? selectedClub : null,
  );

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="font-bold text-[var(--text)]">#{rank}</span>;
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <Tabs
        value={selectedType}
        onValueChange={(v) => {
          setSelectedType(v);
          setClubDropdownOpen(false);
        }}
        className="flex flex-col flex-1"
      >
        <TabsList className="grid grid-cols-3 gap-2 bg-[var(--secondary)]">
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-[var(--primary)]"
          >
            <Users className="h-4 w-4" /> Usuarios
          </TabsTrigger>

          <div className="relative">
            <TabsTrigger
              value="clubUsers"
              onClick={() => setClubDropdownOpen((p) => !p)}
              className="data-[state=active]:bg-[var(--primary)]"
            >
              <Shield className="h-4 w-4" />
              {CLUB_LIST.find((c) => c.id === selectedClub)?.fanBase}
              <ChevronDown className="h-3 w-3" />
            </TabsTrigger>

            {clubDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-[var(--background)] shadow">
                {CLUB_LIST.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedClub(c.id);
                      setClubDropdownOpen(false);
                    }}
                    className="cursor-pointer px-3 py-2 hover:bg-[var(--primary)]"
                  >
                    {c.fanBase}
                  </div>
                ))}
              </div>
            )}
          </div>

          <TabsTrigger
            value="clubs"
            className="data-[state=active]:bg-[var(--primary)]"
          >
            <Shield className="h-4 w-4" /> Clubes
          </TabsTrigger>
        </TabsList>

        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <TabsList className="grid grid-cols-3 gap-2 bg-[var(--secondary)]">
            <TabsTrigger
              value="weekly"
              className="data-[state=active]:bg-[var(--primary)]"
            >
              <CalendarRange className="h-3 w-3" /> Semanal
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-[var(--primary)]"
            >
              <CalendarDays className="h-3 w-3" /> Mensual
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="data-[state=active]:bg-[var(--primary)]"
            >
              <CalendarClock className="h-3 w-3" /> Anual
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value={selectedPeriod}
            className="flex-1 overflow-hidden"
          >
            <RankingContent data={data} loading={loading} rankIcon={rankIcon} />
          </TabsContent>
        </Tabs>
      </Tabs>
    </div>
  );
}

function RankingContent({ data, loading, rankIcon }) {
  if (loading) {
    return <div className="p-6">Cargando rankings...</div>;
  }

  if (!data?.length) {
    return <div className="p-6">Sin datos</div>;
  }

  const points = (e) => e.totalPoints ?? e.periodPoints ?? 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Podio */}
      <div className="grid grid-cols-3 gap-3">
        {data.slice(0, 3).map((e) => (
          <Card key={e.rank} className="text-center">
            <CardContent className="flex flex-col items-center gap-2 p-4">
              {rankIcon(e.rank)}
              <Avatar className="h-8 w-8">
                {e.image ? (
                  <AvatarImage src={e.image} />
                ) : e.logo ? (
                  <img src={e.logo} alt={e.name} />
                ) : (
                  <AvatarFallback>{e.name?.[0]}</AvatarFallback>
                )}
              </Avatar>
              <div className="font-semibold">{e.name}</div>
              <Badge>{points(e)} pts</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {data.slice(3, MAX_VISIBLE).map((e) => (
          <Card key={e.rank}>
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                {rankIcon(e.rank)}
                <Avatar className="h-8 w-8">
                  {e.image ? (
                    <AvatarImage src={e.image} />
                  ) : e.logo ? (
                    <img src={e.logo} alt={e.name} />
                  ) : (
                    <AvatarFallback>{e.name?.[0]}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs opacity-70">Total {points(e)}</div>
                </div>
              </div>
              <Badge variant="secondary">+{e.periodPoints ?? 0}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
