import { defineConfig } from "vitepress";
import { defineTeekConfig } from "vitepress-theme-teek/config";

const teekConfig = defineTeekConfig({
  teekHome: false,
  vpHome: true,
  footerInfo: {
    theme: { show: false },
    copyright: { show: false },
  },
});

export default defineConfig({
  extends: teekConfig,
  title: "MyoToolkit",
  base: "/",
  cleanUrls: false,
  lastUpdated: true,

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["meta", { property: "og:type", content: "website" }],
    [
      "meta",
      {
        property: "og:title",
        content: "MyoToolkit | Computational Toolkit for Skeletal Muscle Research",
      },
    ],
    ["meta", { property: "og:site_name", content: "MyoToolkit" }],
    [
      "script",
      { async: "", src: "https://www.googletagmanager.com/gtag/js?id=G-TMKV3Y3GND" },
    ],
    [
      "script",
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-TMKV3Y3GND');",
    ],
  ],

  markdown: {
    lineNumbers: true,
    math: true,
    image: {
      lazyLoading: true,
    },
  },

  locales: {
    root: {
      label: "English",
      lang: "en-US",
      description:
        "A computational toolkit for skeletal muscle research — integrating transcriptomics scoring, pathology analysis, and MRI segmentation",
      themeConfig: {
        nav: [
          { text: "Home", link: "/" },
          {
            text: "Tools",
            items: [
              { text: "MyoScore", link: "/myoscore/introduction" },
              { text: "MyoPath", link: "/myopath/introduction" },
              { text: "MyoSpectrum", link: "/myospectrum/introduction" },
              { text: "ThighMRIseg", link: "/thighmriseg/introduction" },
            ],
          },
          { text: "Downloads", link: "/downloads" },
          { text: "Changelog", link: "/changelog" },
          { text: "About", link: "/about" },
        ],
        sidebar: {
          "/myoscore/": [
            {
              text: "MyoScore",
              items: [
                { text: "Introduction", link: "/myoscore/introduction" },
                { text: "Quick Start", link: "/myoscore/quick-start" },
                { text: "R Package", link: "/myoscore/r-package" },
                { text: "Methods", link: "/myoscore/methods" },
                { text: "Validation", link: "/myoscore/validation" },
                { text: "Data Download", link: "/myoscore/data" },
              ],
            },
          ],
          "/myopath/": [
            {
              text: "MyoPath",
              items: [
                { text: "Introduction", link: "/myopath/introduction" },
                { text: "Installation", link: "/myopath/installation" },
                { text: "Usage", link: "/myopath/usage" },
                { text: "Morphometric Features", link: "/myopath/metrics" },
                { text: "Methods", link: "/myopath/methods" },
                { text: "Validation", link: "/myopath/validation" },
                { text: "Data Download", link: "/myopath/data" },
              ],
            },
          ],
          "/myospectrum/": [
            {
              text: "MyoSpectrum",
              items: [
                { text: "Introduction", link: "/myospectrum/introduction" },
                { text: "Quick Start", link: "/myospectrum/quick-start" },
                { text: "Methods", link: "/myospectrum/methods" },
              ],
            },
          ],
          "/thighmriseg/": [
            {
              text: "ThighMRIseg",
              items: [
                { text: "Introduction", link: "/thighmriseg/introduction" },
                { text: "Quick Start", link: "/thighmriseg/quick-start" },
                { text: "Methods", link: "/thighmriseg/methods" },
                { text: "Dataset", link: "/thighmriseg/dataset" },
              ],
            },
          ],
        },
      },
    },
    zh: {
      label: "简体中文",
      lang: "zh-CN",
      link: "/zh/",
      title: "MyoToolkit",
      description:
        "骨骼肌研究计算工具集 — 整合转录组评分、病理分析和 MRI 分割",
      themeConfig: {
        nav: [
          { text: "首页", link: "/zh/" },
          {
            text: "工具集",
            items: [
              { text: "MyoScore", link: "/zh/myoscore/introduction" },
              { text: "MyoPath", link: "/zh/myopath/introduction" },
              { text: "MyoSpectrum", link: "/zh/myospectrum/introduction" },
              { text: "ThighMRIseg", link: "/zh/thighmriseg/introduction" },
            ],
          },
          { text: "数据下载", link: "/zh/downloads" },
          { text: "更新日志", link: "/zh/changelog" },
          { text: "关于", link: "/zh/about" },
        ],
        sidebar: {
          "/zh/myoscore/": [
            {
              text: "MyoScore",
              items: [
                { text: "简介", link: "/zh/myoscore/introduction" },
                { text: "快速开始", link: "/zh/myoscore/quick-start" },
                { text: "R 包", link: "/zh/myoscore/r-package" },
                { text: "方法", link: "/zh/myoscore/methods" },
                { text: "验证结果", link: "/zh/myoscore/validation" },
                { text: "数据下载", link: "/zh/myoscore/data" },
              ],
            },
          ],
          "/zh/myopath/": [
            {
              text: "MyoPath",
              items: [
                { text: "简介", link: "/zh/myopath/introduction" },
                { text: "安装", link: "/zh/myopath/installation" },
                { text: "运行", link: "/zh/myopath/usage" },
                { text: "形态学特征", link: "/zh/myopath/metrics" },
                { text: "方法", link: "/zh/myopath/methods" },
                { text: "验证结果", link: "/zh/myopath/validation" },
                { text: "数据下载", link: "/zh/myopath/data" },
              ],
            },
          ],
          "/zh/myospectrum/": [
            {
              text: "MyoSpectrum",
              items: [
                { text: "简介", link: "/zh/myospectrum/introduction" },
                { text: "快速开始", link: "/zh/myospectrum/quick-start" },
                { text: "方法", link: "/zh/myospectrum/methods" },
              ],
            },
          ],
          "/zh/thighmriseg/": [
            {
              text: "ThighMRIseg",
              items: [
                { text: "简介", link: "/zh/thighmriseg/introduction" },
                { text: "快速开始", link: "/zh/thighmriseg/quick-start" },
                { text: "方法", link: "/zh/thighmriseg/methods" },
                { text: "数据集", link: "/zh/thighmriseg/dataset" },
              ],
            },
          ],
        },
        outline: {
          label: "页面导航",
        },
        lastUpdated: {
          text: "最后更新于",
        },
        docFooter: {
          prev: "上一页",
          next: "下一页",
        },
        langMenuLabel: "切换语言",
        returnToTopLabel: "返回顶部",
        sidebarMenuLabel: "菜单",
        darkModeSwitchLabel: "主题",
      },
    },
  },

  themeConfig: {
    logo: "/favicon.svg",
    socialLinks: [
      { icon: "github", link: "https://github.com/Hirriririir/MyoToolkit" },
    ],

    footer: {
      message:
        'Released under the MIT License.<br/><a href="https://beian.miit.gov.cn/" target="_blank">赣ICP备2024041543号</a> | <a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36110002000148" target="_blank"><img src="/beian.png" style="display:inline-block;vertical-align:middle;width:14px;height:14px;margin-right:4px;" />赣公网安备36110002000148号</a>',
      copyright:
        '<a href="https://huashanmuscle.com/" target="_blank">HuashanMuscle</a> © 2026-present',
    },

    search: {
      provider: "local",
    },
  },
});
