import { Suspense } from "react";
import { SetupScreen } from "@/components/setup/SetupScreen";

export const metadata = {
  title: "Setting up — PulseBoard",
};

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[760px]" />}>
      <SetupScreen />
    </Suspense>
  );
}
