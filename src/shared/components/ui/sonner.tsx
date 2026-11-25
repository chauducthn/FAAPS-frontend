import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

/**
 * Toast (thông báo tức thì) — Design System:
 *   • Nền đặc (không trong suốt), KHÔNG blur, KHÔNG backdrop-filter ⇒ chữ luôn rõ nét.
 *   • Success dùng nền xanh lá nhạt (#ECFDF5); các loại khác dùng nền trắng (#FFFFFF).
 *   • Viền 1px theo tone + shadow-md (đổ bóng nhẹ, có offset + blur mềm).
 *   • Text tiêu đề #1A1A1A (đen), text mô tả #374151 ⇒ tương phản ≥ 4.5:1.
 *   • Bo góc 12px (rounded-xl), icon rõ nét, không dùng gradient mờ.
 */
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
      // `expand` làm các toast khác mờ dần (opacity) — bỏ đi để mọi toast đều đọc được.
      expand={false}
      gap={10}
      icons={{
        success: <CircleCheckIcon className="size-5 shrink-0 mt-0.5 text-emerald-600" aria-hidden />,
        info: <InfoIcon className="size-5 shrink-0 mt-0.5 text-sky-600" aria-hidden />,
        warning: <TriangleAlertIcon className="size-5 shrink-0 mt-0.5 text-amber-600" aria-hidden />,
        error: <OctagonXIcon className="size-5 shrink-0 mt-0.5 text-red-600" aria-hidden />,
        loading: <Loader2Icon className="size-5 shrink-0 mt-0.5 text-[#F37021] animate-spin" aria-hidden />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast pointer-events-auto relative flex w-full items-start justify-between gap-3 overflow-visible rounded-xl border bg-white pl-4 pr-10 py-3.5 text-sm text-[#1A1A1A] font-sans shadow-md transition-transform data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--toast-swipe-movement-x)] data-[swipe=move]:transition-none data-[type=success]:border-emerald-200 data-[type=error]:border-red-200 data-[type=info]:border-sky-200 data-[type=warning]:border-amber-200 data-[type=loading]:border-[#F37021]/40",
          title: "font-bold text-[#1A1A1A] text-[13px] leading-snug tracking-tight",
          description: "mt-1 text-[12px] font-medium leading-relaxed text-[#374151]",
          actionButton:
            "inline-flex cursor-pointer items-center justify-center rounded-md bg-[#F37021] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#d95f14] focus:outline-none focus:ring-2 focus:ring-[#F37021]/40",
          cancelButton:
            "inline-flex cursor-pointer items-center justify-center rounded-md bg-[#F3F4F6] px-3 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:bg-[#E5E7EB] focus:outline-none",
          closeButton:
            "!absolute !right-1.5 !top-1.5 !left-auto !h-6 !w-6 !translate-x-0 !translate-y-0 !transform-none inline-flex cursor-pointer items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] shadow-sm transition-colors hover:bg-[#FAFAFA] hover:text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F37021]/30",
          // Success: nền xanh lá nhạt đặc (không /70 ⇒ không mờ).
          success: "!bg-[#ECFDF5] !text-[#1A1A1A] border-emerald-200 [&_[data-title]]:text-[#1A1A1A] [&_[data-description]]:text-[#374151]",
          error: "!bg-white !text-[#1A1A1A] border-red-200 [&_[data-title]]:text-[#1A1A1A] [&_[data-description]]:text-[#374151]",
          info: "!bg-white !text-[#1A1A1A] border-sky-200 [&_[data-title]]:text-[#1A1A1A] [&_[data-description]]:text-[#374151]",
          warning: "!bg-white !text-[#1A1A1A] border-amber-200 [&_[data-title]]:text-[#1A1A1A] [&_[data-description]]:text-[#374151]",
          loading: "!bg-white !text-[#1A1A1A] border-[#F37021]/40 [&_[data-title]]:text-[#1A1A1A] [&_[data-description]]:text-[#374151]",
          content: "flex-1 min-w-0",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
