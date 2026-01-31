"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface HeaderProps {
  lastUpdated: string | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export function DashboardHeader({
  lastUpdated,
  onRefresh,
  isLoading,
}: HeaderProps) {
  return (
    <header className="bg-[#0d0d0d] border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Image
            src="/excuses-logo.svg"
            alt="Excuses to Connect"
            width={140}
            height={70}
            priority
            className="h-12 w-auto"
          />
          <div className="h-8 w-px bg-white/20" />
          <h1 className="text-xl font-heading text-white">
            Email Health
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </span>
          )}
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-brand hover:bg-brand-dark text-white btn-interactive"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>
    </header>
  );
}
