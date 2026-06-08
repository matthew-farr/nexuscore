import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

import {
  Settings2, ShoppingCart, Megaphone, GraduationCap,
  Lightbulb, BookOpen, Shield, Zap, Globe, Users,
  BarChart2, FileText, Star, Home, Layers, Briefcase,
  TrendingUp, HeartPulse, Cpu, Wrench, Mail, Calendar,
  Slack, Github, Linkedin, Twitter, Facebook, Instagram,
  Chrome, Cloud, Database, Lock, Download, Upload, Send,
  Search, Bell, MessageSquare, CheckCircle, AlertCircle,
  Eye, EyeOff, Edit, Trash2, Plus, Minus, Copy,
  Clock, MapPin, Phone, User, LogOut, LogIn,
  PieChart, LineChart, Activity, Inbox, Folder,
  FolderOpen, Archive, Paperclip, HardDrive, Server,
  WifiOff, Volume2, Volume1, Volume, VolumeX, Video,
  VideoOff, Type, Wrench as WrenchAlt, Trello, Tablet,
  Table, Sun, Sunrise, Sunset, Smile, Smartphone,
  Share2, Share, RefreshCw, RotateCcw, RotateCw,
  Repeat, PowerOff, Power, Play, PauseCircle, Pause,
  Package, Maximize2, Maximize, Minimize2, Minimize,
  Menu, Monitor, Mic, MicOff, List, Image, Info,
  HelpCircle, Grid, GitBranch, Gauge, Flag, Filter,
  Target, TrendingDown, AreaChart, DollarSign,
  CreditCard, ShoppingBag, Gift, Tag, Percent, Wallet,
  Banknote, ArrowUpRight, ArrowDownLeft, Box, Package2,
} from "lucide-react";

export const ICON_MAP = {
  // System & UI
  Settings2, Home, Menu, Monitor, Smartphone, Tablet,
  Grid, List, Layers, Box, Package, Package2,
  // Communication
  Mail, MessageSquare, Share, Share2, Slack,
  // Users & Access
  Users, User, LogIn, LogOut, Shield, Lock,
  // Content & Files
  FileText, Folder, FolderOpen, Archive, Paperclip,
  BookOpen, HardDrive, Server, Cloud,
  Database, Download, Upload, Send, Copy,
  // Analytics & Business
  BarChart2, LineChart, PieChart, AreaChart,
  TrendingUp, TrendingDown, Activity,
  // Finance & Commerce
  DollarSign, CreditCard, Banknote, Wallet, 
  ShoppingCart, ShoppingBag, Gift, Tag, Percent,
  ArrowUpRight, ArrowDownLeft,
  // Work & Productivity
  Briefcase, Cpu, Wrench, WrenchAlt, Gauge,
  Zap, Target, Megaphone, Star, Bell,
  // Status & Alerts
  AlertCircle, Flag, Inbox, CheckCircle,
  // Time & Place
  Calendar, Clock, MapPin, Phone,
  // Visibility
  Eye, EyeOff, Search, Info, HelpCircle,
  // Media & Design
  Image, Video, VideoOff, Mic, MicOff,
  Volume, Volume1, Volume2, VolumeX,
  // Edit & Actions
  Edit, Trash2, Plus, Minus,
  // System
  Power, PowerOff, RefreshCw, RotateCw, RotateCcw, Repeat,
  Play, Pause, PauseCircle,
  Maximize, Maximize2, Minimize, Minimize2,
  // Misc
  HeartPulse, GraduationCap, Lightbulb,
  Chrome, Globe, Type, Sun, Sunrise, Sunset, Smile,
  // Browser & Social
  Github, Linkedin, Twitter, Facebook, Instagram,
  Trello, WifiOff,
  // Popular App Aliases (for easy dropdown selection)
  "HubSpot": BarChart2,
  "PowerBI": PieChart,
  "Tableau": LineChart,
  "Looker": AreaChart,
  "Salesforce": Target,
  "Teams": Users,
  "Excel": Table,
  "PowerPoint": Briefcase,
  "Word": FileText,
  "OneDrive": Cloud,
  "SharePoint": Briefcase,
  "Outlook": Mail,
  "Google Analytics": BarChart2,
  "Google Sheets": Grid,
  "Google Drive": Cloud,
  "Jira": Target,
  "Confluence": Briefcase,
  "Asana": CheckCircle,
  "Monday.com": Grid,
  "Notion": BookOpen,
  "Slack": Slack,
  "Discord": Users,
  "Microsoft Teams": Users,
  "Zoom": Video,
  "Google Meet": Video,
  "Figma": Layers,
  "Adobe Creative": Star,
  "Stripe": CreditCard,
  "PayPal": DollarSign,
  "Shopify": ShoppingCart,
  "WooCommerce": ShoppingCart,
  "Marketing": Megaphone,
  "Sales": ShoppingCart,
  "HR": Users,
  "Finance": DollarSign,
  "Operations": Wrench,
  "Engineering": Cpu,
  "Design": Layers,
  "Support": HeartPulse,
  "Development": GitBranch,
  "Project Management": Briefcase,
  "CRM": Target,
  "Collaboration": Users,
  "Documentation": BookOpen,
  "Training": GraduationCap,
  "Knowledge Base": BookOpen,
  "Help Center": HelpCircle,
  "API": Server,
  "Integration": Zap,
  "Automation": Zap,
  "Workflow": Layers,
  "Process": Activity,
  "Compliance": Shield,
  "Risk": Flag,
  "Quality": CheckCircle,
  "Performance": TrendingUp,
  "Growth": TrendingUp,
  "Revenue": DollarSign,
  "Dashboard": Grid,
  "Reports": BarChart2,
};

// Filter active items, optionally by role/dept access
function filterByAccess(items, profile) {
  return items.filter(item => {
    if (!item.is_active) return false;
    const roles = item.allowed_roles;
    const depts = item.allowed_departments;
    const roleOk = !roles || roles.length === 0 || (profile?.role_type && roles.includes(profile.role_type));
    const deptOk = !depts || depts.length === 0 || (profile?.department && depts.includes(profile.department));
    return roleOk && deptOk;
  });
}

// Sort by sort_order then merge with user-hidden prefs
function mergeWithPreferences(items, orderedIds, hiddenIds) {
  // Always filter out items the user has explicitly hidden (unless mandatory)
  let result = items.filter(item => item.is_mandatory || !hiddenIds?.includes(item.id));

  // Apply custom order if the user has one, otherwise fall back to sort_order
  if (orderedIds?.length) {
    const map = Object.fromEntries(result.map(i => [i.id, i]));
    const ordered = orderedIds.filter(id => map[id]).map(id => map[id]);
    // Append any items not yet in the order array
    result.forEach(item => {
      if (!orderedIds.includes(item.id)) ordered.push(item);
    });
    return ordered;
  }

  return [...result].sort((a, b) => (a.sort_order ?? a.default_sort_order ?? 0) - (b.sort_order ?? b.default_sort_order ?? 0));
}

export function useHomepageData() {
  const [profile, setProfile] = useState(null);
  const [quickLinks, setQuickLinks] = useState([]);       // filtered + pref-merged (for display)
  const [allQuickLinks, setAllQuickLinks] = useState([]); // full accessible list (for customise drawer)
  const [hubs, setHubs] = useState([]);                   // filtered + pref-merged (for display)
  const [allHubs, setAllHubs] = useState([]);             // full accessible list (for customise drawer)
  const [widgets, setWidgets] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Load profile first — needed for access filtering
    let p = null;
    try {
      const profileRes = await base44.functions.invoke("getOrCreateProfile", {});
      p = profileRes.data?.profile || null;
    } catch {
      // Profile load failure is non-fatal — fall back to no-profile access rules
    }
    setProfile(p);

    // Load all content sources independently so one failure doesn't break others
    const [qlResult, hubsResult, widgetsResult] = await Promise.allSettled([
      base44.entities.QuickLink.list("sort_order", 200),
      base44.entities.Hub.list("sort_order", 200),
      base44.entities.HomepageWidgetConfig.list("default_sort_order", 50),
    ]);

    const qlRaw = qlResult.status === "fulfilled" ? qlResult.value : [];
    const hubsRaw = hubsResult.status === "fulfilled" ? hubsResult.value : [];
    const widgetsRaw = widgetsResult.status === "fulfilled" ? widgetsResult.value : [];

    const accessQL = filterByAccess(qlRaw, p);
    const accessHubs = filterByAccess(hubsRaw, p);
    const accessWidgets = widgetsRaw.filter(w => w.is_active); // widgets don't have role restrictions yet

    // Load user preferences independently
    let pref = null;
    if (p?.id) {
      try {
        const prefList = await base44.entities.UserHomepagePreference.filter({ user_profile_id: p.id });
        pref = prefList?.[0] || null;
      } catch {
        // Non-fatal
      }
    }
    setPreferences(pref);

    // Store full accessible lists so the drawer can show all toggleable items
    setAllQuickLinks([...accessQL].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    setAllHubs([...accessHubs].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));

    setQuickLinks(mergeWithPreferences(accessQL, pref?.quick_link_order, pref?.hidden_quick_link_ids));
    setHubs(mergeWithPreferences(accessHubs, pref?.hub_order, pref?.hidden_hub_ids));
    setWidgets(mergeWithPreferences(
      accessWidgets,
      pref?.widget_order,
      // widget prefs store keys not ids — convert to ids for consistency
      accessWidgets.filter(w => pref?.hidden_widget_keys?.includes(w.widget_key)).map(w => w.id)
    ));

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function savePreferences(updates) {
    if (!profile?.id) return;
    const merged = { ...preferences, ...updates, user_profile_id: profile.id };
    let saved;
    if (preferences?.id) {
      saved = await base44.entities.UserHomepagePreference.update(preferences.id, merged);
    } else {
      saved = await base44.entities.UserHomepagePreference.create(merged);
    }
    setPreferences(saved);
    await loadAll();
  }

  async function resetPreferences() {
    if (preferences?.id) {
      await base44.entities.UserHomepagePreference.delete(preferences.id);
    }
    setPreferences(null);
    await loadAll();
  }

  return {
    profile, quickLinks, allQuickLinks, hubs, allHubs, widgets, preferences,
    loading, error, reload: loadAll, savePreferences, resetPreferences,
  };
}