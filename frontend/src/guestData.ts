// ============================================================
// 游客模式内置数据 — 无需后端即可浏览完整课程和项目
// ============================================================

export interface GuestModule {
  id: number; week: number; day: number; title: string;
  theme: string; goal: string; content: string; status: string;
  external_links: string;
}

export interface GuestProject {
  id: number; title: string; summary: string; difficulty: string;
  tags: string[];
  steps: { order: number; title: string; content: string; download_url?: string }[];
  source_links: { label: string; url: string }[];
}

// ── 12 周课程数据 ────────────────────────────────────────────

export const GUEST_MODULES: GuestModule[] = [
  // ═══ Week 1: AI 是什么 ═══
  { id: 1, week: 1, day: 1, title: "AI 全景图", theme: "AI 基础认知", goal: "理解 AI、机器学习、深度学习的区别和联系", status: "published",
    content: `## AI 是什么？

人工智能（Artificial Intelligence）是让机器模拟人类智能的技术。它不是某个具体的工具，而是一个庞大的领域。

### AI > 机器学习 > 深度学习

\`\`\`
AI（人工智能）
├── 机器学习（Machine Learning）
│   ├── 监督学习：给数据+标签，学映射关系
│   ├── 无监督学习：只给数据，找隐藏结构
│   └── 强化学习：通过奖惩学策略
└── 深度学习（Deep Learning）
    └── 用多层神经网络处理复杂问题
\`\`\`

### 你现在接触到的 AI

- **ChatGPT / Claude**：大语言模型（LLM），属于深度学习
- **Midjourney / DALL-E**：图像生成模型
- **GitHub Copilot**：代码生成模型

### 关键认知

> AI 不是魔法，是数学+数据+算力的产物。理解这一点，你就超越了 80% 的使用者。`,
    external_links: JSON.stringify([{ title: "AI 入门科普视频", url: "https://www.bilibili.com/video/BV1uT4y1P7CX" }])
  },
  { id: 2, week: 1, day: 2, title: "大语言模型原理（通俗版）", theme: "AI 基础认知", goal: "理解 LLM 是如何'说话'的", status: "published",
    content: `## 大语言模型是怎么工作的？

### 一个比喻：超级输入法

大语言模型本质上是一个**超级预测下一个词**的机器。

当你输入"今天天气真"，模型计算：
- "好" — 35%
- "热" — 20%
- "不错" — 15%
- ...

它选择概率最高的词，然后继续预测下一个。

### 三个关键概念

**1. Token（词元）**
模型不直接处理汉字，而是把文本切成 token。"人工智能"可能被切成 ["人工智能"] 或 ["人工", "智能"]。

**2. 上下文窗口**
模型一次能"看到"的 token 数量。比如 128K 上下文 ≈ 一本小说。

**3. 温度（Temperature）**
控制创造力的参数。温度越高，回答越随机；温度越低，回答越确定。

### 幻觉问题

LLM 有时会"编造"信息——这就是幻觉。原因是它只是预测下一个词，并不真正"理解"事实。`,
    external_links: JSON.stringify([])
  },
  { id: 3, week: 1, day: 3, title: "提示词入门", theme: "AI 基础认知", goal: "学会写出有效的提示词", status: "published",
    content: `## 提示词（Prompt）基础

提示词是你和 AI 对话的"界面"。好的提示词 = 好的结果。

### 一个万能公式

> **角色 + 任务 + 约束 + 格式**

### 例子对比

❌ **差的提示词：** "给我写个商业计划书"

✅ **好的提示词：**
\`\`\`
你是一位资深商业顾问。请为一家面向小企业的 AI 客服 SaaS 公司写商业计划书。
- 目标读者：天使投资人
- 长度：1000 字左右
- 必须包含：市场分析、竞争优势、收入模型
- 格式：Markdown，每个部分有小标题
\`\`\`

### 三个实用技巧

1. **给示例**：提供你期望的输出样本
2. **分步骤**：复杂任务拆成多轮对话
3. **说"不知道就说不知道"**：减少幻觉

> 记住：AI 是工具，你是导演。你说得越清楚，它做得越好。`,
    external_links: JSON.stringify([{ title: "OpenAI 官方提示词指南", url: "https://platform.openai.com/docs/guides/prompt-engineering" }])
  },

  // ═══ Week 2: 选工具 ═══
  { id: 4, week: 2, day: 1, title: "主流 AI 工具盘点", theme: "AI 工具选择", goal: "了解市面上的主要 AI 工具及其适用场景", status: "published",
    content: `## 2025-2026 主流 AI 工具

### 对话 / 助手类

| 工具 | 特点 | 适合 |
|------|------|------|
| ChatGPT | 综合最强，生态丰富 | 通用 |
| Claude | 长文本、代码、安全 | 编程、分析 |
| Gemini | 与 Google 生态集成 | Google 用户 |
| Kimi | 国产、长文本 | 中文场景 |
| DeepSeek | 国产、开源、便宜 | 性价比 |

### 编程类

| 工具 | 特点 |
|------|------|
| GitHub Copilot | IDE 内补全 |
| Cursor | AI-native 编辑器 |
| Claude Code | CLI 编程助手 |

### 图像 / 视频类

| 工具 | 用途 |
|------|------|
| Midjourney | 艺术风格图像 |
| DALL-E 3 | 通用图像生成 |
| Stable Diffusion | 开源、可控 |
| Sora / Runway | 视频生成 |

### 选择建议

> 新手从 Claude 或 Kimi 开始，免费额度足够学习。编程用 Cursor 体验最好。`,
    external_links: JSON.stringify([])
  },
  { id: 5, week: 2, day: 2, title: "搭建你的第一个 AI 工作流", theme: "AI 工具选择", goal: "用 AI 完成一个完整的任务链条", status: "published",
    content: `## AI 工作流实战

今天我们来完成一个完整任务：**用 AI 帮你写一篇公众号文章并配图**。

### 步骤 1：用 Claude 生成大纲

\`\`\`
请为"AI 时代普通人如何保持竞争力"这个话题写一篇公众号文章大纲，包含 5 个部分，每部分 2-3 个小标题。
\`\`\`

### 步骤 2：逐段展开

\`\`\`
请展开第 1 部分"[具体标题]"，写 300 字左右，语言要通俗易懂，像和朋友聊天。
\`\`\`

### 步骤 3：优化标题

\`\`\`
为这篇文章生成 5 个吸引人的标题，要有数字或悬念。
\`\`\`

### 步骤 4：配图

用 Midjourney 或通义万相生成配图：
\`\`\`
A minimalist illustration of a person holding a glowing light bulb, digital art style, blue and white color scheme
\`\`\`

### 核心方法

> AI → 你审 → AI 改进 → 你再审 → 完成

你不是被 AI 替代，你是**用 AI 放大自己的能力**。`,
    external_links: JSON.stringify([])
  },
  { id: 6, week: 2, day: 3, title: "AI 编程入门：Cursor 快速上手", theme: "AI 工具选择", goal: "安装并学会使用 Cursor 编辑器", status: "published",
    content: `## Cursor 快速上手

[Cursor](https://cursor.com) 是目前最好的 AI 编程编辑器，基于 VS Code。

### 安装

1. 打开 cursor.com，下载安装
2. 首次打开会提示导入 VS Code 配置（如果有的话）
3. 注册账号，免费版每月有 2000 次 AI 补全

### 核心功能

**1. Tab 补全**
写代码时，Cursor 会自动预测你接下来要写什么，按 Tab 接受。

**2. Cmd/Ctrl + K 内联编辑**
选中一段代码 → Ctrl+K → 用中文描述你要怎么改 → 回车

**3. Cmd/Ctrl + L 对话面板**
侧边栏打开 AI 对话，可以问任何问题，还能 @ 引用文件

**4. Composer（Cmd/Ctrl + I）**
全项目编辑模式，可以一次性创建/修改多个文件

### 第一次尝试

用 Composer（Ctrl+I）输入：

> 帮我创建一个简单的个人博客页面，用 HTML + CSS，要有导航栏、文章列表和页脚

然后观察 Cursor 如何生成代码。这是你成为 AI 开发者的第一步。`,
    external_links: JSON.stringify([{ title: "Cursor 官方文档", url: "https://docs.cursor.com" }])
  },

  // ═══ Week 3: 编程准备 ═══
  { id: 7, week: 3, day: 1, title: "环境搭建：Node.js + Git + VS Code", theme: "开发环境搭建", goal: "装好编程必备的三个工具", status: "published",
    content: `## 开发环境搭建

不管你以后写什么，这三个工具是基础。

### 1. Node.js

JavaScript 的运行时环境。前端开发必备。

- 打开 nodejs.org，下载 LTS 版本
- 安装完成后打开终端，输入 \`node -v\`，看到版本号就 OK

### 2. Git

版本控制工具，保存代码的每一个版本。

- 打开 git-scm.com，下载安装
- 终端输入 \`git --version\` 验证

### 3. VS Code

代码编辑器。

- 打开 code.visualstudio.com，下载安装
- 推荐安装插件：Chinese Language Pack、Prettier

### 验证环境

打开终端（Win: PowerShell, Mac: Terminal），依次执行：

\`\`\`bash
node -v    # 应显示 v18 或 v20+
npm -v     # 应显示 9 或 10+
git --version  # 应显示 2.x
code --version # 应显示版本号
\`\`\`

全部通过 = 环境准备完毕。`,
    external_links: JSON.stringify([])
  },
  { id: 8, week: 3, day: 2, title: "终端（命令行）入门", theme: "开发环境搭建", goal: "不再害怕黑框框", status: "published",
    content: `## 终端入门

终端（Terminal / 命令行）是程序员控制电脑的方式。

### 为什么学终端？

> 图形界面只能做它能做的事，终端可以做任何事。

### 基础命令

\`\`\`bash
pwd           # 查看当前位置
ls            # 列出当前目录的文件（Win 用 dir）
cd 文件夹名    # 进入文件夹
cd ..         # 返回上一级
mkdir 名字    # 创建文件夹
touch 文件名  # 创建文件
rm 文件名     # 删除文件（小心！）
\`\`\`

### 练习

在你的桌面上：

\`\`\`bash
cd ~/Desktop
mkdir my-first-project
cd my-first-project
touch hello.txt
echo "Hello World" > hello.txt
cat hello.txt
\`\`\`

如果能顺利完成，你就已经会了日常 80% 的终端操作。`,
    external_links: JSON.stringify([])
  },
  { id: 9, week: 3, day: 3, title: "第一个网页：HTML + CSS 速览", theme: "开发环境搭建", goal: "理解网页的基本构成", status: "published",
    content: `## HTML + CSS 速览

### HTML = 内容结构

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>我的第一页</title>
</head>
<body>
  <h1>你好，世界</h1>
  <p>这是我的第一个网页。</p>
  <button onclick="alert('你点了按钮！')">点我</button>
</body>
</html>
\`\`\`

- \`<h1>\` = 一级标题
- \`<p>\` = 段落
- \`<button>\` = 按钮

### CSS = 样式美化

\`\`\`css
h1 {
  color: blue;
  font-size: 32px;
  text-align: center;
}

button {
  background: black;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
\`\`\`

### JavaScript = 交互逻辑

\`\`\`js
const button = document.querySelector('button');
button.addEventListener('click', () => {
  alert('你好！');
});
\`\`\`

> 三件套：HTML 骨架 + CSS 皮肤 + JS 肌肉。这就是所有网页的基础。`,
    external_links: JSON.stringify([])
  },

  // ═══ Week 4: Git & GitHub ═══
  { id: 10, week: 4, day: 1, title: "Git 基础：保存和回退", theme: "版本控制入门", goal: "学会用 Git 管理代码版本", status: "published",
    content: `## Git 基础操作

Git 就像是代码的"存档系统"——你可以随时回到之前的版本。

### 核心概念

\`\`\`
工作目录 → 暂存区 → 本地仓库 → 远程仓库
   (改代码)  (git add)  (git commit)  (git push)
\`\`\`

### 实战流程

\`\`\`bash
# 初始化一个 Git 仓库
git init

# 查看状态
git status

# 添加文件到暂存区
git add 文件名
git add .          # 添加所有文件

# 提交（保存一个版本）
git commit -m "描述你做了什么"

# 查看历史
git log --oneline

# 回到之前的版本
git checkout 版本号
\`\`\`

### 最佳实践

- 每完成一个小功能就 commit 一次
- commit 信息用中文写清楚做了什么
- 不要等攒了一大堆改动才 commit`,
    external_links: JSON.stringify([])
  },
  { id: 11, week: 4, day: 2, title: "GitHub 入门：把代码放到云端", theme: "版本控制入门", goal: "学会推送代码到 GitHub", status: "published",
    content: `## GitHub 入门

GitHub = Git + Hub（中心）。把你的代码存在云端，还能和别人协作。

### 首次推送

1. 在 github.com 创建账号
2. 新建仓库（New Repository），命名为 \`my-first-project\`
3. 本地执行：

\`\`\`bash
git remote add origin https://github.com/你的用户名/my-first-project.git
git branch -M main
git push -u origin main
\`\`\`

### 日常工作流

\`\`\`bash
# 每次开始工作前，拉取最新代码
git pull

# 写代码...

# 保存
git add .
git commit -m "做了什么"

# 推送到 GitHub
git push
\`\`\`

### GitHub 不只是存代码

- **Issues**：任务追踪
- **Pull Requests**：代码审查
- **Actions**：自动化构建部署
- **Pages**：免费托管静态网站

> 你的 GitHub = 你的技术名片。从现在开始，所有代码都推到 GitHub。`,
    external_links: JSON.stringify([{ title: "GitHub 官方教程", url: "https://docs.github.com/zh/get-started" }])
  },
  { id: 12, week: 4, day: 3, title: "README 书写与项目展示", theme: "版本控制入门", goal: "学会写专业的项目说明文档", status: "published",
    content: `## 写好 README

README.md 是项目的"门面"。别人点进你的仓库，第一眼就看到它。

### README 模板

\`\`\`markdown
# 项目名称

一句话描述项目是做什么的。

## 功能

- 功能 1
- 功能 2

## 技术栈

- HTML + CSS + JavaScript
- 部署在 GitHub Pages

## 如何使用

1. git clone 仓库地址
2. 用浏览器打开 index.html

## 截图

（放一张项目截图）

## 学到了什么

- 学会了 HTML 基本标签
- 理解了 CSS Flexbox 布局
- 掌握了 Git 基本操作
\`\`\`

### Markdown 基础

\`\`\`markdown
# 一级标题
## 二级标题
**粗体** *斜体*
- 列表项
[链接文字](URL)
![图片描述](图片URL)
\`\`\`

> 好 README = 好印象。未来的面试官和协作者都会看。`,
    external_links: JSON.stringify([])
  },

  // ═══ Week 5: JS 进阶 ═══
  { id: 13, week: 5, day: 1, title: "JavaScript 核心概念：变量、函数、对象", theme: "JavaScript 进阶", goal: "掌握 JS 三大核心概念", status: "published",
    content: `## JavaScript 核心概念

### 变量

\`\`\`js
// 三种声明方式
const name = '小明';    // 不可变，优先使用
let age = 25;          // 可变
var old = '过时了';    // 不推荐

// 常用类型
const str = '字符串';
const num = 42;
const arr = [1, 2, 3];
const obj = { name: '小明', age: 25 };
const isTrue = true;
\`\`\`

### 函数

\`\`\`js
// 箭头函数（推荐）
const add = (a, b) => a + b;
add(1, 2); // 3

// 复杂函数用花括号
const greet = (name) => {
  const msg = \`你好，\${name}！\`;
  return msg;
};
\`\`\`

### 对象和数组操作

\`\`\`js
const users = [
  { name: '小明', age: 25 },
  { name: '小红', age: 30 },
];

// map：转换每个元素
const names = users.map(u => u.name); // ['小明', '小红']

// filter：筛选
const adults = users.filter(u => u.age >= 28); // [{name:'小红', age:30}]

// find：找第一个
const xiao = users.find(u => u.name === '小明');

// 展开运算符
const updated = { ...users[0], age: 26 };
\`\`\`

> 这些操作在 React 里每天用。熟练掌握它们。`,
    external_links: JSON.stringify([])
  },
  { id: 14, week: 5, day: 2, title: "异步编程：Promise 和 async/await", theme: "JavaScript 进阶", goal: "理解异步操作，看懂网络请求代码", status: "published",
    content: `## 异步编程

JavaScript 是单线程的，但很多操作（网络请求、文件读取）是慢的。异步让你不卡住。

### 回调 → Promise → async/await

\`\`\`js
// ❌ 回调地狱
getData((data) => {
  process(data, (result) => {
    save(result, () => { console.log('完成'); });
  });
});

// ✅ Promise 链
getData()
  .then(data => process(data))
  .then(result => save(result))
  .then(() => console.log('完成'))
  .catch(err => console.error('出错', err));

// ✅✅ async/await（推荐）
const main = async () => {
  try {
    const data = await getData();
    const result = await process(data);
    await save(result);
    console.log('完成');
  } catch (err) {
    console.error('出错', err);
  }
};
\`\`\`

### async/await 规则

- \`await\` 只能在 \`async\` 函数里用
- \`async\` 函数返回 Promise
- 用 \`try/catch\` 处理错误

> 你在 React 里写的 \`const res = await api.get('/xxx')\` 就是这个。`,
    external_links: JSON.stringify([])
  },
  { id: 15, week: 5, day: 3, title: "npm 与模块化", theme: "JavaScript 进阶", goal: "学会安装和使用 npm 包", status: "published",
    content: `## npm 与模块化

npm（Node Package Manager）是 JavaScript 的"应用商店"。全世界开发者写的代码，你一行命令就能用。

### 常用命令

\`\`\`bash
# 初始化项目
npm init -y

# 安装包
npm install 包名         # 简写 npm i 包名
npm i axios             # HTTP 请求库
npm i dayjs             # 日期处理

# 卸载
npm uninstall 包名

# 查看已安装的包
npm list
\`\`\`

### package.json

\`\`\`json
{
  "name": "my-project",
  "dependencies": {
    "axios": "^1.7.0",
    "react": "^18.3.0"
  },
  "devDependencies": {
    "typescript": "~5.5.0"
  }
}
\`\`\`

- \`dependencies\`：运行时需要的包
- \`devDependencies\`：开发时需要的包（测试、类型检查等）

### import 和 export

\`\`\`js
// utils.js — 导出
export const add = (a, b) => a + b;
export default function formatDate(date) { ... }

// main.js — 导入
import formatDate from './utils.js';
import { add } from './utils.js';
\`\`\`

> \`npm i\` 是每个 JS 项目的起点。\`node_modules\` 文件夹不要提交到 Git。`,
    external_links: JSON.stringify([])
  },

  // ═══ Week 6: React 入门 ═══
  { id: 16, week: 6, day: 1, title: "React 哲学：组件化思维", theme: "React 入门", goal: "理解 React 的核心思想", status: "published",
    content: `## React 哲学

React 的核心思想：**UI = f(state)**，界面是状态的函数。

### 为什么需要 React？

\`\`\`js
// 原生 JS：手动操作 DOM，繁琐易错
document.getElementById('count').textContent = count;
document.getElementById('btn').disabled = count >= 10;

// React：声明式，你只管描述"应该是什么样"
<div>{count}</div>
<button disabled={count >= 10}>+1</button>
\`\`\`

### 组件化

把 UI 拆成可复用的组件：

\`\`\`
<App>
  <Header />
  <MainContent>
    <SearchBar />
    <ItemList>
      <ItemCard />
      <ItemCard />
      <ItemCard />
    </ItemList>
  </MainContent>
  <Footer />
</App>
\`\`\`

### 单向数据流

数据从父组件流向子组件，通过 props 传递：

\`\`\`jsx
function Parent() {
  const [name, setName] = useState('小明');
  return <Child name={name} onUpdate={setName} />;
}

function Child({ name, onUpdate }) {
  return <button onClick={() => onUpdate('小红')}>改名为{name}</button>;
}
\`\`\`

> React 让你专注在"这个状态应该渲染什么"，而不是"怎么去改 DOM"。`,
    external_links: JSON.stringify([])
  },
  { id: 17, week: 6, day: 2, title: "useState 和 useEffect", theme: "React 入门", goal: "掌握 React 最重要的两个 Hook", status: "published",
    content: `## useState 和 useEffect

### useState：组件记忆

\`\`\`jsx
const [count, setCount] = useState(0);
//    值      修改函数        初始值

// 读取
<div>{count}</div>

// 修改（触发重新渲染）
<button onClick={() => setCount(count + 1)}>+1</button>
<button onClick={() => setCount(c => c + 1)}>+1（推荐写法）</button>
\`\`\`

### useEffect：副作用

在渲染之后执行的代码。常见场景：

\`\`\`jsx
// 1. 组件挂载时执行一次
useEffect(() => {
  fetchData();
}, []); // 空数组 = 只执行一次

// 2. 依赖变化时执行
useEffect(() => {
  document.title = \`点击了 \${count} 次\`;
}, [count]); // count 变化时执行

// 3. 清理副作用
useEffect(() => {
  const timer = setInterval(() => tick(), 1000);
  return () => clearInterval(timer); // 组件卸载时清理
}, []);
\`\`\`

### 使用规则

- Hook 只能在函数组件顶层调用，不能在循环/条件里
- 自定义 Hook 以 \`use\` 开头
- 依赖数组不要撒谎——用到的变量都放进去`,
    external_links: JSON.stringify([])
  },
  { id: 18, week: 6, day: 3, title: "Vite + Tailwind CSS：现代前端工具链", theme: "React 入门", goal: "理解构建工具和 CSS 框架", status: "published",
    content: `## Vite + Tailwind CSS

### Vite：极速构建工具

传统的 Webpack 启动要几十秒，Vite 秒开。

\`\`\`bash
# 创建 Vite + React 项目
npm create vite@latest my-app -- --template react-ts
cd my-app
npm i
npm run dev    # 打开 http://localhost:5173
\`\`\`

### Tailwind CSS：原子化 CSS

不用写 CSS 文件，直接在 HTML 里写类名：

\`\`\`jsx
// ❌ 传统方式
<div className="card">
  <h1 className="title">你好</h1>
</div>
// 还要写 .card { ... } .title { ... }

// ✅ Tailwind
<div className="p-6 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">你好</h1>
</div>
\`\`\`

### 常用 Tailwind 类名

| 类别 | 类名 | 效果 |
|------|------|------|
| 内边距 | p-4, px-6, py-2 | padding |
| 外边距 | m-4, mt-2, mb-8 | margin |
| 文字 | text-lg, font-bold | 尺寸、粗细 |
| 颜色 | text-gray-900, bg-white | 文字、背景色 |
| 圆角 | rounded, rounded-lg | border-radius |
| 布局 | flex, grid, gap-4 | Flexbox/Grid |

> Vite + Tailwind 是现代前端的标配组合。快且爽。`,
    external_links: JSON.stringify([{ title: "Tailwind CSS 文档", url: "https://tailwindcss.com/docs" }])
  },

  // ═══ Week 7: 部署 ═══
  { id: 19, week: 7, day: 1, title: "前端部署：Vercel + GitHub Pages", theme: "部署上线", goal: "把你的网页部署到公网", status: "published",
    content: `## 前端部署

写完的网页怎么让别人访问？部署到公网！

### 方案 1：Vercel（推荐）

1. 代码推到 GitHub
2. 打开 vercel.com，用 GitHub 登录
3. Import 你的仓库
4. 点 Deploy —— 完成！

Vercel 自动检测 Vite 项目，配置全自动。每次 git push 自动重新部署。

### 方案 2：GitHub Pages

1. 在 GitHub 仓库 Settings → Pages
2. Source 选 GitHub Actions
3. 创建 \`.github/workflows/deploy.yml\`：

\`\`\`yaml
name: Deploy
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions: { pages: write, id-token: write }
    environment: { name: github-pages, url: \${{ steps.deploy.outputs.page_url }} }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
        working-directory: frontend
      - uses: actions/upload-pages-artifact@v3
        with: { path: frontend/dist }
      - uses: actions/deploy-pages@v4
        id: deploy
\`\`\`

### 对比

| | Vercel | GitHub Pages |
|--|--------|-------------|
| 国内访问 | 有时被墙 | 较稳定 |
| 配置 | 简单 | 需配置文件 |
| 自动部署 | ✅ | ✅ |

> 部署完把网址发给朋友，他们会觉得你很厉害。`,
    external_links: JSON.stringify([])
  },
  { id: 20, week: 7, day: 2, title: "域名与 DNS 入门", theme: "部署上线", goal: "理解域名是怎么工作的", status: "published",
    content: `## 域名与 DNS

### 域名是什么？

IP 地址难记（142.250.80.46），域名好记（google.com）。DNS 把域名翻译成 IP。

### 域名的结构

\`\`\`
https://www.example.com/blog/post
──┬──  ─┬─  ───┬─── ─┬─ ───┬──
协议  子域名 主域名 后缀 路径
\`\`\`

### DNS 记录类型

| 类型 | 作用 | 例子 |
|------|------|------|
| A | 域名→IP | example.com → 1.2.3.4 |
| CNAME | 域名→域名 | www → example.com |
| NS | 指定 DNS 服务器 | 用哪个服务商解析 |

### 怎么获得域名？

- [Namecheap](https://namecheap.com) — 便宜，海外
- [阿里云万网](https://wanwang.aliyun.com) — 国内
- [Cloudflare Registrar](https://cloudflare.com) — 成本价

### 绑定到 Vercel

1. Vercel 项目 → Settings → Domains
2. 输入你的域名
3. 按提示在域名服务商添加 DNS 记录
4. 等几分钟生效

> 一个 .com 域名一年大约 ¥50-100。有自己的域名很酷。`,
    external_links: JSON.stringify([])
  },
  { id: 21, week: 7, day: 3, title: "环境变量与安全配置", theme: "部署上线", goal: "学会安全管理敏感信息", status: "published",
    content: `## 环境变量

### 什么是环境变量？

代码里不能写密码、API Key 等敏感信息。环境变量在部署平台设置，代码里读取。

### 前端环境变量（Vite）

\`\`\`bash
# .env（不要提交到 Git）
VITE_API_URL=https://api.example.com
VITE_APP_NAME=我的应用
\`\`\`

\`\`\`ts
// 代码里使用
const apiUrl = import.meta.env.VITE_API_URL;
console.log(import.meta.env.VITE_APP_NAME);
\`\`\`

### .gitignore

必须忽略的文件：

\`\`\`
node_modules/
.env
.env.local
*.log
.DS_Store
\`\`\`

### 安全原则

✅ **应该做的：**
- 所有密钥放环境变量
- .env 加入 .gitignore
- 提供 .env.example 模板文件

❌ **绝对不能：**
- 把 API Key 写在代码里
- 把密码提交到 Git
- 在截图中暴露密钥

> 安全不是可选项。泄露一个 API Key 可能让你损失惨重。`,
    external_links: JSON.stringify([])
  },

  // ═══ Week 8: 后端入门 ═══
  { id: 22, week: 8, day: 1, title: "前后端分离是什么", theme: "后端入门", goal: "理解前后端分离架构", status: "published",
    content: `## 前后端分离

### 传统 vs 分离

\`\`\`
传统模式：
浏览器 → 服务器（渲染 HTML）→ 返回整个页面

前后端分离：
浏览器 ←→ 前端（React SPA）→ API 服务器 ←→ 数据库
         只发 JSON 数据
\`\`\`

### API 是什么？

API = Application Programming Interface。就是前后端之间的"合同"。

\`\`\`
GET    /api/tasks        → 获取任务列表
POST   /api/tasks        → 创建任务
PATCH  /api/tasks/1      → 更新任务 1
DELETE /api/tasks/1      → 删除任务 1
\`\`\`

### JSON 格式

前后端通信的标准格式：

\`\`\`json
{
  "id": 1,
  "title": "学习 React",
  "status": "completed",
  "estimated_minutes": 30
}
\`\`\`

### 你不需要全栈

作为 AI 时代的开发者，你专注于前端体验。后端需要的 API，用 AI 帮你生成。

> 前后端分离 = 分工合作。前端管界面体验，后端管数据逻辑。`,
    external_links: JSON.stringify([])
  },
  { id: 23, week: 8, day: 2, title: "Python FastAPI 入门", theme: "后端入门", goal: "用 AI 写第一个 API", status: "published",
    content: `## FastAPI 入门

FastAPI 是 Python 写 API 最快的框架。

### 安装

\`\`\`bash
pip install fastapi uvicorn
\`\`\`

### 第一个 API

\`\`\`python
# main.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def home():
    return {"message": "你好，世界"}

@app.get("/tasks")
def get_tasks():
    return [
        {"id": 1, "title": "学习 React"},
        {"id": 2, "title": "学习 FastAPI"},
    ]

# 运行：uvicorn main:app --reload
# 访问 http://localhost:8000/docs 有自动生成的接口文档
\`\`\`

### FastAPI 的优势

- 自动生成 API 文档（Swagger UI）
- 类型提示，IDE 有完整智能补全
- 性能好，异步支持

### 让 AI 写 API

> 用 Cursor 输入：帮我写一个 FastAPI 接口，GET /users 返回用户列表，POST /users 创建用户，用 SQLite 存储

AI 会帮你生成完整的后端代码。你只需要看懂逻辑。`,
    external_links: JSON.stringify([{ title: "FastAPI 官方文档", url: "https://fastapi.tiangolo.com/zh/" }])
  },
  { id: 24, week: 8, day: 3, title: "数据库基础：SQLite", theme: "后端入门", goal: "理解数据库的基本操作", status: "published",
    content: `## SQLite 入门

### 为什么 SQLite？

- 不需要安装数据库服务
- 数据存为一个文件（.db）
- 适合个人项目和小型应用
- Python 内置支持

### 基本概念

| 概念 | 对应 | 例子 |
|------|------|------|
| 数据库 | Excel 文件 | learning.db |
| 表 | Sheet | users, tasks |
| 行 | 一条记录 | 用户"小明"的数据 |
| 列 | 字段 | name, age, email |

### SQL 基础

\`\`\`sql
-- 创建表
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 插入数据
INSERT INTO users (name, email) VALUES ('小明', 'xm@example.com');

-- 查询
SELECT * FROM users;
SELECT name, email FROM users WHERE id = 1;

-- 更新
UPDATE users SET name = '大明' WHERE id = 1;

-- 删除
DELETE FROM users WHERE id = 1;
\`\`\`

### Python 中使用

\`\`\`python
import sqlite3
conn = sqlite3.connect('learning.db')
cursor = conn.execute("SELECT * FROM users")
rows = cursor.fetchall()
conn.close()
\`\`\`

> 大多数应用的数据本质上就是这四种操作：增删改查（CRUD）。`,
    external_links: JSON.stringify([])
  },

  // ═══ Week 9: AI 应用实战 ═══
  { id: 25, week: 9, day: 1, title: "调用 AI API：OpenAI / Claude", theme: "AI 应用开发", goal: "学会在代码里调用大模型 API", status: "published",
    content: `## 调用 AI API

让你的应用"拥有 AI 能力"。

### OpenAI API

\`\`\`python
from openai import OpenAI
client = OpenAI(api_key="sk-xxx")

response = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[
    {"role": "system", "content": "你是乐于助人的助手"},
    {"role": "user", "content": "用一句话解释量子计算"}
  ]
)
print(response.choices[0].message.content)
\`\`\`

### Claude API

\`\`\`python
import anthropic
client = anthropic.Anthropic(api_key="sk-ant-xxx")

message = client.messages.create(
  model="claude-sonnet-4-6",
  max_tokens=1024,
  messages=[{"role": "user", "content": "用一句话解释量子计算"}]
)
print(message.content[0].text)
\`\`\`

### JavaScript 版本

\`\`\`js
const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + apiKey,
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: '你好' }],
  }),
});
\`\`\`

### 关键参数

| 参数 | 说明 |
|------|------|
| model | 模型名称 |
| temperature | 创造力（0-2） |
| max_tokens | 最大回复长度 |
| system prompt | 设定 AI 的角色 |

> API Key 绝对不能暴露在前端代码里！一定要在后端调用。`,
    external_links: JSON.stringify([{ title: "OpenAI API 文档", url: "https://platform.openai.com/docs" }])
  },
  { id: 26, week: 9, day: 2, title: "AI 聊天机器人实战", theme: "AI 应用开发", goal: "搭建一个简单的 AI 聊天网页", status: "published",
    content: `## AI 聊天机器人

### 架构

\`\`\`
用户输入 → 前端（React）→ 后端（FastAPI）→ AI API
          ← 显示回复  ← 返回 AI 回复    ←
\`\`\`

### 前端代码

\`\`\`jsx
function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const send = async () => {
    setMessages([...messages, { role: 'user', content: input }]);
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    setMessages(msgs => [...msgs, { role: 'assistant', content: data.reply }]);
    setInput('');
  };

  return (
    <div>
      {messages.map((m, i) => (
        <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
          {m.content}
        </div>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && send()} />
      <button onClick={send}>发送</button>
    </div>
  );
}
\`\`\`

### 后端代码

\`\`\`python
@app.post("/api/chat")
def chat(req: ChatRequest):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": req.message}]
    )
    return {"reply": response.choices[0].message.content}
\`\`\`

> 这个聊天机器人是你第一个真正的 AI 应用。从这里出发，可以延伸出客服、翻译、写作助手等无数变体。`,
    external_links: JSON.stringify([])
  },
  { id: 27, week: 9, day: 3, title: "Prompt 工程进阶", theme: "AI 应用开发", goal: "掌握高级提示词技巧", status: "published",
    content: `## Prompt 工程进阶

### Chain of Thought（思维链）

让 AI 展示推理过程：

\`\`\`
❌ "这道题答案是什么？"

✅ "请一步步推理：
1. 先分析题目给的条件
2. 确定解题方法
3. 逐步计算
4. 最后给出答案"
\`\`\`

### Few-Shot Prompting

给几个示例让 AI 模仿：

\`\`\`
将以下句子翻译成英文，风格参考示例：

示例1：今天天气真好 → What a beautiful day!
示例2：我想吃火锅 → I'm craving hot pot!

现在翻译：这本书真有意思
\`\`\`

### 结构化输出

\`\`\`
分析以下用户评论，返回 JSON：

{
  "sentiment": "positive/negative/neutral",
  "topics": ["话题1", "话题2"],
  "summary": "一句话总结",
  "score": 1-5
}

评论：这个产品功能很强大，但是界面太复杂了，新手不太会用。
\`\`\`

### 角色扮演

\`\`\`
你是一位有 20 年经验的 Python 代码审查专家。请审查以下代码：
- 关注安全漏洞
- 关注性能问题
- 给出改进建议（按优先级排序）
- 对每个建议说明为什么重要
\`\`\`

> 好的 Prompt 是门手艺。这些技巧能让你从 AI 那里获得 10 倍好的输出。`,
    external_links: JSON.stringify([{ title: "Prompt Engineering Guide", url: "https://www.promptingguide.ai/zh" }])
  },

  // ═══ Week 10: RAG ═══
  { id: 28, week: 10, day: 1, title: "RAG（检索增强生成）原理", theme: "RAG 入门", goal: "理解 RAG 是什么以及为什么重要", status: "published",
    content: `## RAG 原理

### 什么是 RAG？

RAG = Retrieval-Augmented Generation（检索增强生成）

让 AI 在回答前先去"翻书"找相关信息。

### 为什么需要 RAG？

1. **AI 的知识有截止日期** — 不知道最新信息
2. **AI 不了解你的私有数据** — 不知道你公司的文档
3. **AI 会胡说八道** — 幻觉问题

RAG 解决以上三个问题。

### 工作流程

\`\`\`
用户提问 → 把问题转为向量 → 在知识库中搜索 → 找到相关内容 → 和问题一起发给 AI → AI 基于这些内容回答
\`\`\`

### 核心组件

| 组件 | 作用 | 工具 |
|------|------|------|
| 文档加载 | 读取文件 | PDF, Markdown, 网页 |
| 文本分割 | 切成小块 | RecursiveCharacterTextSplitter |
| 向量化 | 文本→数学向量 | OpenAI Embedding, BGE |
| 向量库 | 存储和搜索 | Chroma, FAISS, Pinecone |
| LLM | 生成回答 | GPT, Claude |

### 一个类比

> RAG 就像考试时允许你翻书。AI 不是凭空回忆，而是可以查阅你提供的资料再作答。这样更准确、更可靠。`,
    external_links: JSON.stringify([])
  },
  { id: 29, week: 10, day: 2, title: "LangChain 入门", theme: "RAG 入门", goal: "用 LangChain 搭建第一个 RAG 应用", status: "published",
    content: `## LangChain 入门

LangChain 是构建 LLM 应用最流行的框架。

### 安装

\`\`\`bash
pip install langchain langchain-openai chromadb
\`\`\`

### 简单的 RAG 应用

\`\`\`python
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader

# 1. 加载文档
loader = TextLoader("公司手册.txt")
docs = loader.load()

# 2. 分割
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)

# 3. 创建向量库
vectorstore = Chroma.from_documents(
  chunks,
  OpenAIEmbeddings(),
  persist_directory="./chroma_db"
)

# 4. 搜索
results = vectorstore.similarity_search("加班费怎么算？", k=3)
context = "\\n\\n".join([r.page_content for r in results])

# 5. 生成回答
llm = ChatOpenAI(model="gpt-4o-mini")
answer = llm.invoke(f"根据以下资料回答问题：\\n{context}\\n\\n问题：加班费怎么算？")
print(answer.content)
\`\`\`

### LangChain 核心概念

| 概念 | 作用 |
|------|------|
| Document Loader | 加载各种格式的文档 |
| Text Splitter | 把长文本切成小块 |
| Embeddings | 文字转向量 |
| Vector Store | 向量存储和搜索 |
| Chain | 串联多个步骤 |
| Agent | AI 自主选择工具和步骤 |

> 学会 RAG = 你就能让 AI 读懂你的私有数据。这是企业级 AI 应用的基础。`,
    external_links: JSON.stringify([{ title: "LangChain 文档", url: "https://python.langchain.com" }])
  },

  // ═══ Week 11: 完整项目 ═══
  { id: 30, week: 11, day: 1, title: "项目规划：AI 学习追踪器", theme: "完整项目实战", goal: "理解一个完整项目的架构设计", status: "published",
    content: `## 项目架构设计

你现在使用的这个 AI 学习追踪器，就是一个完整的前后端分离项目。

### 技术栈

\`\`\`
前端：React 18 + TypeScript + Vite + Tailwind CSS 4
后端：Python FastAPI + SQLAlchemy + SQLite
部署：GitHub Pages（前端）+ Render（后端）
\`\`\`

### 项目结构

\`\`\`
ai-learning-tracker/
├── frontend/              # 前端
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Learn.tsx
│   │   │   ├── ModuleView.tsx
│   │   │   ├── Workshop.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/    # 通用组件
│   │   └── api.ts         # API 封装
│   └── package.json
├── backend/               # 后端
│   ├── main.py            # 入口
│   ├── models.py          # 数据模型
│   ├── database.py        # 数据库配置
│   ├── routers/           # API 路由
│   └── requirements.txt
└── .github/workflows/     # CI/CD
\`\`\`

### 数据流

\`\`\`
用户操作 → React State 更新 → 调用 API → FastAPI 处理 → SQLite 读写 → 返回 JSON → React 重新渲染
\`\`\`

### 关键设计决策

1. **前后端分离**：前端独立部署，后端可选
2. **游客模式**：前端内置静态数据，无后端也能浏览
3. **PWA**：可安装到手机桌面
4. **深色模式**：CSS 变量 + React Context

> 理解这个项目的架构，你就能复刻出类似的应用。`,
    external_links: JSON.stringify([])
  },
  { id: 31, week: 11, day: 2, title: "从零复刻这个项目", theme: "完整项目实战", goal: "用 AI 辅助，从头搭建一个完整项目", status: "published",
    content: `## 从零复刻

用 AI 辅助，3 天搭建一个完整项目。

### Day 1：项目初始化

\`\`\`
用 Cursor Composer 输入：
"创建一个 React + TypeScript + Vite + Tailwind CSS 项目，
叫 my-ai-tracker，包含：
- 路由配置（/ /learn /settings）
- 深色模式切换
- 底部导航栏
- 一个简单的首页"
\`\`\`

### Day 2：后端搭建

\`\`\`
用 Cursor Composer 输入：
"在 backend/ 目录下创建 FastAPI 后端：
- SQLite 数据库，用 SQLAlchemy
- User 模型（id, name, email, level）
- GET /api/user/profile 接口
- 初始数据种子脚本"
\`\`\`

### Day 3：前后端联调 + 部署

\`\`\`
用 Cursor Composer 输入：
"修改前端 api.ts，baseURL 指向后端地址。
创建 GitHub Actions 部署到 GitHub Pages。
添加 README 文档。"
\`\`\`

### 关键心态

> 你不是在写代码，你是在**指挥 AI 写代码**。你的角色是架构师+审阅者，而不是打字员。

遇到报错 → 复制错误信息 → 粘贴给 AI → 应用修复 → 继续。

这就是 AI 时代的开发方式。`,
    external_links: JSON.stringify([])
  },
  { id: 32, week: 11, day: 3, title: "测试与调试基础", theme: "完整项目实战", goal: "学会排查和修复常见问题", status: "published",
    content: `## 测试与调试

代码出 bug 是常态。重要的是快速找到并修复。

### 前端调试

1. **浏览器 DevTools**：F12 打开
   - Console：看错误和日志
   - Network：看 API 请求
   - Elements：看 HTML 和 CSS
   - Application：看 localStorage

2. **console.log 是你的朋友**

\`\`\`js
// 不要这样
console.log(data);

// 要这样
console.log('API返回:', JSON.stringify(data, null, 2));
console.log('用户信息:', { id: user.id, name: user.name });
\`\`\`

### 后端调试

\`\`\`python
# FastAPI 自动生成的接口文档
# 打开 http://localhost:8000/docs 直接测试 API

# 加日志
import logging
logging.basicConfig(level=logging.INFO)
logger.info(f"收到请求: {request.url}")
\`\`\`

### 常见错误速查

| 错误 | 原因 | 解决 |
|------|------|------|
| CORS error | 跨域请求 | 后端加 CORS 中间件 |
| 404 | 路径错误 | 检查 URL 拼写 |
| 500 | 后端代码报错 | 看后端日志 |
| undefined | 数据没拿到 | 检查 API 是否返回数据 |
| 空白页 | JS 报错 | 看 Console |

### 遇到 bug 的标准流程

1. 打开 Console / 后端日志
2. 找到错误信息
3. **复制错误信息**
4. **粘贴给 AI（Claude/Cursor）**
5. 应用 AI 的建议
6. 验证修复
7. 没解决 → 回到步骤 3

> 调试不是天赋，是习惯。养成看日志的习惯，90% 的 bug 都能在 5 分钟内定位。`,
    external_links: JSON.stringify([])
  },

  // ═══ Week 12: 毕业项目 ═══
  { id: 33, week: 12, day: 1, title: "毕业项目：AI 多功能工具箱", theme: "毕业实战", goal: "整合所学，打造一个完整的 AI 工具箱", status: "published",
    content: `## 毕业项目：AI 多功能工具箱

### 项目目标

做一个聚合多种 AI 功能的网页工具箱，包含：

1. **AI 聊天** — 接入 OpenAI/Claude API
2. **文档问答** — 上传 PDF，基于文档内容提问（RAG）
3. **提示词模板库** — 常用 Prompt 一键复制
4. **翻译助手** — 中英互译

### 技术要求

- 前端：React + TypeScript + Tailwind CSS
- 后端：FastAPI + LangChain
- 部署：GitHub Pages + Render
- 版本管理：Git + GitHub

### 评分标准

| 标准 | 权重 |
|------|------|
| 功能完整 | 40% |
| 代码规范 | 20% |
| UI 设计 | 20% |
| 文档质量 | 10% |
| 部署上线 | 10% |

### 第一步

\`\`\`bash
npm create vite@latest ai-toolbox -- --template react-ts
cd ai-toolbox
npm i react-router-dom axios tailwindcss @tailwindcss/vite
\`\`\`

> 用你在前 11 周学到的所有知识，独立完成这个项目。遇到问题先问 AI，解决不了再找人问。

完成这个项目，你就从"AI 小白"变成了"能独立部署项目的 AI 开发者"。`,
    external_links: JSON.stringify([])
  },
  { id: 34, week: 12, day: 2, title: "结业总结：AI 时代的开发者", theme: "毕业实战", goal: "回顾所学，展望下一步学习方向", status: "published",
    content: `## 结业总结

### 12 周你学会了什么

| 阶段 | 内容 | 核心技能 |
|------|------|---------|
| W1-W2 | AI 认知 | 理解 AI、写好 Prompt |
| W3-W4 | 开发基础 | HTML/CSS/JS、Git/GitHub |
| W5-W6 | 前端进阶 | React、Vite、Tailwind |
| W7-W8 | 部署与后端 | 部署、域名、FastAPI、数据库 |
| W9-W10 | AI 开发 | API 调用、RAG、LangChain |
| W11-W12 | 实战总结 | 完整项目、调试、毕业设计 |

### 下一步学什么？

**如果你想深入前端：**
- Next.js（React 全栈框架）
- TypeScript 高级类型
- 前端性能优化

**如果你想深入后端：**
- 数据库设计（PostgreSQL）
- Docker 容器化
- 微服务架构

**如果你想深入 AI：**
- Fine-tuning（微调模型）
- Agent 开发（AutoGPT 模式）
- 多模态 AI（图像+文字+语音）

### 最重要的建议

> 不要只是学。做。做一个你想用的东西，哪怕很小。

每天写代码，每天用 AI。12 周前你可能连终端都不敢打开，现在你能自己部署一个完整项目。

**进步永无止境。继续前进。**`,
    external_links: JSON.stringify([])
  },
];

// ── 项目工坊数据 ──────────────────────────────────────────────

export const GUEST_PROJECTS: GuestProject[] = [
  {
    id: 1,
    title: "AI 学习追踪器 — 从零部署",
    summary: "就是这个项目！完整走通 React + FastAPI + GitHub Pages 部署流程",
    difficulty: "入门",
    tags: ["React", "FastAPI", "GitHub Pages"],
    steps: [
      { order: 1, title: "克隆项目到本地",
        content: "打开终端，执行：\n\n```bash\ngit clone https://github.com/Tryet0208/ai-learning-tracker.git\ncd ai-learning-tracker\n```\n\n用 VS Code 打开项目文件夹。" },
      { order: 2, title: "启动前端",
        content: "```bash\ncd frontend\nnpm install\nnpm run dev\n```\n\n浏览器打开 http://localhost:5173，你应该看到登录页面。" },
      { order: 3, title: "启动后端（可选）",
        content: "```bash\ncd backend\npip install -r requirements.txt\nuvicorn main:app --reload\n```\n\n打开 http://localhost:8000/docs 查看 API 文档。\n\n如果没有 Python 环境，跳过这步，游客模式不需要后端。" },
      { order: 4, title: "修改并部署你自己的版本",
        content: "1. Fork 这个仓库到你的 GitHub\n2. 修改 `frontend/src/guestData.ts` 中的课程内容\n3. 修改标题、颜色等个性化内容\n4. 在仓库 Settings → Pages 中启用 GitHub Actions\n5. 等待部署完成，获得你的专属网址" },
      { order: 5, title: "分享给朋友",
        content: "把部署后的网址发给朋友，让他们也能浏览你的 AI 学习课程。\n\n你还以把这个项目写到简历里，展示你的前端开发和部署能力！" },
    ],
    source_links: [{ label: "项目源码", url: "https://github.com/Tryet0208/ai-learning-tracker" }],
  },
  {
    id: 2,
    title: "个人博客网站",
    summary: "用 React + Markdown 搭建一个极简博客，支持深色模式",
    difficulty: "入门",
    tags: ["React", "Markdown", "Tailwind CSS"],
    steps: [
      { order: 1, title: "创建项目",
        content: "```bash\nnpm create vite@latest my-blog -- --template react-ts\ncd my-blog\nnpm i react-router-dom react-markdown\nnpm i -D tailwindcss @tailwindcss/vite\n```\n\n配置 Tailwind：在 `vite.config.ts` 中添加 `import tailwindcss from '@tailwindcss/vite'`，plugins 数组中加入 `tailwindcss()`。" },
      { order: 2, title: "创建文章数据结构",
        content: "在 `src/posts.ts` 中：\n\n```ts\nexport interface Post {\n  slug: string;\n  title: string;\n  date: string;\n  excerpt: string;\n  content: string;\n}\n\nexport const posts: Post[] = [\n  {\n    slug: 'hello-world',\n    title: '你好，世界',\n    date: '2026-01-01',\n    excerpt: '这是我的第一篇博客',\n    content: '# 你好，世界\\n\\n这是我的第一篇博客文章。',\n  },\n];\n```" },
      { order: 3, title: "创建页面路由",
        content: "在 `App.tsx` 中设置路由：\n\n- `/` — 文章列表页\n- `/post/:slug` — 文章详情页\n\n文章列表页遍历 `posts` 数组，显示标题和摘要。文章详情页用 `react-markdown` 渲染 Markdown 内容。" },
      { order: 4, title: "部署到 GitHub Pages",
        content: "参考上一个项目的部署流程，创建 `.github/workflows/deploy.yml`：\n\n```yaml\nname: Deploy\non: push\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    permissions:\n      pages: write\n      id-token: write\n    environment:\n      name: github-pages\n      url: ${{ steps.deploy.outputs.page_url }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci && npm run build\n      - uses: actions/upload-pages-artifact@v3\n        with: { path: dist }\n      - id: deploy\n        uses: actions/deploy-pages@v4\n```" },
      { order: 5, title: "写你的第一篇文章",
        content: "在 `posts.ts` 中添加你的文章。可以写：\n\n- 你的学习心得\n- 技术教程\n- 读书笔记\n\nMarkdown 书写指南：\n- `# 标题`\n- `**粗体**`\n- `[链接](URL)`\n- `![图片](URL)`\n\n每写完一篇，git push，自动部署更新。拥有自己的博客 = 拥有了数字世界的家。" },
    ],
    source_links: [],
  },
  {
    id: 3,
    title: "AI 聊天助手网页",
    summary: "接入 Claude API，做一个自己的 AI 聊天网页",
    difficulty: "进阶",
    tags: ["FastAPI", "React", "Claude API"],
    steps: [
      { order: 1, title: "获取 API Key",
        content: "1. 打开 [console.anthropic.com](https://console.anthropic.com)\n2. 注册/登录\n3. 进入 API Keys 页面\n4. 点击 Create Key，复制保存（只显示一次！）\n\n或者用 OpenAI 的 API Key，流程类似。" },
      { order: 2, title: "搭建后端 API",
        content: "```bash\nmkdir chat-backend && cd chat-backend\npip install fastapi uvicorn anthropic python-dotenv\n```\n\n创建 `.env`：\n```\nANTHROPIC_API_KEY=sk-ant-你的key\n```\n\n创建 `main.py`：\n```python\nimport os\nfrom fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\nfrom anthropic import Anthropic\nfrom dotenv import load_dotenv\nfrom pydantic import BaseModel\n\nload_dotenv()\napp = FastAPI()\napp.add_middleware(CORSMiddleware, allow_origins=[\"*\"], allow_methods=[\"*\"], allow_headers=[\"*\"])\nclient = Anthropic(api_key=os.getenv(\"ANTHROPIC_API_KEY\"))\n\nclass ChatReq(BaseModel):\n    message: str\n\n@app.post(\"/chat\")\ndef chat(req: ChatReq):\n    msg = client.messages.create(\n        model=\"claude-haiku-4-5-20251001\",\n        max_tokens=1024,\n        messages=[{\"role\": \"user\", \"content\": req.message}]\n    )\n    return {\"reply\": msg.content[0].text}\n```\n\n运行：`uvicorn main:app --reload --port 8000`" },
      { order: 3, title: "创建前端聊天界面",
        content: "```bash\nnpm create vite@latest chat-frontend -- --template react-ts\ncd chat-frontend\nnpm i axios\n```\n\n创建 `src/Chat.tsx`：\n```tsx\nimport { useState } from 'react';\nimport axios from 'axios';\n\nexport default function Chat() {\n  const [messages, setMessages] = useState<{role:string;content:string}[]>([]);\n  const [input, setInput] = useState('');\n  const [loading, setLoading] = useState(false);\n\n  const send = async () => {\n    if (!input.trim()) return;\n    const userMsg = { role: 'user', content: input };\n    setMessages(msgs => [...msgs, userMsg]);\n    setInput('');\n    setLoading(true);\n    try {\n      const res = await axios.post('http://localhost:8000/chat', { message: input });\n      setMessages(msgs => [...msgs, { role: 'assistant', content: res.data.reply }]);\n    } catch { setMessages(msgs => [...msgs, { role: 'assistant', content: '出错了，请确保后端在运行' }]); }\n    setLoading(false);\n  };\n\n  return (\n    <div className=\"max-w-2xl mx-auto p-4\">\n      <div className=\"h-[70vh] overflow-y-auto mb-4\">\n        {messages.map((m, i) => (\n          <div key={i} className={`mb-4 ${m.role === 'user' ? 'text-right' : ''}`}>\n            <div className={`inline-block px-4 py-3 rounded-lg ${m.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>\n              {m.content}\n            </div>\n          </div>\n        ))}\n      </div>\n      <div className=\"flex gap-3\">\n        <input value={input} onChange={e => setInput(e.target.value)}\n               onKeyDown={e => e.key === 'Enter' && send()}\n               className=\"flex-1 border rounded px-4 py-3\" placeholder=\"输入消息...\" />\n        <button onClick={send} disabled={loading}\n                className=\"px-6 py-3 bg-gray-900 text-white rounded font-bold\">发送</button>\n      </div>\n    </div>\n  );\n}\n```" },
      { order: 4, title: "测试和优化",
        content: "1. 确保后端运行在 8000 端口\n2. 前端 `npm run dev`\n3. 发送消息，看 AI 回复\n\n**优化方向：**\n- 添加消息历史（把之前的消息也发给 AI）\n- 添加 system prompt 设定 AI 角色\n- 用 Tailwind 美化界面\n- 添加 Markdown 渲染（AI 回复里常有 Markdown）\n- 添加深色模式" },
      { order: 5, title: "部署",
        content: "**前端**：GitHub Pages（参考前两个项目）\n\n**后端**：\n- Render.com（需信用卡）或\n- 本地运行（自己用）\n\n**重要**：API Key 绝对不能放前端代码里！后端环境变量里存，前端通过后端 API 间接调用。\n\n部署后访问你的聊天网页，发给朋友炫耀！" },
    ],
    source_links: [{ label: "Claude API 文档", url: "https://docs.anthropic.com" }],
  },
  {
    id: 4,
    title: "RAG 文档问答系统",
    summary: "上传 PDF，让 AI 基于文档内容回答你的问题",
    difficulty: "高级",
    tags: ["LangChain", "ChromaDB", "FastAPI"],
    steps: [
      { order: 1, title: "安装依赖",
        content: "```bash\npip install langchain langchain-openai langchain-chroma chromadb\npip install fastapi uvicorn python-multipart pypdf\n```" },
      { order: 2, title: "创建 RAG 引擎",
        content: "创建 `rag_engine.py`：\n\n```python\nfrom langchain_openai import OpenAIEmbeddings, ChatOpenAI\nfrom langchain_chroma import Chroma\nfrom langchain_text_splitters import RecursiveCharacterTextSplitter\nfrom langchain_community.document_loaders import PyPDFLoader\nimport os, tempfile\n\ndef process_pdf(file_path: str) -> Chroma:\n    loader = PyPDFLoader(file_path)\n    docs = loader.load()\n    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)\n    chunks = splitter.split_documents(docs)\n    return Chroma.from_documents(chunks, OpenAIEmbeddings())\n\ndef ask(vectorstore, question: str) -> str:\n    results = vectorstore.similarity_search(question, k=3)\n    context = \"\\n\\n\".join([r.page_content for r in results])\n    llm = ChatOpenAI(model=\"gpt-4o-mini\")\n    answer = llm.invoke(\n        f\"基于以下资料回答问题。如果资料中没有相关信息，请如实说不知道。\\n\\n资料：\\n{context}\\n\\n问题：{question}\"\n    )\n    return answer.content\n```" },
      { order: 3, title: "创建 API 接口",
        content: "创建 `main.py`：\n\n```python\nfrom fastapi import FastAPI, UploadFile\nfrom pydantic import BaseModel\nimport tempfile, os\nfrom rag_engine import process_pdf, ask\n\napp = FastAPI()\nvectorstore = None  # 存储已处理的文档\n\n@app.post(\"/upload\")\nasync def upload(file: UploadFile):\n    global vectorstore\n    with tempfile.NamedTemporaryFile(delete=False, suffix=\".pdf\") as tmp:\n        tmp.write(await file.read())\n        tmp_path = tmp.name\n    vectorstore = process_pdf(tmp_path)\n    os.unlink(tmp_path)\n    return {\"message\": \"文档处理完成，可以开始提问\"}\n\nclass AskReq(BaseModel):\n    question: str\n\n@app.post(\"/ask\")\ndef ask_question(req: AskReq):\n    if vectorstore is None:\n        return {\"error\": \"请先上传文档\"}\n    answer = ask(vectorstore, req.question)\n    return {\"answer\": answer}\n```\n\n运行：`uvicorn main:app --reload`" },
      { order: 4, title: "创建前端界面",
        content: "做一个简洁的单页应用：\n\n- 上传区域：拖拽或点击上传 PDF\n- 进度提示：显示处理进度\n- 问答区：输入问题，显示 AI 回答\n- 历史记录：显示之前的问答\n\n用 `axios` 调用后端的 `/upload` 和 `/ask` 接口。" },
      { order: 5, title: "扩展功能",
        content: "基础版完成后，可以扩展：\n\n1. **支持更多格式**：Word、Markdown、网页\n2. **多文档管理**：同时上传多个文档\n3. **对话历史**：多轮对话，记住上下文\n4. **引用溯源**：回答中标注信息来自文档的第几页\n5. **模型切换**：支持切换不同 LLM\n\n这个项目展示了 RAG 的核心价值——让 AI 基于你的私有数据回答问题。做完这个，你就具备了企业级 AI 应用开发的基础能力。" },
    ],
    source_links: [{ label: "LangChain RAG 教程", url: "https://python.langchain.com/docs/tutorials/rag/" }],
  },
];
