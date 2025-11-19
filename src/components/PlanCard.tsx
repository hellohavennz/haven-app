import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export type PlanCardFeature = {
  key: string;
  content: ReactNode;
};

type BadgeVariant = "teal" | "amber" | "gray";
type HighlightColor = "teal" | "amber" | "gray";
type ButtonVariant = "dark" | "teal" | "amber" | "outline" | "muted";

export type PlanCardProps = {
  name: string;
  price: string;
  priceNote?: string;
  description?: string;
  features: PlanCardFeature[];
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  highlight?: boolean;
  highlightColor?: HighlightColor;
  icon?: ReactNode;
  badgePosition?: "center" | "right";
  buttonLabel: string;
  buttonVariant?: ButtonVariant;
  buttonIcon?: ReactNode;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  footerNote?: string;
  className?: string;
  featureClassName?: string;
};

const badgeVariantClasses: Record<BadgeVariant, string> = {
  teal: "bg-teal-600 text-white",
  amber: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  gray: "bg-gray-900 text-white",
};

const buttonVariantClasses: Record<ButtonVariant, string> = {
  dark:
    "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200", 
  teal:
    "bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800", 
  amber:
    "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600", 
  outline:
    "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800", 
  muted: "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400",
};

const highlightRingClasses: Record<HighlightColor, string> = {
  teal: "border-teal-300 dark:border-teal-400/60 shadow-xl ring-4 ring-teal-100/80",
  amber: "border-amber-300 dark:border-amber-400/70 shadow-xl ring-4 ring-amber-100/70",
  gray: "border-gray-400 dark:border-gray-500 shadow-xl ring-4 ring-gray-100",
};

export default function PlanCard({
  name,
  price,
  priceNote,
  description,
  features,
  badgeText,
  badgeVariant = "teal",
  highlight = false,
  highlightColor = "teal",
  icon,
  badgePosition = "center",
  buttonLabel,
  buttonVariant = "dark",
  buttonIcon,
  buttonDisabled = false,
  onButtonClick,
  footerNote,
  className = "",
  featureClassName,
}: PlanCardProps) {
  const containerHighlight = highlight ? highlightRingClasses[highlightColor] : "border-gray-200 dark:border-gray-800";
  const resolvedButtonVariant = buttonDisabled ? "muted" : buttonVariant;
  const featureClass = featureClassName ?? "text-gray-700 dark:text-gray-200";

  return (
    <div
      className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 p-8 flex flex-col transition-shadow ${
        containerHighlight
      } ${className}`}
    >
      {badgeText ? (
        <div
          className={`absolute -top-4 ${
            badgePosition === "right" ? "right-4" : "left-1/2 -translate-x-1/2"
          } px-4 py-1 rounded-full text-sm font-semibold ${badgeVariantClasses[badgeVariant]}`}
        >
          {badgeText}
        </div>
      ) : null}

      <div className="text-center mb-6">
        {icon}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{name}</h3>
        <div className="flex items-baseline justify-center gap-2 mb-2">
          <span className="text-5xl font-semibold text-gray-900 dark:text-white">{price}</span>
          {priceNote ? <span className="text-gray-600 dark:text-gray-300">{priceNote}</span> : null}
        </div>
        {description ? <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p> : null}
      </div>

      <ul className="space-y-3 mb-8 flex-1 text-left">
        {features.map(feature => (
          <li key={feature.key} className={featureClass}>
            {feature.content}
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3">
        <button
          type="button"
          disabled={buttonDisabled}
          onClick={buttonDisabled ? undefined : onButtonClick}
          className={`flex items-center justify-center gap-2 w-full px-8 py-4 rounded-xl font-semibold transition-colors ${
            buttonVariantClasses[resolvedButtonVariant]
          }`}
        >
          {buttonLabel}
          {!buttonDisabled ? buttonIcon ?? <ArrowRight size={20} /> : null}
        </button>

        {footerNote ? <p className="text-center text-sm text-gray-500 dark:text-gray-400">{footerNote}</p> : null}
      </div>
    </div>
  );
}
