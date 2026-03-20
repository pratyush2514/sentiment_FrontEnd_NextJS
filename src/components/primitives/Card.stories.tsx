import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card } from "./Card";

const meta = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

function CardBody() {
  return (
    <div className="space-y-2">
      <p className="font-mono text-badge uppercase tracking-wider text-text-tertiary">
        Workspace overview
      </p>
      <h3 className="font-sans text-lg font-semibold text-text-primary">
        Support burst detected
      </h3>
      <p className="font-body text-sm leading-relaxed text-text-secondary">
        Three channels are seeing a spike in unresolved questions. This card
        checks the core surface, spacing, and elevation tokens used throughout
        the dashboard.
      </p>
    </div>
  );
}

export const Flat: Story = {
  args: {
    children: <CardBody />,
  },
  render: (args) => <Card {...args} className="w-[360px]" />,
};

export const Raised: Story = {
  args: {
    elevation: "raised",
    padding: "compact",
    children: <CardBody />,
  },
  render: (args) => <Card {...args} className="w-[360px]" />,
};

export const Interactive: Story = {
  args: {
    elevation: "panel",
    padding: "spacious",
    interactive: true,
    as: "section",
    children: <CardBody />,
  },
  render: (args) => <Card {...args} className="w-[360px]" />,
};
