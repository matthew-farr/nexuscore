import { ROADMAP_TYPES, QUARTER_OPTIONS, STATUSES } from "@/lib/roadmapConfig";

const ACCENT = "#8b5cf6";

export default function RoadmapItemForm({ formData, setFormData, isDark, labelStyle, inputStyle, isReadOnly = false }) {
  if (isReadOnly) {
    return (
      <div className="space-y-4">
        <div>
          <p style={labelStyle}>Title</p>
          <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
            {formData.title}
          </p>
        </div>

        <div>
          <p style={labelStyle}>Description</p>
          <p className="text-sm leading-relaxed" style={{ color: isDark ? "#ffffff" : "#000000" }}>
            {formData.description || "—"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p style={labelStyle}>Roadmap Type</p>
            <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {formData.roadmap_type}
            </p>
          </div>
          <div>
            <p style={labelStyle}>Quarter</p>
            <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {formData.quarter}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p style={labelStyle}>Status</p>
            <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {formData.status || "Planned"}
            </p>
          </div>
          <div>
            <p style={labelStyle}>Display Order</p>
            <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {formData.sort_order ?? 0}
            </p>
          </div>
        </div>

        {formData.start_date && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p style={labelStyle}>Start Date</p>
              <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                {new Date(formData.start_date).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div>
              <p style={labelStyle}>End Date</p>
              <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                {formData.end_date ? new Date(formData.end_date).toLocaleDateString("en-GB") : "—"}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label style={labelStyle}>Title *</label>
        <input
          style={inputStyle}
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Customer Portal Redesign"
        />
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
          value={formData.description || ""}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Short description shown on the roadmap…"
        />
      </div>

      <div>
        <label style={labelStyle}>Roadmap Type</label>
        <select
          style={inputStyle}
          value={formData.roadmap_type}
          onChange={e => setFormData({ ...formData, roadmap_type: e.target.value })}
        >
          {ROADMAP_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Quarter</label>
        <select
          style={inputStyle}
          value={formData.quarter}
          onChange={e => setFormData({ ...formData, quarter: e.target.value })}
        >
          {QUARTER_OPTIONS.map(q => (
            <option key={q.value} value={q.value}>{q.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Status</label>
        <select
          style={inputStyle}
          value={formData.status || "Planned"}
          onChange={e => setFormData({ ...formData, status: e.target.value })}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            style={inputStyle}
            value={formData.start_date || ""}
            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>End Date</label>
          <input
            type="date"
            style={inputStyle}
            value={formData.end_date || ""}
            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Display Order</label>
        <input
          type="number"
          style={inputStyle}
          value={formData.sort_order ?? 0}
          onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
          min={0}
        />
      </div>
    </div>
  );
}