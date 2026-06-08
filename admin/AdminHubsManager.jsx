import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "../ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import GlassCard from "../ui-custom/GlassCard";
import { ICON_MAP } from "@/hooks/useHomepageData";
import { useTheme } from "../ThemeProvider";

export default function AdminHubsManager() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const hubs = await base44.entities.Hub.list();
      setItems(hubs);
    } catch (error) {
      console.error("Failed to load hubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.route) {
      alert("Name and route are required");
      return;
    }
    try {
      if (editingId) {
        await base44.entities.Hub.update(editingId, formData);
      } else {
        await base44.entities.Hub.create(formData);
      }
      setEditingId(null);
      setFormData(null);
      await loadItems();
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this hub?")) {
      try {
        await base44.entities.Hub.delete(id);
        await loadItems();
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await base44.entities.Hub.update(item.id, { is_active: !item.is_active });
      await loadItems();
    } catch (error) {
      console.error("Failed to toggle:", error);
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
        <h3 className="font-semibold">Hubs</h3>
        {!editingId && (
          <Button size="sm" onClick={() => { setEditingId("new"); setFormData({ name: "", route: "/", icon: "Layers", accent_colour: "#0ea5e9", is_active: true }); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Hub
          </Button>
        )}
      </div>

      {editingId && (
        <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border bg-card" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            </div>
            <div>
              <label className="text-xs font-medium">Route</label>
              <input type="text" value={formData.route} onChange={(e) => setFormData({ ...formData, route: e.target.value })} placeholder="/hub-name" className="w-full mt-1 px-3 py-2 rounded-lg border bg-card" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            </div>
            <div>
              <label className="text-xs font-medium">Description</label>
              <input type="text" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border bg-card" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            </div>
            <div>
              <label className="text-xs font-medium">Icon</label>
              <select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border bg-card" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                {Object.keys(ICON_MAP).map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Color</label>
              <input type="color" value={formData.accent_colour || "#0ea5e9"} onChange={(e) => setFormData({ ...formData, accent_colour: e.target.value })} className="w-full mt-1 h-10 rounded-lg cursor-pointer" />
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
          <p className="text-sm text-muted-foreground py-4">No hubs yet</p>
        ) : (
          items.map(item => {
            const Icon = ICON_MAP[item.icon];
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.accent_colour }}>
                  {Icon && <Icon className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.route}</p>
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
      <p className="text-xs text-muted-foreground mt-4">{items.length} hubs configured</p>
    </GlassCard>
  );
}