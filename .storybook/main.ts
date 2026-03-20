import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  framework: {
    name: "@storybook/nextjs-vite",
    options: {
      nextConfigPath: "../next.config.ts",
    },
  },
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-themes"],
  staticDirs: ["../public"],
  docs: {
    autodocs: "tag",
  },
};

export default config;
