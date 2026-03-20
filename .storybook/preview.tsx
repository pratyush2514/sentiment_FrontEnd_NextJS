import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import "../src/app/globals.css";

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
      parentSelector: "html",
      attributeName: "data-theme",
    }),
    (Story) => (
      <div className="min-h-screen bg-bg-primary text-text-primary antialiased">
        <Story />
      </div>
    ),
  ],
  globalTypes: {
    theme: {
      description: "Theme applied to the preview root",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  initialGlobals: {
    theme: "light",
    viewport: "desktop",
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: "padded",
    controls: {
      expanded: true,
    },
    options: {
      storySort: {
        order: [
          "Primitives",
          ["Card", "Filters", "Search Input", "Select", "Stat Card"],
          "Dashboard",
          ["Workspace Sentiment Chart", "Channel Health Section", "Action Inbox Section"],
        ],
      },
    },
    viewport: {
      options: {
        desktop: {
          name: "Desktop",
          styles: {
            width: "1440px",
            height: "900px",
          },
          type: "desktop",
        },
        laptop: {
          name: "Laptop",
          styles: {
            width: "1280px",
            height: "800px",
          },
          type: "desktop",
        },
        tablet: INITIAL_VIEWPORTS.ipad,
        mobile: INITIAL_VIEWPORTS.iphone13,
      },
    },
  },
};

export default preview;
