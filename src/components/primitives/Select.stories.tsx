import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import Select from "./Select";

const meta = {
  title: "Primitives/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const sortOptions = [
  { label: "Last activity", value: "activity" },
  { label: "Risk level", value: "risk" },
  { label: "Alphabetical", value: "alpha" },
  { label: "Message count", value: "messages" },
];

export const Default: Story = {
  args: {
    value: "activity",
    onChange: fn(),
    options: sortOptions,
    label: "Sort channels",
  },
};

export const Wide: Story = {
  args: {
    value: "risk",
    onChange: fn(),
    options: sortOptions,
    label: "Sort channels",
    className: "w-56",
  },
};
