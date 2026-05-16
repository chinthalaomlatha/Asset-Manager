import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useGetScan, getGetScanQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface WatchedScan {
  id: number;
  target: string;
}

interface ScanNotifierContextValue {
  watchScan: (id: number, target: string) => void;
}

const ScanNotifierContext = createContext<ScanNotifierContextValue>({
  watchScan: () => {},
});

export function useScanNotifier() {
  return useContext(ScanNotifierContext);
}

export function ScanNotifierProvider({ children }: { children: React.ReactNode }) {
  const [watched, setWatched] = useState<WatchedScan[]>([]);

  const watchScan = useCallback((id: number, target: string) => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setWatched((prev) => {
      if (prev.some((s) => s.id === id)) return prev;
      return [...prev, { id, target }];
    });
  }, []);

  const removeScan = useCallback((id: number) => {
    setWatched((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <ScanNotifierContext.Provider value={{ watchScan }}>
      {children}
      {watched.map((scan) => (
        <ScanWatcher key={scan.id} id={scan.id} target={scan.target} onDone={removeScan} />
      ))}
    </ScanNotifierContext.Provider>
  );
}

function ScanWatcher({
  id,
  target,
  onDone,
}: {
  id: number;
  target: string;
  onDone: (id: number) => void;
}) {
  const { toast } = useToast();
  const notifiedRef = useRef(false);

  const { data: scan } = useGetScan(id, {
    query: {
      queryKey: getGetScanQueryKey(id),
      refetchInterval: 3000,
    },
  });

  useEffect(() => {
    if (!scan || notifiedRef.current) return;
    if (scan.status !== "completed" && scan.status !== "failed") return;

    notifiedRef.current = true;
    const ok = scan.status === "completed";

    toast({
      title: ok ? "Scan Complete" : "Scan Failed",
      description: ok
        ? `${target} — Score: ${scan.securityScore}/100 · Risk: ${(scan.riskLevel ?? "unknown").toUpperCase()}`
        : `Assessment of ${target} encountered an error.`,
      variant: ok ? "default" : "destructive",
    });

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(
        ok ? "Cyber Scout Pro — Scan Complete" : "Cyber Scout Pro — Scan Failed",
        {
          body: ok
            ? `${target}\nScore: ${scan.securityScore}/100  ·  Risk: ${(scan.riskLevel ?? "unknown").toUpperCase()}`
            : `Assessment of ${target} encountered an error.`,
          icon: "/favicon.ico",
        }
      );
    }

    onDone(id);
  }, [scan, id, target, onDone, toast]);

  return null;
}
