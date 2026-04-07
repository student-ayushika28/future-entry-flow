import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type VisitorStatus = "Pending" | "Approved" | "Rejected";

export interface Visitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  personToMeet: string;
  dateTime: string;
  status: VisitorStatus;
}

interface VisitorContextType {
  visitors: Visitor[];
  loading: boolean;
  addVisitor: (v: Omit<Visitor, "id" | "status">) => Promise<void>;
  updateStatus: (id: string, status: VisitorStatus) => Promise<void>;
  deleteVisitor: (id: string) => Promise<void>;
  refreshVisitors: () => Promise<void>;
}

const VisitorContext = createContext<VisitorContextType | null>(null);

const mapRow = (row: any): Visitor => ({
  id: row.id,
  name: row.name,
  email: row.email || "N/A",
  phone: row.phone,
  purpose: row.purpose,
  personToMeet: row.person_to_meet || "General",
  dateTime: row.date_time,
  status: row.status as VisitorStatus,
});

export const VisitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshVisitors = useCallback(async () => {
    const { data, error } = await supabase
      .from("visitors")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setVisitors(data.map(mapRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshVisitors();

    // Real-time subscription
    const channel = supabase
      .channel("visitors-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, () => {
        refreshVisitors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshVisitors]);

  const addVisitor = useCallback(async (v: Omit<Visitor, "id" | "status">) => {
    await supabase.from("visitors").insert({
      name: v.name,
      email: v.email || "N/A",
      phone: v.phone,
      purpose: v.purpose,
      person_to_meet: v.personToMeet,
      date_time: v.dateTime,
      status: "Pending",
    });
  }, []);

  const updateStatus = useCallback(async (id: string, status: VisitorStatus) => {
    await supabase.from("visitors").update({ status }).eq("id", id);
  }, []);

  const deleteVisitor = useCallback(async (id: string) => {
    await supabase.from("visitors").delete().eq("id", id);
  }, []);

  return (
    <VisitorContext.Provider value={{ visitors, loading, addVisitor, updateStatus, deleteVisitor, refreshVisitors }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitors = () => {
  const ctx = useContext(VisitorContext);
  if (!ctx) throw new Error("useVisitors must be within VisitorProvider");
  return ctx;
};
