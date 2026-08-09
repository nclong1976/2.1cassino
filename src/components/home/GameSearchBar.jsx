import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GameSearchBar({ onDebouncedChange, t }) {
  const [local, setLocal] = useState("");

  useEffect(() => {
    const id = setTimeout(() => onDebouncedChange(local), 300);
    return () => clearTimeout(id);
  }, [local, onDebouncedChange]);

  return (
    <div className="relative px-4 mb-1">
      <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={t("search")}
        className="pl-10 bg-[#1e1832]/80 border-[#323b51] text-white placeholder:text-white/40"
      />
    </div>
  );
}