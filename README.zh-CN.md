# create-new-react-component

[English](./README.md)

一个用于快速生成 React 组件目录的命令行工具。

`create-new-react-component` 支持交互式创建，也支持可脚本化的命令行参数。它可以生成 JavaScript、TypeScript、CSS Modules、SCSS Modules、props 占位代码、React import，以及常见的组件模板。

## 功能特性

- 交互式创建组件，适合日常开发
- 非交互式参数，适合脚本、npm scripts 和编辑器集成
- 支持 JavaScript 和 TypeScript 输出
- 支持 CSS Module 和 SCSS Module 文件生成
- 支持通过 `--dir` 指定目标目录
- 支持 functional、arrow function、class、memoized 和 `forwardRef` 组件模板
- PascalCase 组件名校验
- 支持自定义模板文件

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
create-new-react-component Button --type arrow --lang ts --style scss --with-props
```

会生成：

```text
Button/
├── Button.module.scss
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

## 交互式模式

不传组件名时，会进入交互式模式：

```bash
create-new-react-component
```

命令行会依次询问：

1. 组件名称，例如 `Button` 或 `UserProfile`
2. 组件类型
3. 使用 JavaScript 还是 TypeScript
4. 样式方案
5. 是否生成 props 占位代码
6. 是否添加 React import

组件名必须使用 PascalCase。

## 非交互式模式

可以在一条命令里传入组件名和参数：

```bash
create-new-react-component UserCard --type functional --lang js --style css
create-new-react-component Dialog --type forwardRef --lang ts --style scss --with-props
create-new-react-component Badge --type memoized --style none
create-new-react-component Button --dir src/components
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

class 组件会自动包含 React import，因为它会继承 `React.Component`。

如果 `--dir` 指向的目录不存在，CLI 会自动创建父级目录。

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
