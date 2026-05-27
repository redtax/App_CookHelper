# 味溯新东方 APP 开发文档

## 1. 项目概述

### 1.1 项目简介

味溯新东方是一款基于 React Native + Expo 开发的移动端菜谱应用，旨在帮助用户轻松学习和制作各种美食。应用提供菜谱浏览、详细步骤指导、备料清单管理、食材库存、采购清单、烹饪笔记等功能，支持离线使用。

### 1.2 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | React Native | 0.81.5 |
| 构建工具 | Expo | ~54.0.33 |
| 语言 | TypeScript | ~5.9.2 |
| 导航 | React Navigation | ^7.2.3 |
| 状态管理 | React Context | 内置 |
| 数据存储 | AsyncStorage | ^3.0.2 |
| 图片选择 | expo-image-picker | ~17.0.11 |
| 剪贴板 | expo-clipboard | ~8.0.8 |
| 文件系统 | expo-file-system | ^55.0.19 |
| 安全区域 | react-native-safe-area-context | ^5.7.0 |

### 1.3 核心功能

| 功能模块 | 功能描述 | 对应文件 |
|----------|----------|----------|
| 菜谱列表 | 展示所有菜谱，支持搜索和分类筛选 | `HomeScreen.tsx` |
| 菜谱详情 | 展示菜谱完整信息和成品图片 | `RecipeDetailScreen.tsx` |
| 备料食材 | 食材清单勾选管理 | `PreparationIngredientsScreen.tsx` |
| 备料步骤 | 备料步骤指导 | `PreparationStepsScreen.tsx` |
| 炒菜步骤 | 分步炒菜指导，支持计时和小贴士 | `CookingScreen.tsx` |
| 菜谱编辑 | 创建/编辑菜谱，覆盖保存或另存为 | `RecipeEditScreen.tsx` |
| 图片选择 | 支持相册图片上传和编辑 | `ImagePickerButton.tsx` |
| 导入菜谱 | 统一的菜谱导入界面 | `ImportRecipeModal.tsx` |
| 食材库存 | 管理家中食材库存 | `IngredientScreen.tsx` |
| 采购清单 | 管理购物清单 | `IngredientScreen.tsx` |
| 烹饪笔记 | 记录烹饪心得 | `ProfileScreen.tsx` |
| 我的配方 | 查看编辑过的菜谱 | `ProfileScreen.tsx` |
| 收藏夹 | 收藏管理喜爱的菜谱 | `ProfileScreen.tsx` |
| 设置/关于 | 应用设置和文档展示 | `SettingsScreen.tsx`, `AboutScreen.tsx` |

---

## 2. 项目结构

```
CookHelper/
├── android/                    # Android 原生代码
├── assets/                     # 静态资源
│   ├── recipes.json           # 菜谱初始数据（JSON格式）
│   ├── README.md              # 关于页文档（与根目录同步）
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
│   │   ├── SettingsScreen.tsx
│   │   ├── AboutScreen.tsx
│   │   ├── CategoryScreen.tsx
│   │   └── ImportRecipeModal.tsx
│   ├── components/            # 可复用组件
│   │   └── ImagePickerButton.tsx
│   ├── context.tsx            # 全局状态管理
│   ├── navigation.tsx         # 导航配置
│   ├── storage.ts             # 数据持久化与版本化迁移系统
│   ├── parseRecipe.ts         # 菜谱数据解析
│   ├── types.ts               # TypeScript 类型定义
│   ├── imageMap.ts            # 图片资源映射表
│   ├── OptimizedImage.tsx     # 优化图片组件
│   ├── ImageCacheManager.ts   # 图片缓存管理
│   └── BottomNavigation.tsx   # 底部导航组件
├── App.tsx                    # 应用入口
├── index.ts                   # 应用启动文件
├── app.json                   # Expo 配置
├── metro.config.js            # Metro 打包配置
├── package.json               # 依赖配置
├── tsconfig.json              # TypeScript 配置
├── README.md                  # 项目说明文档
└── DEVELOPMENT_DOC.md        # 本文档
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
}

export interface PreparationStep {
  id: string;             // 步骤ID
  description: string;    // 步骤描述
  ingredients?: string[]; // 涉及食材
  tips?: string;          // 小贴士
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
  categories: string[];           // 分类标签
  tags: string[];                 // 标签
  servings: number;               // 份量
  prepTime: string;              // 准备时间
  cookTime: string;              // 烹饪时间
  difficulty: 'easy' | 'medium' | 'hard'; // 难度
  technique?: string;             // 烹饪技法
  flavor?: string;                // 菜肴味型
  ingredients: Ingredient[];      // 全部食材
  mainIngredients: Ingredient[];  // 主料
  auxiliaryIngredients: Ingredient[]; // 辅料
  seasonings: Ingredient[];       // 调料
  preparationSteps: PreparationStep[]; // 备料步骤
  cookingSteps: CookingStep[];    // 制作步骤
  imageUrl?: string;              // 成品图片路径
  overallFlow?: string;           // 整体流程
  source: 'official' | 'user';    // 来源（官方/用户）
}

export function generateRecipeId(): string {
  // 生成用户菜谱唯一ID：时间戳+随机字符串
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiryDate?: string;
  addedDate: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked: boolean;
}

export interface CookingNote {
  id: string;
  recipeId: string;
  recipeName: string;
  date: string;
  content: string;
  rating: number;
  isSuccess: boolean;
}

export interface MealPlanItem {
  id: string;
  dayOfWeek: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipeId: string;
  recipeName: string;
}

export interface AppState {
  recipes: Recipe[];                  // 菜谱列表
  selectedRecipe: Recipe | null;      // 当前选中菜谱
  searchQuery: string;                // 搜索关键词
  selectedCategory: string | null;    // 选中分类
  preparationCheckedItems: string[];  // 已勾选食材
  preparationCheckedSteps: string[];  // 已完成备料步骤
  activeCookingRecipeId: string | null; // 当前烹饪菜谱ID（断点续做）
  activeCookingStepIndex: number;       // 当前烹饪步骤索引
  favorites: string[];                // 收藏的菜谱ID
  inventory: InventoryItem[];          // 食材库存
  cookingNotes: CookingNote[];        // 烹饪笔记
  mealPlans: MealPlanItem[];          // 计划菜单
  shoppingList: ShoppingItem[];        // 采购清单
  userModifiedRecipes: string[];       // 用户修改过的菜谱ID
  recentlyOpenedIds: string[];         // 最近打开的菜谱ID
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
    "imageUrl": "image84.jpeg",
    "source": "official"
  }
]
```

---

## 4. 核心模块设计

### 4.1 导航结构（`navigation.tsx`）

应用采用 Stack Navigator 结合自定义底部导航 `BottomNavigation`：

| 页面 | 路由名称 | 说明 |
|------|----------|------|
| 首页/备料/我的 | Home | HomeNavigator 负责底部标签切换 |
| 菜谱详情 | RecipeDetail | 展示菜谱完整信息 |
| 备料食材 | PreparationIngredients | 食材清单勾选 |
| 备料步骤 | PreparationSteps | 备料步骤指导 |
| 炒菜步骤 | Cooking | 分步炒菜指导（自定义紧凑头部） |
| 菜谱编辑 | RecipeEdit | 创建/编辑菜谱 |

底部导航标签：
- home - 首页
- prep - 备料中心（食材库存+采购清单）
- profile - 个人中心
- cook - 断点续做入口

### 4.2 状态管理（`context.tsx`）

全局状态通过 `AppContext` 管理，提供统一的状态操作接口：

```typescript
export interface AppContextType extends AppState {
  // 菜谱操作
  loadRecipes: () => Promise<void>;
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  
  // 导航与搜索
  selectRecipe: (recipe: Recipe | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  
  // 备料清单
  togglePreparationItem: (item: string) => void;
  clearPreparationChecklist: () => void;
  resetPreparationChecklist: () => void;
  togglePreparationStep: (stepId: string) => void;
  resetPreparationSteps: () => void;
  
  // 烹饪状态
  setActiveCooking: (recipeId: string | null, stepIndex: number) => void;
  
  // 收藏
  toggleFavorite: (recipeId: string) => void;
  
  // 库存管理
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (id: string) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  
  // 采购清单
  addShoppingItem: (item: ShoppingItem) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  
  // 烹饪笔记
  addCookingNote: (note: CookingNote) => void;
  updateCookingNote: (note: CookingNote) => void;
  deleteCookingNote: (id: string) => void;
  
  // 计划菜单
  saveMealPlan: (plans: MealPlanItem[]) => void;
  
  // 用户标记
  markRecipeAsModified: (recipeId: string) => void;
  markRecipeAsOpened: (recipeId: string) => void;
}
```

### 4.3 数据持久化与版本化迁移（`storage.ts`）

#### 4.3.1 存储键列表

| 键名 | 用途 | 备份键 |
|------|------|--------|
| `cookhelper_recipes` | 菜谱数据 | `cookhelper_backup_recipes` |
| `cookhelper_favorites` | 收藏的菜谱ID | `cookhelper_backup_favorites` |
| `cookhelper_inventory` | 食材库存 | `cookhelper_backup_inventory` |
| `cookhelper_shopping` | 采购清单 | `cookhelper_backup_shopping` |
| `cookhelper_notes` | 烹饪笔记 | `cookhelper_backup_notes` |
| `cookhelper_mealplan` | 计划菜单 | `cookhelper_backup_mealplan` |
| `cookhelper_cooking_state` | 烹饪状态（断点续做） | `cookhelper_backup_cooking_state` |
| `cookhelper_modified` | 用户修改过的菜谱ID | `cookhelper_backup_modified` |
| `cookhelper_recent` | 最近打开的菜谱ID | `cookhelper_backup_recent` |
| `cookhelper_initialized_v11` | 菜谱初始化标记（旧版） | - |
| `cookhelper_data_version` | 全局数据版本号（新版） | - |

#### 4.3.2 数据版本化迁移系统（v3.4.9+）

迁移流程：
```
应用启动
  ↓
读取 cookhelper_data_version
  ↓
版本号 < CURRENT_DATA_VERSION (1)
  ↓
backupAllUserData()  // 备份所有用户数据
  ↓
runRecipeInitialization()  // 初始化/增量更新菜谱
  ↓
migrateInventoryV0toV1()  // 库存字段补全
migrateShoppingV0toV1()   // 采购清单字段补全
migrateNotesV0toV1()     // 笔记字段补全
migrateMealPlansV0toV1() // 菜单字段补全
migrateFavoritesV0toV1(validRecipeIds)   // 收藏去重+清理孤立引用
migrateModifiedV0toV1(validRecipeIds)     // 修改标记去重+清理
migrateRecentV0toV1(validRecipeIds)      // 最近打开去重+清理
migrateCookingStateV0toV1()  // 烹饪状态补全
  ↓
设置 cookhelper_data_version = 1
  ↓
继续应用初始化
```

关键特性：
- 迁移前全量备份
- 迁移失败自动回滚
- 字段级修复（默认值填充）
- 孤立引用清理（删除的菜谱ID从收藏/标记中移除）
- 去重合并
- 可扩展链式迁移

#### 4.3.3 菜谱初始化与增量更新

```
runRecipeInitialization()
  ├─ 首次启动（无 initialized_v11）：
  │   ├─ 从 assets/recipes.json 加载官方菜谱
  │   ├─ 与用户已有菜谱合并（source 修正）
  │   └─ 设置 initialized_v11 标记
  └─ 非首次启动（增量更新）：
      ├─ 从 assets/recipes.json 加载新官方菜谱
      ├─ 跳过用户已修改的菜谱（在 modified 列表中）
      └─ 未修改的官方菜谱则更新
```

关键函数：
- `initializeStorage()` - 统一初始化入口（先运行迁移，再初始化菜谱）
- `loadRecipes()` - 加载菜谱数据
- `saveRecipes()` - 保存菜谱数据
- `loadRecipesFromAsset()` - 从 assets 直接 require 加载（内联数据）
- `migrateRecipe()` - 单个菜谱数据结构迁移
- `migrateSourceField()` - 修正菜谱 source 标记

### 4.4 图片选择组件（`ImagePickerButton.tsx`）

提供图片选择、预览、更换和移除功能：
- 使用 `expo-image-picker` 访问相册
- 使用 `fetch + arrayBuffer + write` 模式处理 content:// 和 file:// URI
- 支持图片预览和编辑

### 4.5 统一导入模块（`ImportRecipeModal.tsx`）

共享的菜谱导入界面，支持：
- 自动从剪贴板粘贴内容
- 图片上传
- 完整格式参考
- 格式复制功能

### 4.6 制作界面（`CookingScreen.tsx`）

- **自定义紧凑头部**：移除 Stack 自带头部，使用自定义头部（返回按钮+菜谱名+步数指示器）
- **导航回退处理**：使用 `CommonActions.reset` 替代 `pop`/`replace`，避免 HomeNavigator 状态污染
- **返回首页修复**：两个"返回首页"按钮统一处理，设置 `handledBackRef.current = true` 避开 `beforeRemove` 拦截

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
- 按钮文本："开始制作 →"（原"开始炒菜"）
- 完成后进入制作步骤

### 5.5 制作步骤页（`CookingScreen.tsx`）

**功能**：
- 水平分页 ScrollView 展示制作步骤
- 自定义紧凑头部（无 Stack 头部）
- 显示每步预计耗时
- 提供烹饪小贴士
- 上一步/下一步导航
- 当前步骤高亮显示
- 断点续做功能（保存 activeCookingRecipeId 和 stepIndex）
- 完成页面显示"🎉 完成烹饪"按钮
- 底部左按钮：完成页为"← 返回首页"，否则根据当前步骤导航
- 底部右按钮：完成页为"制作步骤"，否则为"下一步 →"或"🎉 完成!"

**Modal 弹窗**：
- 完成烹饪后显示确认弹窗
- 左按钮："🔄 返回备料"
- 右按钮："🏠 返回首页"

### 5.6 菜谱编辑页（`RecipeEditScreen.tsx`）

**功能**：
- 支持创建新菜谱和编辑现有菜谱
- 编辑菜谱名称、描述、分类
- 管理食材清单（主料/辅料/调料）
- 管理备料和制作步骤（拖拽排序）
- 上传/更换成品图片
- 保存时统一提示：
  - 编辑已有菜谱：显示"覆盖保存"和"另存为新菜谱"两个选项
  - 新增菜谱：直接保存，不提示
- 另存为新菜谱：调用 `generateRecipeId()` 生成新 ID，source 设为 'user'

### 5.7 个人中心（`ProfileScreen.tsx`）

**功能**：
- 九宫格菜单（拆分后）：
  - 收藏
  - 采购清单
  - 烹饪笔记
  - 我的配方
  - 食材库存
  - 设置
  - 关于
- 无数据时显示数字 0，设置和关于不显示计数
- 关于页内容放入 ScrollView，九宫格跟随滚动

### 5.8 SafeArea 迁移

所有页面使用 `react-native-safe-area-context` 提供的 `SafeAreaView`，替代已废弃的 React Native 内置组件。

---

## 6. 数据导入流程

### 6.1 菜谱数据生成工具

项目包含 Python 脚本用于菜谱数据转换（历史功能，现有数据已固化）：

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

当需要更新官方菜谱数据时：

1. 更新 `assets/recipes.json`（包含新菜谱或修正）
2. 更新 `storage.ts` 中的 `INITIALIZED_KEY` 版本号（如 v11 → v12）
3. 重启应用，数据将自动：
   - 增量添加新官方菜谱
   - 更新未被用户修改的旧官方菜谱
   - 保留用户修改过的菜谱
   - 保留所有用户数据（收藏、库存、笔记等）

### 7.7 数据结构变更流程

当需要变更数据结构时：

1. 更新 `types.ts` 中的类型定义
2. 在 `storage.ts` 中添加对应迁移函数（如 `migrateXxxV1toV2`）
3. 在 `runMigrations()` 中链式调用
4. 递增 `CURRENT_DATA_VERSION` 版本号
5. 重启应用，自动完成迁移

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
| 用户数据隔离 | 官方/用户菜谱分离，source 标记 |

### 8.3 UI 优化

| 策略 | 实现 |
|------|------|
| 虚拟列表 | 长列表使用 FlatList 优化渲染 |
| 懒加载组件 | 复杂组件按需渲染 |
| 动画优化 | 使用原生动画 API |
| SafeArea 处理 | 使用 react-native-safe-area-context |

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
3. 检查 `app.json` 配置了 `media/images/*`

### 9.2 数据未更新

**原因**：
- AsyncStorage 中存在旧数据
- `INITIALIZED_KEY` 版本号未更新

**解决方案**：
1. 更新 `storage.ts` 中的 `INITIALIZED_KEY`（如 `v10` → `v11`）
2. 卸载应用重新安装，或清除应用数据
3. v3.4.9+ 支持增量更新，无需完全清除

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

### 9.5 返回首页空白

**原因**：
- HomeNavigator activeTab 状态为 'cook'，但没有对应页面渲染
- beforeRemove 监听器拦截导航

**解决方案**：
- 使用 `CommonActions.reset` 替代 `popToTop`
- 设置 `handledBackRef.current = true` 规避 beforeRemove 拦截
- 确保重置到 Home 路由，HomeNavigator 重绘时 activeTab 默认 'home'

### 9.6 升级丢失用户数据

**原因**：
- 旧版没有迁移系统
- 升级过程出错

**解决方案**（v3.4.9+）：
- 升级前自动备份所有用户数据
- 迁移失败自动回滚
- 官方菜谱更新不覆盖用户修改

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
| v3.2.0 | 2026-05-23 | 用户体验与导航优化 |
| v3.3.0 | 2026-05-25 | 菜谱存储与命名体系升级 |
| v3.4.0 | 2026-05-25 | 导入流程与图片模块修复 |
| v3.4.1 | 2026-05-25 | 存储体系与迁移修复 |
| v3.4.2 | 2026-05-25 | 新增菜谱保存修复 |
| v3.4.3 | 2026-05-25 | 九宫格功能拆分 |
| v3.4.4 | 2026-05-25 | 编辑保存弹窗统一 |
| v3.4.5 | 2026-05-26 | 覆盖/另存双向选择 |
| v3.4.6 | 2026-05-26 | SafeAreaView迁移与ProfileScreen修复 |
| v3.4.7 | 2026-05-26 | 制作界面头部重新设计 |
| v3.4.8 | 2026-05-26 | 返回首页功能修复 |
| v3.4.9 | 2026-05-26 | 用户数据保护与版本化迁移系统 |

---

## 11. 附录

### 11.1 目录结构说明

```
src/
├── screens/               # 页面组件
├── components/            # 可复用组件
├── context.tsx            # 全局状态
├── navigation.tsx         # 导航配置
├── storage.ts             # 数据持久化与版本化迁移
├── parseRecipe.ts         # 菜谱解析工具
├── types.ts               # 类型定义
├── ImageCacheManager.ts   # 图片缓存
├── OptimizedImage.tsx     # 优化图片组件
├── BottomNavigation.tsx   # 底部导航
└── imageMap.ts            # 图片资源映射
```

### 11.2 关键文件说明

| 文件 | 作用 |
|------|------|
| `context.tsx` | 管理全局状态和操作方法 |
| `storage.ts` | 处理数据读写、版本化迁移、备份回滚 |
| `navigation.tsx` | 定义页面路由和导航配置，HomeNavigator |
| `types.ts` | 定义所有 TypeScript 类型 |
| `parseRecipe.ts` | 菜谱文本解析和导出 |
| `ImageCacheManager.ts` | 图片缓存策略实现 |
| `OptimizedImage.tsx` | 带加载状态的图片组件 |
| `ImportRecipeModal.tsx` | 统一的导入界面 |
| `ImagePickerButton.tsx` | 图片选择组件 |
| `CookingScreen.tsx` | 制作界面，含自定义头部和返回首页逻辑 |
| `BottomNavigation.tsx` | 底部标签导航 |

### 11.3 开发规范

- 使用 TypeScript，确保类型安全
- 组件文件命名使用 PascalCase
- 函数和变量使用 camelCase
- 保持组件职责单一
- 复杂逻辑抽取为独立模块
- 添加必要的类型注释
- 所有页面使用 react-native-safe-area-context 的 SafeAreaView
- 数据变更添加版本化迁移函数，保证向后兼容
- 用户数据变更前进行备份
- 文档同步更新（README.md 与 assets/README.md 保持一致）
