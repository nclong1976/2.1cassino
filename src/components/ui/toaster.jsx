import { useToast } from "@/components/ui/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const CONF = {
  success: { icon: CheckCircle2, ring: "border-emerald-500/40", bar: "bg-emerald-500", iconColor: "text-emerald-400" },
  destructive: { icon: XCircle, ring: "border-red-500/40", bar: "bg-red-500", iconColor: "text-red-400" },
  warning: { icon: AlertTriangle, ring: "border-amber-500/40", bar: "bg-amber-500", iconColor: "text-amber-400" },
  default: { icon: Info, ring: "border-sky-500/40", bar: "bg-sky-500", iconColor: "text-sky-400" },
};

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div
      className="fixed left-0 right-0 z-[100] px-3 flex flex-col gap-2 sm:inset-x-auto sm:right-3 sm:max-w-[420px]"
      style={{ bottom: "calc(60px + 12px)" }}
    >
      <AnimatePresence>
        {toasts.filter((t) => t.open !== false).map((t) => {
          const c = CONF[t.variant] || CONF.default;
          const Icon = c.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 120, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 80) dismiss(t.id); }}
              className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border ${c.ring} bg-[#0d1226]/95 backdrop-blur-md p-3.5 pr-9 shadow-xl`}
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar}`} />
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${c.iconColor}`} />
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-white text-sm font-semibold leading-snug">{t.title}</p>}
                {t.description && <p className="text-white/75 text-[12px] mt-0.5 leading-snug">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="absolute right-2 top-2 text-white/40 hover:text-white" aria-label="Đóng">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}