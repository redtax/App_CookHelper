# 味溯新东方 APP 开发文档

## 1. 项目概述

### 1.1 项目简介

味溯新东方是一款基于 React Native + Expo 开发的移动端菜谱应用，旨在帮助用户轻松学习和制作各种美食。应用提供菜谱浏览、详细步骤指导、备料清单管理等功能，支持离线使用。

### 1.2 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | React Native | 0.81.5 |
| 构建工具 | Expo | ~54.0.33 |
| 语言 | TypeScript | ~5.9.2 |
| 导航 | React Navigation | ^7.2.3 |
| 状态管理 | React Context | 内置 |
| 数据存储 | AsyncStorage | ^3.0.2 |
| 图片选择 | expo-image-picker | 最新 |
| 剪贴板 | expo-clipboard | 最新 |

### 1.3 核心功能

| 功能模块 | 功能描述 | 对应文件 |
|----------|----------|----------|
| 菜谱列表 | 展示所有菜谱，支持搜索和分类筛选 | `HomeScreen.tsx` |
| 菜谱详情 | 展示菜谱完整信息和成品图片 | `RecipeDetailScreen.tsx` |
| 备料食材 | 食材清单勾选管理 | `PreparationIngredientsScreen.tsx` |
| 备料步骤 | 备料步骤指导 | `PreparationStepsScreen.tsx` |
| 炒菜步骤 | 分步炒菜指导，支持计时和小贴士 | `CookingScreen.tsx` |
| 菜谱编辑 | 创建/编辑菜谱 | `RecipeEditScreen.tsx` |
| 图片选择 | 支持相册图片上传和编辑 | `ImagePickerButton.tsx` |
| 导入菜谱 | 统一的菜谱导入界面 | `ImportRecipeModal.tsx` |
| 食材库存 | 管理家中食材库存 | `IngredientScreen.tsx` |
| 采购清单 | 管理购物清单 | `IngredientScreen.tsx` |
| 烹饪笔记 | 记录烹饪心得 | `CookingNotesScreen.tsx` |
| 收藏夹 | 收藏管理喜爱的菜谱 | `FavoriteScreen.tsx` |
| 设置/关于 | 应用设置和文档展示 | `SettingsScreen.tsx`, `AboutScreen.tsx` |

---

## 2. 项目结构

```
CookHelper/
├── android/                    # Android 原生代码
├── assets/                     # 静态资源
│   ├── recipes.json           # 菜谱初始数据（JSON格式）
│   └── icon.png              # 应用图标
├── media/
│   └── images/                # 菜谱成品图片（316张）
├── src/
│   ├── screens/               # 页面组件
│   │   ├── HomeScreen.tsx
│   │   ├── RecipeDetailScreen.tsx
│   │   ├── PreparationIngredientsScreen.tsx
│   │   ├── PreparationStepsScreen.tsx
│   │   ├── CookingScreen.tsx
│   │   ├── RecipeEditScreen.tsx
│   │   ├── IngredientScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── FavoriteScreen.tsx
│   │   ├── CookingNotesScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── AboutScreen.tsx
│   │   └── ImportRecipeModal.tsx
│   ├── components/            # 可复用组件
│   │   └── ImagePickerButton.tsx
│   ├── context.tsx            # 全局状态管理
│   ├── navigation.tsx         # 导航配置
│   ├── storage.ts             # 数据持久化
│   ├── parseRecipe.ts         # 菜谱数据解析
│   ├── types.ts               # TypeScript 类型定义
│   ├── imageMap.ts            # 图片资源映射表
│   ├── OptimizedImage.tsx     # 优化图片组件
│   └── ImageCacheManager.ts   # 图片缓存管理
├── App.tsx                    # 应用入口
├── app.json                   # Expo 配置
├── metro.config.js            # Metro 打包配置
└── package.json               # 依赖配置
```

---

## 3. 核心数据结构

### 3.1 类型定义（`types.ts`）

```typescript
export interface Ingredient {
  name: string;           // 食材名称
  amount: string;         // 用量
  unit?: string;          // 单位
  notes?: string;         // 备注
  category?: 'main' | 'auxiliary' | 'seasoning'; // 食材分类
}

export interface PreparationStep {
  id: string;             // 步骤ID
  description: string;    // 步骤描述
  ingredients?: string[]; // 涉及食材
  tips?: string;          // 小贴士
  duration?: string;      // 预计耗时
}

export interface CookingStep {
  id: string;             // 步骤ID
  instruction: string;    // 操作说明
  duration?: string;      // 预计耗时
  tips?: string;          // 小贴士
  ingredients?: string[]; // 涉及食材
}

export interface Recipe {
  id: string;                     // 菜谱唯一标识
  name: string;                   // 菜谱名称
  description?: string;           // 简介
  overallFlow?: string;           // 整体流程
  prepTime?: string;              // 准备时间
  cookTime?: string;              // 烹饪时间
  servings?: number;              // 份量
  difficulty?: 'easy' | 'medium' | 'hard'; // 难度
  technique?: string;             // 烹饪技法
  flavor?: string;                // 菜肴味型
  categories: string[];           // 分类标签
  tags: string[];                 // 标签
  ingredients: Ingredient[];      // 全部食材
  mainIngredients: Ingredient[];  // 主料
  auxiliaryIngredients: Ingredient[]; // 辅料
  seasonings: Ingredient[];       // 调料
  preparationSteps: PreparationStep[]; // 备料步骤
  cookingSteps: CookingStep[];    // 制作步骤
  imageUrl?: string;              // 成品图片路径
  isFavorite?: boolean;           // 是否收藏
  lastOpenedAt?: number;          // 上次打开时间
  modifiedByUser?: boolean;       // 是否用户修改
}

export interface InventoryItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  expiryDate?: string;
  category: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
}

export interface CookingNote {
  id: string;
  text: string;
  recipeId?: string;
  recipeName?: string;
  createdAt: number;
}

export interface MealPlanItem {
  id: string;
  recipeId: string;
  recipeName: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
```

### 3.2 菜谱数据格式

菜谱初始数据存储在 `assets/recipes.json`，格式为 JSON 数组：

```json
[
  {
    "id": "红烧肉",
    "name": "红烧肉",
    "description": "色泽红亮，肥而不腻",
    "overallFlow": "备料→炒糖→炖煮→收汁",
    "categories": ["家常菜"],
    "tags": ["红烧", "猪肉"],
    "servings": 4,
    "prepTime": "30分钟",
    "cookTime": "90分钟",
    "difficulty": "medium",
    "technique": "红烧",
    "flavor": "酱香味",
    "mainIngredients": [{"name": "五花肉", "amount": "500", "unit": "克"}],
    "auxiliaryIngredients": [{"name": "土豆", "amount": "2", "unit": "个"}],
    "seasonings": [{"name": "冰糖", "amount": "30", "unit": "克"}],
    "preparationSteps": [
      {"id": "prep1", "description": "五花肉切块焯水", "tips": "撇去浮沫"}
    ],
    "cookingSteps": [
      {"id": "cook1", "instruction": "锅中放油，炒糖色", "duration": "10分钟", "tips": "小火慢炒"}
    ],
    "imageUrl": "image84.jpeg"
  }
]
```

---

## 4. 核心模块设计

### 4.1 导航结构（`navigation.tsx`）

应用采用 Stack Navigator 结合自定义底部导航：

| 页面 | 路由名称 | 说明 |
|------|----------|------|
| 首页 | Home | 菜谱列表，支持搜索和分类 |
| 备料中心 | IngredientCenter | 食材库存和采购清单 |
| 下厨 | CookingStart | 制作步骤相关入口 |
| 我的 | Profile | 个人中心（收藏、笔记、设置等） |
| 菜谱详情 | RecipeDetail | 展示菜谱完整信息 |
| 备料食材 | PreparationIngredients | 食材清单勾选 |
| 备料步骤 | PreparationSteps | 备料步骤指导 |
| 炒菜步骤 | Cooking | 分步炒菜指导 |
| 菜谱编辑 | RecipeEdit | 创建/编辑菜谱 |
| 收藏夹 | Favorite | 收藏的菜谱列表 |
| 烹饪笔记 | CookingNotes | 烹饪心得记录 |
| 设置 | Settings | 应用设置 |
| 关于 | About | 关于页面和文档展示 |

### 4.2 状态管理（`context.tsx`）

全局状态通过 `AppContext` 管理：

```typescript
export interface AppState {
  recipes: Recipe[];                  // 菜谱列表
  selectedRecipe: Recipe | null;      // 当前选中菜谱
  searchQuery: string;                // 搜索关键词
  selectedCategory: string | null;    // 选中分类
  preparationCheckedItems: string[];  // 已勾选食材
  preparationCheckedSteps: string[];  // 已完成备料步骤
  inventoryItems: InventoryItem[];    // 食材库存
  shoppingItems: ShoppingItem[];      // 采购清单
  cookingNotes: CookingNote[];        // 烹饪笔记
  mealPlan: MealPlanItem[];           // 计划菜单
  recentlyOpenedIds: string[];        // 最近打开的菜谱
  modifiedRecipeIds: string[];        // 用户修改过的菜谱
}
```

### 4.3 数据持久化（`storage.ts`）

- **存储方案**：使用 AsyncStorage 本地存储
- **初始化机制**：首次启动时从 `assets/recipes.json` 直接导入初始数据（通过 require 内联）
- **版本管理**：通过 `INITIALIZED_KEY` 控制数据更新

关键函数：
- `loadRecipes()` - 加载菜谱数据
- `saveRecipes()` - 保存菜谱数据
- `loadRecipesFromAsset()` - 从 assets 加载菜谱（直接 require）
- `initializeStorage()` - 初始化存储空间

### 4.4 图片选择组件（`ImagePickerButton.tsx`）

提供图片选择、预览、更换和移除功能：
- 使用 `expo-image-picker` 访问相册
- 使用 `fetch + write` 模式处理 content:// 和 file:// URI
- 支持图片裁剪和压缩

### 4.5 统一导入模块（`ImportRecipeModal.tsx`）

共享的菜谱导入界面，支持：
- 自动从剪贴板粘贴内容
- 图片上传
- 完整格式参考
- 格式复制功能

---

## 5. 页面功能详解

### 5.1 首页（`HomeScreen.tsx`）

**功能**：
- 展示菜谱列表（卡片形式）
- 搜索框筛选菜谱（支持名称、标签、主料）
- 分类筛选（按标签分类）
- 最近打开的菜谱排序置顶
- 点击卡片进入详情页

**搜索逻辑**：
1. 匹配菜谱名称
2. 匹配标签
3. 匹配主料和未分类食材

### 5.2 菜谱详情页（`RecipeDetailScreen.tsx`）

**功能**：
- 展示菜谱成品图片（按需加载）
- 显示基本信息（份量、时间、难度、技法、味型、流程）
- 展示食材分类（主料/辅料/调料）
- 显示制作步骤
- 操作按钮：开始备料、编辑菜谱、导出菜谱、导入菜谱
- 收藏/取消收藏功能

### 5.3 备料食材页（`PreparationIngredientsScreen.tsx`）

**功能**：
- 展示所有食材清单
- 支持勾选已准备食材
- 支持一键加入采购清单（显示 Toast 提示）
- 显示已完成比例
- 完成后进入备料步骤

### 5.4 备料步骤页（`PreparationStepsScreen.tsx`）

**功能**：
- 分步展示备料步骤
- 支持勾选已完成步骤
- 显示步骤小贴士
- 完成后进入制作步骤

### 5.5 制作步骤页（`CookingScreen.tsx`）

**功能**：
- 分步展示制作步骤
- 显示每步预计耗时
- 提供烹饪小贴士
- 上一步/下一步导航
- 当前步骤高亮显示
- 断点续做功能

### 5.6 菜谱编辑页（`RecipeEditScreen.tsx`）

**功能**：
- 支持创建新菜谱和编辑现有菜谱
- 编辑菜谱名称、描述、分类
- 管理食材清单（主料/辅料/调料）
- 管理备料和制作步骤（拖拽排序）
- 上传/更换成品图片
- 保存修改（不退出编辑）

### 5.7 个人中心（`ProfileScreen.tsx`）

**功能**：
- 六宫格菜单：收藏、计划菜单、烹饪笔记、食材库存、设置、关于
- 无数据时显示数字 0，设置和关于不显示计数
- 菜单文字居中显示

---

## 6. 数据导入流程

### 6.1 菜谱数据生成工具

项目包含 Python 脚本用于菜谱数据转换：

| 脚本 | 功能 |
|------|------|
| `process_recipes.py` | 从 Word 文档解析菜谱，生成规范化文本文件 |
| `convert_recipes_to_app_format.py` | 将文本文件转换为 APP 可用的 JSON 格式 |
| `generate_image_map.py` | 生成图片资源映射表 |

### 6.2 数据转换流程

1. **原始数据**：Word 文档 `数字版全套菜谱（原稿）.docx`
2. **解析阶段**：`process_recipes.py` → 生成 `output_recipes/*.txt`（539个菜谱）
3. **转换阶段**：`convert_recipes_to_app_format.py` → 生成 `assets/recipes.json`
4. **图片映射**：`generate_image_map.py` → 生成 `src/imageMap.ts`

### 6.3 解析器特性

`parseRecipe.ts` 支持的特性：
- 多种分隔符：Tab、空格、破折号、省略号等
- 主体流程识别
- 食材分类（主料/辅料/调料）
- 备料步骤和制作步骤独立处理
- 小贴士和耗时提取
- 标签支持

---

## 7. 开发与构建

### 7.1 环境要求

- Node.js ≥ 18.x
- npm ≥ 9.x
- Expo CLI ≥ 6.x
- Android SDK（Android 开发）
- Xcode（iOS 开发，仅 Mac）

### 7.2 安装依赖

```bash
cd CookHelper
npm install
```

### 7.3 启动开发服务器

```bash
npm start
```

### 7.4 构建命令

| 命令 | 说明 |
|------|------|
| `npm run android` | 构建并运行 Android 应用 |
| `npm run ios` | 构建并运行 iOS 应用 |
| `npm run web` | 启动 Web 预览 |

### 7.5 资源文件配置

- `metro.config.js`：配置资源扩展名
- `app.json`：配置 assetBundlePatterns

### 7.6 数据更新流程

当需要更新菜谱数据时：

1. 修改 `process_recipes.py`（如需）
2. 运行 `python process_recipes.py` 生成新的文本文件
3. 运行 `python convert_recipes_to_app_format.py` 生成新的 JSON
4. 运行 `python generate_image_map.py` 更新图片映射
5. 更新 `storage.ts` 中的 `INITIALIZED_KEY` 版本号
6. 重启应用，数据将自动重新加载

---

## 8. 性能优化

### 8.1 图片优化

| 策略 | 实现 |
|------|------|
| 按需加载 | 仅在访问详情页时加载图片 |
| LRU 缓存 | 限制内存中图片数量（最多 5 张） |
| 资源映射 | 使用 `require()` 静态引用，Metro 优化打包 |

### 8.2 数据优化

| 策略 | 实现 |
|------|------|
| 内联数据 | 菜谱数据直接 require 到 JS Bundle |
| 延迟加载 | 首页只加载必要字段 |
| 搜索优化 | 本地搜索，无需网络请求 |
| 增量更新 | 通过版本号控制数据更新 |

### 8.3 UI 优化

| 策略 | 实现 |
|------|------|
| 虚拟列表 | 长列表使用 FlatList 优化渲染 |
| 懒加载组件 | 复杂组件按需渲染 |
| 动画优化 | 使用原生动画 API |

---

## 9. 常见问题

### 9.1 图片不显示

**原因**：
- 图片路径错误
- Metro 未打包图片资源
- `imageMap.ts` 未包含该图片

**解决方案**：
1. 检查 `imageUrl` 是否为纯文件名（如 `image84.jpeg`）
2. 确认图片存在于 `media/images/` 目录
3. 运行 `python generate_image_map.py` 更新映射表
4. 检查 `app.json` 配置了 `media/images/*`

### 9.2 数据未更新

**原因**：
- AsyncStorage 中存在旧数据
- `INITIALIZED_KEY` 版本号未更新

**解决方案**：
1. 更新 `storage.ts` 中的 `INITIALIZED_KEY`（如 `v10` → `v11`）
2. 卸载应用重新安装，或清除应用数据

### 9.3 食材显示为一项

**原因**：
- 食材分隔符未正确识别

**解决方案**：
- 检查 `parseRecipe.ts` 中的分隔符正则
- 确保支持 Tab、空格、破折号、省略号等

### 9.4 导入图片后看不到

**原因**：
- URI 处理方式错误，content:// 格式不被支持

**解决方案**：
- 使用 `fetch + arrayBuffer + write` 模式保存图片
- 兼容 file:// 和 content:// URI

---

## 10. 版本历史

| 版本 | 日期 | 主要更新 |
|------|------|----------|
| v0.1.0 | 2026-05-11 | 项目初始化，基础功能 |
| v0.2.0 | 2026-05-16 | 菜谱编辑和导入导出功能 |
| v0.3.0 | 2026-05-16 | 首页布局优化 |
| v0.4.0 | 2026-05-16 | 文档完善 |
| v1.0.0 | 2026-05-16 | MVP发布 |
| v1.0.1 | 2026-05-17 | Bug修复 |
| v1.1.0 | 2026-05-18 | 数据结构升级 |
| v1.2.0 | 2026-05-19 | 在线编辑全面升级 |
| v1.2.1 | 2026-05-19 | 搜索逻辑微调 |
| v2.0.0 | 2026-05-20 | 图片功能升级 |
| v2.1.0 | 2026-05-21 | 全量菜谱数据导入 |
| v3.0.0 | 2026-05-21 | 味溯新东方全新升级 |
| v3.1.0 | 2026-05-22 | 菜谱导入和图片功能升级 |

---

## 11. 附录

### 11.1 目录结构说明

```
src/
├── screens/               # 页面组件
├── components/            # 可复用组件
├── context.tsx            # 全局状态
├── navigation.tsx         # 导航配置
├── storage.ts             # 数据持久化
├── parseRecipe.ts         # 菜谱解析工具
├── types.ts               # 类型定义
├── ImageCacheManager.ts   # 图片缓存
├── OptimizedImage.tsx     # 优化图片组件
└── imageMap.ts            # 图片资源映射
```

### 11.2 关键文件说明

| 文件 | 作用 |
|------|------|
| `context.tsx` | 管理全局状态和操作方法 |
| `storage.ts` | 处理数据读写和版本管理 |
| `navigation.tsx` | 定义页面路由和导航配置 |
| `types.ts` | 定义所有 TypeScript 类型 |
| `parseRecipe.ts` | 菜谱文本解析和导出 |
| `ImageCacheManager.ts` | 图片缓存策略实现 |
| `OptimizedImage.tsx` | 带加载状态的图片组件 |
| `ImportRecipeModal.tsx` | 统一的导入界面 |
| `ImagePickerButton.tsx` | 图片选择组件 |

### 11.3 开发规范

- 使用 TypeScript，确保类型安全
- 组件文件命名使用 PascalCase
- 函数和变量使用 camelCase
- 保持组件职责单一
- 复杂逻辑抽取为独立模块
- 添加必要的类型注释
