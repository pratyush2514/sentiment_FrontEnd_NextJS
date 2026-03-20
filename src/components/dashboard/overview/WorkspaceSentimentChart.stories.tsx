import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { WorkspaceSentimentChart } from "./WorkspaceSentimentChart";
import type { TrendPoint } from "@/lib/hooks/useSentimentTrends";

const meta = {
  title: "Dashboard/Workspace Sentiment Chart",
  component: WorkspaceSentimentChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof WorkspaceSentimentChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();
function daysAgo(days: number) {
  return new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
}

const trendData: TrendPoint[] = [
  { timestamp: daysAgo(13), positive: 0.66, neutral: 0.22, negative: 0.12, highRisk: 1, total: 42 },
  { timestamp: daysAgo(12), positive: 0.64, neutral: 0.24, negative: 0.12, highRisk: 1, total: 44 },
  { timestamp: daysAgo(11), positive: 0.61, neutral: 0.27, negative: 0.12, highRisk: 0, total: 39 },
  { timestamp: daysAgo(10), positive: 0.58, neutral: 0.29, negative: 0.13, highRisk: 0, total: 48 },
  { timestamp: daysAgo(9), positive: 0.38, neutral: 0.34, negative: 0.28, highRisk: 3, total: 52 },
  { timestamp: daysAgo(8), positive: 0.31, neutral: 0.31, negative: 0.38, highRisk: 4, total: 58 },
  { timestamp: daysAgo(7), positive: 0.42, neutral: 0.33, negative: 0.25, highRisk: 2, total: 47 },
  { timestamp: daysAgo(6), positive: 0.47, neutral: 0.31, negative: 0.22, highRisk: 2, total: 43 },
  { timestamp: daysAgo(5), positive: 0.56, neutral: 0.25, negative: 0.19, highRisk: 1, total: 51 },
  { timestamp: daysAgo(4), positive: 0.60, neutral: 0.23, negative: 0.17, highRisk: 1, total: 45 },
  { timestamp: daysAgo(3), positive: 0.62, neutral: 0.22, negative: 0.16, highRisk: 0, total: 40 },
  { timestamp: daysAgo(2), positive: 0.67, neutral: 0.20, negative: 0.13, highRisk: 0, total: 41 },
  { timestamp: daysAgo(1), positive: 0.70, neutral: 0.18, negative: 0.12, highRisk: 0, total: 44 },
  { timestamp: daysAgo(0), positive: 0.72, neutral: 0.17, negative: 0.11, highRisk: 0, total: 49 },
];

const trendRanges = [
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
];

export const WithTrendRange: Story = {
  args: {
    data: trendData,
    isLoading: false,
    trendRange: 14,
    onTrendRangeChange: fn(),
    trendRanges,
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    data: undefined,
    isLoading: true,
  },
};
