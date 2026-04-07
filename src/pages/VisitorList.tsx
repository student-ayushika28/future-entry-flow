import { useState } from "react";
import { useVisitors, VisitorStatus } from "@/contexts/VisitorContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const VisitorList = () => {
  const { visitors, updateStatus, deleteVisitor } = useVisitors();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = visitors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || v.status === filter;
    return matchSearch && matchFilter;
  });

  const statusColor = (s: VisitorStatus) =>
    s === "Approved" ? "bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]" :
    s === "Rejected" ? "bg-destructive/20 text-destructive" :
    "bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]";

  const handleApprove = (id: number) => {
    updateStatus(id, "Approved");
    toast({ title: "Visitor Approved", description: "Status updated successfully." });
  };

  const handleReject = (id: number) => {
    updateStatus(id, "Rejected");
    toast({ title: "Visitor Rejected", description: "Status updated.", variant: "destructive" });
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteVisitor(deleteId);
      toast({ title: "Visitor Deleted", description: "Record removed." });
      setDeleteId(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Visitor List</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all visitor records</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Email</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Purpose</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Time</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground">#{v.id}</td>
                    <td className="py-3 px-4 font-medium">{v.name}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{v.email}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{v.purpose}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{new Date(v.dateTime).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge className={`${statusColor(v.status)} border-0 text-xs`}>{v.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.1)]" onClick={() => handleApprove(v.id)} title="Approve">
                          <CheckCircle2 size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleReject(v.id)} title="Reject">
                          <XCircle size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(v.id)} title="Delete">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">No visitors found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle>Delete Visitor</DialogTitle>
            <DialogDescription>Are you sure you want to delete this visitor record? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default VisitorList;
