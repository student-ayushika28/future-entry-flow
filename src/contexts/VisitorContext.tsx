import React, { createContext, useContext, useState, useCallback } from "react";

export type VisitorStatus = "Pending" | "Approved" | "Rejected";

export interface Visitor {
  id: number;
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
  addVisitor: (v: Omit<Visitor, "id" | "status">) => void;
  updateStatus: (id: number, status: VisitorStatus) => void;
  deleteVisitor: (id: number) => void;
}

const today = new Date().toISOString().slice(0, 16);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 16);

const seedVisitors: Visitor[] = [
  { id: 1, name: "Rahul Sharma", email: "rahul@mail.com", phone: "9876543210", purpose: "Campus Tour", personToMeet: "Dr. Mehta", dateTime: today, status: "Approved" },
  { id: 2, name: "Priya Patel", email: "priya@mail.com", phone: "9123456780", purpose: "Interview", personToMeet: "Prof. Singh", dateTime: today, status: "Pending" },
  { id: 3, name: "Amit Kumar", email: "amit@mail.com", phone: "9988776655", purpose: "Document Submission", personToMeet: "Admin Office", dateTime: yesterday, status: "Rejected" },
  { id: 4, name: "Sneha Gupta", email: "sneha@mail.com", phone: "9001122334", purpose: "Meeting", personToMeet: "Dean", dateTime: today, status: "Approved" },
  { id: 5, name: "Vikram Joshi", email: "vikram@mail.com", phone: "9876001234", purpose: "Event Attendance", personToMeet: "HOD CS", dateTime: yesterday, status: "Pending" },
];

const VisitorContext = createContext<VisitorContextType | null>(null);

export const VisitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>(seedVisitors);
  const [nextId, setNextId] = useState(6);

  const addVisitor = useCallback((v: Omit<Visitor, "id" | "status">) => {
    setVisitors(prev => [...prev, { ...v, id: nextId, status: "Pending" }]);
    setNextId(n => n + 1);
  }, [nextId]);

  const updateStatus = useCallback((id: number, status: VisitorStatus) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  }, []);

  const deleteVisitor = useCallback((id: number) => {
    setVisitors(prev => prev.filter(v => v.id !== id));
  }, []);

  return (
    <VisitorContext.Provider value={{ visitors, addVisitor, updateStatus, deleteVisitor }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitors = () => {
  const ctx = useContext(VisitorContext);
  if (!ctx) throw new Error("useVisitors must be within VisitorProvider");
  return ctx;
};
