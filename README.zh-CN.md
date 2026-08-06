# create-new-react-component

[English](./README.md)

一个用于快速生成 React 组件目录的命令行工具。

`create-new-react-component` 支持交互式创建，也支持可脚本化的命令行参数。它可以批量生成 JavaScript、TypeScript、CSS Modules、SCSS Modules、props 占位代码、React import、可选测试文件、可选 Storybook story 文件，并可选择使用 Prettier 格式化。

适合在已有 React 项目中快速生成组件目录；它不是完整应用脚手架，也不会替代 Vite、Next.js 或 Storybook。

## 功能特性

- 交互式创建组件，适合日常开发
- 非交互式参数，适合脚本、npm scripts 和编辑器集成
- 支持在一条命令中生成多个组件
- 支持通过 `.cnrc.json` 设置项目默认值
- 支持 JavaScript 和 TypeScript 输出
- 支持 CSS Module 和 SCSS Module 文件生成
- 支持通过 `--dir` 指定目标目录
- 支持通过 `--with-test` 生成组件测试文件
- 支持通过 `--with-story` 生成 Storybook story 文件
- 支持通过 `--format` 使用项目 Prettier 配置格式化文件
- 支持 functional、arrow function、class、memoized 和 `forwardRef` 组件模板
- PascalCase 组件名校验
- 支持自定义模板文件

## 常见搜索场景

- React component generator CLI
- TypeScript React component scaffold
- 从终端生成 React 组件目录
- 生成带 CSS Modules 或 SCSS Modules 的 React 组件
- 通过 CLI 生成 React 组件测试文件
- 通过 CLI 生成 Storybook story 文件
- 支持自定义模板的 React 组件生成器

## 安装

全局安装：

```bash
npm install -g create-new-react-component
```

或者安装到项目中：

```bash
npm install --save-dev create-new-react-component
```

也可以直接通过 `npx` 使用：

```bash
npx create-new-react-component Button
```

## 快速开始

启动交互式提示：

```bash
create-new-react-component
```

或者直接通过一条命令生成组件：

```bash
create-new-react-component Button --type arrow --lang ts --style scss --with-props --with-test --with-story
```

会生成：

```text
Button/
├── Button.module.scss
├── Button.stories.tsx
├── Button.test.tsx
├── Button.tsx
└── index.ts
```

生成到指定目录：

```bash
create-new-react-component Button --dir src/components
```

会生成：

```text
src/components/Button/
├── Button.module.css
├── Button.jsx
└── index.js
```

使用相同参数一次生成多个组件：

```bash
create-new-react-component Button UserCard Modal --lang ts --style scss --format
```

## 交互式模式

不传组件名时，会进入交互式模式：

```bash
create-new-react-component
```

命令行会依次询问：

1. 一个或多个组件名称，例如 `Button UserProfile` 或 `Button, UserProfile`
2. 组件类型
3. 使用 JavaScript 还是 TypeScript
4. 样式方案
5. 是否生成 props 占位代码
6. 是否添加 React import
7. 是否生成测试文件
8. 是否生成 Storybook story 文件
9. 是否使用 Prettier 格式化

组件名必须使用 PascalCase。CLI 会在写入文件前校验整个批次，因此无效、重复或已存在的组件名不会留下部分生成结果。

## 示例

生成带 SCSS Modules 和测试文件的 TypeScript 组件：

```bash
create-new-react-component ProductCard --lang ts --style scss --with-test
```

生成带 Storybook story 文件的组件：

```bash
create-new-react-component ProductCard --lang ts --with-story
```

生成带 props 占位代码的 `forwardRef` 组件：

```bash
create-new-react-component TextInput --type forwardRef --lang ts --with-props
```

不生成样式文件：

```bash
create-new-react-component IconButton --style none
```

生成到共享组件目录：

```bash
create-new-react-component EmptyState --dir src/components
```

使用最近的 Prettier 配置批量生成并格式化组件：

```bash
create-new-react-component Button UserCard Modal --lang ts --format
```

初始化项目默认配置和可编辑的 starter templates：

```bash
create-new-react-component init
```

该命令只创建缺失文件，不会覆盖已有配置：

```text
.cnrc/
├── config.json
└── templates/
    ├── component.jsx
    └── component.tsx
```

## 非交互式模式

可以在一条命令里传入一个或多个组件名和共用参数：

```bash
create-new-react-component UserCard --type functional --lang js --style css
create-new-react-component Dialog --type forwardRef --lang ts --style scss --with-props
create-new-react-component Badge --type memoized --style none
create-new-react-component Button --dir src/components
create-new-react-component Button --with-test
create-new-react-component Button --with-story
create-new-react-component Button UserCard Modal --lang ts --format
```

也可以在 `.cnrc/config.json` 或向后兼容的 `.cnrc.json` 中设置项目默认值：

```json
{
  "lang": "ts",
  "style": "scss",
  "componentType": "arrow",
  "withProps": true,
  "withTest": true,
  "withStory": true,
  "format": true,
  "baseDir": "src/components"
}
```

### 参数说明

| 参数 | 可选值 | 说明 |
| --- | --- | --- |
| `-T, --type <type>` | `functional`, `arrow`, `class`, `memoized`, `forwardRef` | 要生成的组件模板 |
| `-l, --lang <lang>` | `js`, `ts` | 输出语言 |
| `-s, --style <style>` | `css`, `scss`, `none` | 是否生成样式文件，以及样式文件类型 |
| `-d, --dir <path>` | 目录路径 | 组件目录要生成到的位置 |
| `--with-props` | | 添加 props 参数；TypeScript 模式下会生成 `Props` interface |
| `--with-react-import` | | 在适用场景下添加 `import React from 'react';` |
| `--with-test` | | 添加基础的 `Component.test.jsx` 或 `Component.test.tsx` 测试文件 |
| `--with-story` | | 添加基础的 `Component.stories.jsx` 或 `Component.stories.tsx` story 文件 |
| `--format` | | 使用 Prettier 格式化所有生成文件 |
| `-t, --template <path>` | 文件路径 | 将自定义模板文件加入交互式模板选择列表 |
| `--template-dir <path>` | 目录路径 | 将目录中的自定义模板加入交互式模板选择列表 |
| `-h, --help` | | 查看帮助信息 |
| `-V, --version` | | 查看当前安装版本 |

非交互式模式的默认值：

```text
--type functional
--lang js
--style css
```

## 项目配置

运行 `create-new-react-component init` 会创建 `.cnrc/config.json` 以及可编辑的 JavaScript 和 TypeScript starter templates。重复执行 `init` 时会保留所有已有文件，只补齐缺失文件。

也可以手动添加 `.cnrc/config.json`。已有的 `.cnrc.json` 会继续受到支持，保证向后兼容。

支持字段：

| 字段 | 可选值 | 说明 |
| --- | --- | --- |
| `lang` | `js`, `ts` | 默认输出语言 |
| `style` | `css`, `scss`, `none` | 默认样式文件行为 |
| `componentType` | `functional`, `arrow`, `class`, `memoized`, `forwardRef` | 默认内置组件模板 |
| `withProps` | `true`, `false` | 默认是否生成 props 占位代码 |
| `withReactImport` | `true`, `false` | 默认是否生成 React import |
| `withTest` | `true`, `false` | 默认是否生成组件测试文件 |
| `withStory` | `true`, `false` | 默认是否生成 Storybook story 文件 |
| `format` | `true`, `false` | 默认是否使用 Prettier 格式化 |
| `baseDir` | 目录路径 | 默认目标目录 |

优先级：

```text
命令行参数 > .cnrc/config.json > .cnrc.json > 内置默认值
```

可以通过 `--template` 显式使用初始化生成的 starter template，例如：

```bash
create-new-react-component Card --template .cnrc/templates/component.tsx
```

例如，下面的配置会让 `create-new-react-component Button` 生成 `src/components/Button/Button.tsx`、`Button.module.scss`、`Button.test.tsx`、`Button.stories.tsx` 和 `index.ts`：

```json
{
  "lang": "ts",
  "style": "scss",
  "componentType": "arrow",
  "withProps": true,
  "withTest": true,
  "withStory": true,
  "format": true,
  "baseDir": "src/components"
}
```

命令行参数会覆盖配置文件：

```bash
create-new-react-component Button --lang js --style none --dir lib/ui
```

class 组件会自动包含 React import，因为它会继承 `React.Component`。

如果 `--dir` 指向的目录不存在，CLI 会自动创建父级目录。

默认不会格式化输出。启用 `--format` 或设置 `"format": true` 后，CLI 会使用最近的 Prettier 配置和 `.editorconfig` 格式化组件、入口、样式、测试、story 和自定义模板文件；没有项目配置时使用 Prettier 默认值。

## 生成结果

启用样式时，生成的组件会导入 CSS 或 SCSS Module，并使用 `styles.root`。

```tsx
import styles from './Button.module.scss';

interface Props {}

const Button = (props: Props) => {
    return (
      <div className={styles.root}>
        {/* Add your component content here */}
      </div>
    );
}

export default Button;
```

样式文件内容：

```scss
/* Add your component styles here */
.root {
}
```

入口文件会导出组件：

```ts
export { default } from './Button';
```

启用 `--with-test` 后，CLI 还会在组件旁生成测试文件：

```tsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button />);

    expect(screen).toBeDefined();
  });
});
```

启用 `--with-story` 后，CLI 还会在组件旁生成 Storybook CSF story 文件：

```tsx
import Button from './Button';

const meta = {
  title: 'Components/Button',
  component: Button
};

export default meta;

export const Default = {};
```

## 组件类型

### Functional

```jsx
function Button() {
    return (
      <>
        {/* Add your component content here */}
      </>
    );
}

export default Button;
```

### Arrow Function

```jsx
const Button = () => {
    return (
      <>
        {/* Add your component content here */}
      </>
    );
}

export default Button;
```

### Class

```jsx
import React from 'react';

class Button extends React.Component {
    render() {
        return (
            <>
                {/* Add your component content here */}
            </>
        );
    }
}

export default Button;
```

### Memoized

```jsx
import { memo } from 'react';

const Button = memo(() => {
    return (
        <>
            {/* Add your component content here */}
        </>
    );
});

export default Button;
```

### Forward Ref

```tsx
import { forwardRef } from 'react';

const Button = forwardRef<HTMLDivElement>((_props, ref) => {
    return (
        <div ref={ref}>
            {/* Add your component content here */}
        </div>
    );
});

export default Button;
```

## 自定义模板

使用一个自定义模板文件：

```bash
create-new-react-component --template ./templates/card.tsx
```

或者使用一个模板目录：

```bash
create-new-react-component --template-dir ./templates
```

支持的模板扩展名：

```text
.js
.jsx
.ts
.tsx
```

可用模板变量：

| 变量 | `UserCard` 对应的输出 |
| --- | --- |
| `{{componentName}}` | `UserCard` |
| `{{ComponentName}}` | `UserCard` |
| `{{COMPONENT_NAME}}` | `USERCARD` |
| `{{component_name}}` | `usercard` |

模板示例：

```tsx
import styles from './{{ComponentName}}.module.css';

interface Props {}

const {{ComponentName}} = (props: Props) => {
  return <div className={styles.root}>{{componentName}}</div>;
};

export default {{ComponentName}};
```

## 组件名校验

组件名必须：

- 使用 PascalCase，例如 `Button`、`UserCard` 或 `NavigationMenu`
- 至少包含 2 个字符
- 避免文件系统不支持的特殊字符
- 避免 JavaScript 和 React 保留名称
- 避免过于模糊的常见名称，例如 `App`、`Main` 或 `Index`

## 本地开发

克隆仓库后安装依赖：

```bash
npm install
```

运行测试：

```bash
npm test
```

本地运行 CLI：

```bash
npm run create-new-react-component
```

## 许可证

MIT
