import { IconFilter } from "@tabler/icons-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import FilterBar from "./FilterBar";
import FilterPill from "./FilterPill";

const meta = {
  title: "Primitives/Filters",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ToolbarRow: Story = {
  args: {
    label: "Filters",
    icon: <IconFilter size={10} />,
    children: <></>,
  },
  render: (args) => (
    <FilterBar label={args.label} icon={args.icon}>
      <FilterPill label="All" active onClick={fn()} />
      <FilterPill label="Healthy" active={false} onClick={fn()} />
      <FilterPill label="Attention" active={false} onClick={fn()} />
      <FilterPill label="At Risk" active={false} onClick={fn()} />
    </FilterBar>
  ),
};

export const PillStates: Story = {
  args: {
    children: <></>,
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <FilterPill label="Open" active onClick={fn()} />
      <FilterPill label="Watching" active={false} onClick={fn()} />
      <FilterPill label="Resolved" active={false} onClick={fn()} />
      <FilterPill label="Escalated" active={false} onClick={fn()} />
    </div>
  ),
};
