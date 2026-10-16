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
      className="toaster group"
      closeButton={true}
      richColors={false}
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-emerald-600 shrink-0 mt-0.5" />
        ),
        info: <InfoIcon className="size-5 text-blue-600 shrink-0 mt-0.5" />,
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-600 shrink-0 mt-0.5" />
        ),
        error: <OctagonXIcon className="size-5 text-red-600 shrink-0 mt-0.5" />,
        loading: (
          <Loader2Icon className="size-5 text-orange-600 animate-spin shrink-0 mt-0.5" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200/80 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:gap-3 font-sans border text-sm flex items-start w-full relative overflow-hidden transition-all",
          title: "font-semibold text-gray-900 text-sm leading-snug",
          description: "text-gray-500 text-xs mt-1 leading-relaxed",
          actionButton:
            "group-[.toast]:bg-orange-600 group-[.toast]:text-white font-medium rounded-lg text-xs px-3 py-1.5 hover:bg-orange-700 transition-colors shadow-sm",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 font-medium rounded-lg text-xs px-3 py-1.5 hover:bg-gray-200 transition-colors",
          closeButton:
            "!bg-white !text-gray-400 hover:!text-gray-700 !border-gray-200 hover:!bg-gray-100 !left-auto !right-2 !top-2 transition-all cursor-pointer shadow-sm rounded-full !w-6 !h-6 flex items-center justify-center",
          success:
            "group-[.toaster]:border-emerald-200/80 group-[.toaster]:bg-emerald-50/50 group-[.toaster]:text-emerald-950",
          error:
            "group-[.toaster]:border-red-200/80 group-[.toaster]:bg-red-50/60 group-[.toaster]:text-red-950",
          info: "group-[.toaster]:border-blue-200/80 group-[.toaster]:bg-blue-50/50 group-[.toaster]:text-blue-950",
          warning:
            "group-[.toaster]:border-amber-200/80 group-[.toaster]:bg-amber-50/50 group-[.toaster]:text-amber-950",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
