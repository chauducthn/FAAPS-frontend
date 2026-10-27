import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      duration={4000}
      visibleToasts={4}
      closeButton={true}
      richColors={false}
      expand={true}
      gap={10}
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-emerald-600 shrink-0 mt-0.5" />
        ),
        info: <InfoIcon className="size-5 text-sky-600 shrink-0 mt-0.5" />,
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-600 shrink-0 mt-0.5" />
        ),
        error: <OctagonXIcon className="size-5 text-red-600 shrink-0 mt-0.5" />,
        loading: (
          <Loader2Icon className="size-5 text-[#F26F21] animate-spin shrink-0 mt-0.5" />
        ),
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast pointer-events-auto relative flex w-full items-start justify-between gap-3 overflow-visible rounded-xl border bg-white pl-4 pr-10 py-3.5 text-sm text-gray-900 shadow-[0_8px_24px_rgba(20,32,51,0.08)] font-sans transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--toast-swipe-movement-x)] data-[swipe=move]:transition-none data-[type=success]:border-emerald-200/80 data-[type=error]:border-red-200/80 data-[type=info]:border-sky-200/80 data-[type=warning]:border-amber-200/80 data-[type=loading]:border-[#F26F21]/30",
          title:
            "font-semibold text-gray-900 text-[13px] leading-snug tracking-tight",
          description:
            "mt-1 text-[12px] leading-relaxed text-gray-500",
          actionButton:
            "inline-flex items-center justify-center rounded-md bg-[#F26F21] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#e05f14] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/40",
          cancelButton:
            "inline-flex items-center justify-center rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200 focus:outline-none",
          closeButton:
            "!absolute !right-1.5 !top-1.5 !left-auto !h-6 !w-6 !translate-x-0 !translate-y-0 !transform-none inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F26F21]/30",
          success:
            "!bg-emerald-50/70 !text-emerald-950 border-emerald-200/80 [&_[data-title]]:text-emerald-900",
          error:
            "!bg-red-50/70 !text-red-950 border-red-200/80 [&_[data-title]]:text-red-900",
          info:
            "!bg-sky-50/70 !text-sky-950 border-sky-200/80 [&_[data-title]]:text-sky-900",
          warning:
            "!bg-amber-50/70 !text-amber-950 border-amber-200/80 [&_[data-title]]:text-amber-900",
          loading:
            "!bg-[#fff7ed] !text-[#151c27] border-[#F26F21]/30 [&_[data-title]]:text-[#151c27]",
          content: "flex-1 min-w-0",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };