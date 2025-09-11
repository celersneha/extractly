import { HomeView } from "@/components/home/home-view";
import DashboardLayout from "./layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <HomeView />
    </DashboardLayout>
  );
}
