import { Calculator, DollarSign, FileText, TrendingUp, Calendar } from "lucide-react";
import VatCalculator from "./tools/VatCalculator";
import PricingCalculator from "./tools/PricingCalculator";
import CustomerPriceListBuilder from "./tools/CustomerPriceListBuilder";
import CommissionEstimator from "./tools/CommissionEstimator";
import DateBetween from "./tools/DateBetween";

// Single source of truth for all sales tools
export const TOOL_REGISTRY = {
  "VAT Calculator":        { key: "vat",        icon: Calculator,  color: "#06b6d4", component: VatCalculator },
  "Pricing Calculator":    { key: "pricing",     icon: DollarSign,  color: "#8b5cf6", component: PricingCalculator },
  "Customer Price List":   { key: "quote",       icon: FileText,    color: "#f59e0b", component: CustomerPriceListBuilder },
  "Commission Estimator":  { key: "commission",  icon: TrendingUp,  color: "#10b981", component: CommissionEstimator },
  "Date Between":          { key: "datebetween", icon: Calendar,    color: "#06b6d4", component: DateBetween },
};

export const COLOUR_MAP = {
  cyan: "#06b6d4",
  purple: "#8b5cf6",
  pink: "#ec2ca3",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#0ea5e9",
};