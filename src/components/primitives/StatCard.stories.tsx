import { IconActivity, IconHeartbeat, IconMoodSmile } from "@tabler/icons-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatCard } from "./StatCard";

const meta = {
  title: "Primitives/Stat Card",
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveChannels: Story = {
  args: {
    label: "Active Channels",
    value: "18",
    icon: IconActivity,
    iconColor: "var(--theme-accent)",
  },
};

export const TeamHealth: Story = {
  args: {
    label: "Team Health",
    value: "82%",
    icon: IconHeartbeat,
    iconColor: "var(--theme-status-success)",
  },
};

export const Loading: Story = {
  args: {
    label: "Avg. Sentiment",
    value: "0.74",
    icon: IconMoodSmile,
    iconColor: "var(--theme-status-warning)",
    loading: true,
  },
};
