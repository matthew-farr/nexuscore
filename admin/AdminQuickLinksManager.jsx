import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "../ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff, Wand2 } from "lucide-react";
import GlassCard from "../ui-custom/GlassCard";
import { ICON_MAP } from "@/hooks/useHomepageData";
import { useTheme } from "../ThemeProvider";

export default function AdminQuickLinksManager() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const links = await base44.entities.QuickLink.list();
      setItems(links);
    } catch (error) {
      console.error("Failed to load quick links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.url) {
      alert("Title and URL are required");
      return;
    }
    try {
      if (editingId) {
        await base44.entities.QuickLink.update(editingId, formData);
      } else {
        await base44.entities.QuickLink.create(formData);
      }
      setEditingId(null);
      setFormData(null);
      await loadItems();
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this quick link?")) {
      try {
        await base44.entities.QuickLink.delete(id);
        await loadItems();
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await base44.entities.QuickLink.update(item.id, { is_active: !item.is_active });
      await loadItems();
    } catch (error) {
      console.error("Failed to toggle:", error);
    }
  };

  const handleAutoAssignIcons = async () => {
    setAssigning(true);
    try {
      const result = await base44.functions.invoke("assignIconsToLinks", {});
      alert(`Updated ${result.data.updated.length} links with icons`);
      await loadItems();
    } catch (error) {
      console.error("Failed to assign icons:", error);
      alert("Failed to assign icons");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Quick Links</h3>
        {!editingId && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleAutoAssignIcons} disabled={assigning}>
              <Wand2 className="w-4 h-4 mr-2" />
              {assigning ? "Assigning..." : "Auto Icons"}
            </Button>
            <Button size="sm" variant="outline" onClick={async () => {
              setAssigning(true);
              try {
                const result = await base44.functions.invoke("updateServiceIcons", {});
                alert(`Updated ${result.data.updated.length} service icons`);
                await loadItems();
              } catch (error) {
                console.error("Failed:", error);
                alert("Failed to update service icons");
              } finally {
                setAssigning(false);
              }
            }} disabled={assigning}>
              <Wand2 className="w-4 h-4 mr-2" />
              Service Icons
            </Button>
            <Button size="sm" onClick={() => { setEditingId("new"); setFormData({ title: "", url: "", icon: "Globe", accent_colour: "#ec2ca3", is_active: true }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
        )}
      </div>

      {editingId && (
        <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border bg-card" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            </div>
            <div>
              <label className="text-xs font-medium">URL</label>
              <input type="text" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border bg-card" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            </div>
            <div>
              <label className="text-xs font-medium">Icon</label>
              <select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border bg-card" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                {Object.keys(ICON_MAP).map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Color</label>
              <input type="color" value={formData.accent_colour || "#ec2ca3"} onChange={(e) => setFormData({ ...formData, accent_colour: e.target.value })} className="w-full mt-1 h-10 rounded-lg cursor-pointer" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} style={{ background: "linear-gradient(135deg, #ec2ca3, #7c3aed)" }}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setFormData(null); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No quick links yet</p>
        ) : (
          items.map(item => {
            const Icon = ICON_MAP[item.icon];
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.accent_colour }}>
                  {Icon && <Icon className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleToggleActive(item)}>
                    {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-4">{items.length} quick links configured</p>
    </GlassCard>
  );
}