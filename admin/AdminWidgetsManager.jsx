import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "../ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import GlassCard from "../ui-custom/GlassCard";
import { useTheme } from "../ThemeProvider";

const WIDGET_TYPES = ["quick_links", "hubs", "recent", "bookmarks", "calendar", "news", "custom"];

export default function AdminWidgetsManager() {
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
      const widgets = await base44.entities.HomepageWidgetConfig.list();
      setItems(widgets);
    } catch (error) {
      console.error("Failed to load widgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
  };

  const handleSave = async () => {
    if (!formData.widget_key || !formData.widget_title || !formData.widget_type) {
      alert("Key, title, and type are required");
      return;
    }
    try {
      if (editingId) {
        await base44.entities.HomepageWidgetConfig.update(editingId, formData);
      } else {
        await base44.entities.HomepageWidgetConfig.create(formData);
      }
      setEditingId(null);
      setFormData(null);
      await loadItems();
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this widget?")) {
      try {
        await base44.entities.HomepageWidgetConfig.delete(id);
        await loadItems();
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await base44.entities.HomepageWidgetConfig.update(item.id, { is_active: !item.is_active });
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
        <h3 className="font-semibold">Widgets</h3>
        {!editingId && (
          <Button size="sm" onClick={() => { setEditingId("new"); setFormData({ widget_key: "", widget_title: "", widget_type: "custom", is_active: true, default_visible: true, default_sort_order: 0 }); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        )}
      </div>

      {editingId && (
        <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Key</label>
              <input type="text" value={formData.widget_key} onChange={(e) => setFormData({ ...formData, widget_key: e.target.value })} placeholder="e.g. quick_links_main" className="w-full mt-1 px-3 py-2 rounded-lg border bg-card" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            </div>
            <div>
              <label className="text-xs font-medium">Title</label>
              <input type="text" value={formData.widget_title} onChange={(e) => setFormData({ ...formData, widget_title: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border bg-card" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            </div>
            <div>
              <label className="text-xs font-medium">Type</label>
              <select value={formData.widget_type} onChange={(e) => setFormData({ ...formData, widget_type: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border bg-card" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                {WIDGET_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
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
          <p className="text-sm text-muted-foreground py-4">No widgets yet</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.widget_title}</p>
                <p className="text-xs text-muted-foreground">{item.widget_type}</p>
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
          ))
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-4">{items.length} widgets configured</p>
    </GlassCard>
  );
}