import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import SearchInput from "./SearchInput";

const meta = {
  title: "Primitives/Search Input",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    value: "",
    onChange: fn(),
    placeholder: "Search channels...",
    className: "w-64",
  },
};

export const Filled: Story = {
  args: {
    value: "billing renewal",
    onChange: fn(),
    placeholder: "Search messages...",
    className: "w-72",
  },
};
