# Plan: 旋转知识星球 (Rotating Knowledge Planet)

## 目标
构建一个 React 网页应用：一个可交互的 3D 旋转知识星球
- 星球由多个"知识节点"构成，分布在球面上
- 星球自动缓慢旋转，支持鼠标拖拽旋转
- 每个节点可点击，点击后弹出该知识点的详情面板
- 节点之间可有连线，形成知识网络
- 视觉：低饱和度、深色太空感背景、清晰层次（避免蓝紫渐变）

## Stage 1 — 加载技能与搭建
- 加载 `vibecoding-webapp-swarm` 技能，按其编排流程执行
- 技术栈：React + TypeScript + Tailwind + Three.js (react-three-fiber) 或纯 Canvas 3D 投影
- 委派 coder subagent 实现核心组件：
  - Planet 场景：球面节点布局（斐波那契球分布）、自动旋转 + 拖拽
  - Node 组件：可点击、悬停高亮、标签显示
  - 详情面板：点击节点后滑出，展示标题/描述/关联节点
  - 示例知识数据（如"AI 知识图谱"主题，12-20 个节点，分组配色）

## Stage 2 — 验证与打磨
- 构建项目，修复错误
- 检查交互：旋转、点击、面板开合

## Stage 3 — 交付
- 调用 website_version_manager build_version 保存版本，供预览
