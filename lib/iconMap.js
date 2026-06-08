import {
  Eye, Plus, Edit, Trash2, CheckCircle, UserPlus, Send, Upload, Bell, BookOpen, LogIn, Zap,
  Home, Settings, Users, FileText, Layers, Calendar, BarChart3, AlertCircle, Activity, Sparkles,
  ArrowRight, Star, Lock, Unlock, Clock, Bookmark, Share2, Download, RefreshCw, Filter,
  Search, Menu, X, ChevronDown, ChevronRight, ChevronUp, ChevronLeft, Maximize, Minimize,
  HelpCircle, Info, AlertTriangle, Loader, Grid, List, MoreHorizontal, MoreVertical,
  Copy, Save, RotateCcw, MapPin, Mail, Phone, Globe, Database,
  Cpu, HardDrive, Server, Shield, Key, EyeOff,
} from "lucide-react";

const ICON_MAP = {
  // Core
  Eye: Eye,
  EyeOff: EyeOff,
  Activity: Activity,
  
  // CRUD
  Plus: Plus,
  Edit: Edit,
  Trash2: Trash2,
  Download: Download,
  Upload: Upload,
  Copy: Copy,
  Save: Save,
  
  // Status
  CheckCircle: CheckCircle,
  AlertCircle: AlertCircle,
  AlertTriangle: AlertTriangle,
  Loading: Loader,
  
  // User
  UserPlus: UserPlus,
  Users: Users,
  Lock: Lock,
  Unlock: Unlock,
  Key: Key,
  Shield: Shield,
  
  // Navigation
  Home: Home,
  ArrowRight: ArrowRight,
  ChevronDown: ChevronDown,
  ChevronRight: ChevronRight,
  ChevronUp: ChevronUp,
  ChevronLeft: ChevronLeft,
  Menu: Menu,
  X: X,
  
  // Content
  FileText: FileText,
  BookOpen: BookOpen,
  Calendar: Calendar,
  Layers: Layers,
  Grid: Grid,
  List: List,
  
  // Organization
  Settings: Settings,
  BarChart3: BarChart3,
  Filter: Filter,
  Search: Search,
  
  // Actions
  Send: Send,
  Share2: Share2,
  Bookmark: Bookmark,
  Sparkles: Sparkles,
  Zap: Zap,
  
  // System
  Bell: Bell,
  Clock: Clock,
  Cpu: Cpu,
  Database: Database,
  Server: Server,
  HardDrive: HardDrive,
  Globe: Globe,
  
  // Contact
  Mail: Mail,
  Phone: Phone,
  MapPin: MapPin,
  
  // UI
  HelpCircle: HelpCircle,
  Info: Info,
  Maximize: Maximize,
  Minimize: Minimize,
  MoreHorizontal: MoreHorizontal,
  MoreVertical: MoreVertical,
  RefreshCw: RefreshCw,
  RotateCcw: RotateCcw,
  
  // Login
  LogIn: LogIn,
  
  // Training
  Star: Star,
};

export function getIconComponent(iconName) {
  if (!iconName) return null;
  return ICON_MAP[iconName] || null;
}

export default ICON_MAP;