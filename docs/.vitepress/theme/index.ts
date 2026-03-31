import Teek from "vitepress-theme-teek";
import type { Theme } from "vitepress";

import "vitepress-theme-teek/index.css";
import "vitepress-theme-teek/vp-plus/code-block-mobile.scss";
import "vitepress-theme-teek/vp-plus/sidebar.scss";
import "vitepress-theme-teek/vp-plus/nav.scss";
import "vitepress-theme-teek/vp-plus/aside.scss";
import "vitepress-theme-teek/vp-plus/table.scss";
import "vitepress-theme-teek/vp-plus/blockquote.scss";
import "vitepress-theme-teek/tk-plus/fade-up-animation.scss";
import "./custom.css";

import MyoPathDemo from "../components/MyoPathDemo.vue";

export default {
  extends: Teek,
  enhanceApp({ app }) {
    app.component("MyoPathDemo", MyoPathDemo);
  },
} satisfies Theme;
