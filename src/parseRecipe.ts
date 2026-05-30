import { Recipe, generateRecipeId } from './types';
import { isVideoUrl } from './utils/videoUtils';

const parseIngredientLine = (line: string) => {
  const separatorPattern = /[\t]+|[ ]{2,}|[—–\-]+|[…\.]{3,}/;
  const sepMatch = line.match(separatorPattern);

  if (sepMatch && sepMatch.index !== undefined) {
    const ingredientName = line.substring(0, sepMatch.index).trim();
    const amountStr = line.substring(sepMatch.index! + sepMatch[0].length).trim();

    const notesMatch = amountStr.match(/[（(](.+)[）)]/);
    const cleanAmount = amountStr.replace(/[（(].+[）)]/, '').trim();
    const amountMatch = cleanAmount.match(/^([\d.]+)\s*(.*)/);
    if (amountMatch) {
      return {
        name: ingredientName,
        amount: amountMatch[1],
        unit: amountMatch[2] || undefined,
        notes: notesMatch ? notesMatch[1] : undefined,
      };
    } else {
      return {
        name: ingredientName,
        amount: cleanAmount || '',
        unit: undefined,
        notes: notesMatch ? notesMatch[1] : undefined,
      };
    }
  }

  const notesMatch = line.match(/[（(](.+)[）)]/);
  const cleanLine = line.replace(/[（(].+[）)]/, '').trim();
  const amountMatch = cleanLine.match(/^(.+?)\s+([\d.]+)\s*(\S*)$/);
  if (amountMatch) {
    return {
      name: amountMatch[1].trim(),
      amount: amountMatch[2],
      unit: amountMatch[3] || undefined,
      notes: notesMatch ? notesMatch[1] : undefined,
    };
  }

  const delimParts = line.split(/[、，,。.;；\s]+/);
  if (delimParts.length > 1) {
    return null;
  }
  return { name: line, amount: '' };
};

const parseRecipeText = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let name = '';
  let description = '';
  let categories: string[] = [];
  let difficulty = 'medium' as 'easy' | 'medium' | 'hard';
  let servings = 2;
  let prepTime = '15分钟';
  let cookTime = '20分钟';
  let technique: string | undefined;
  let flavor: string | undefined;
  let tags: string[] = [];
  let imageUrl: string | undefined;
  let videoUrl: string | undefined;
  let overallFlow: string | undefined;
  let ingredients: { name: string; amount: string; unit?: string; notes?: string }[] = [];
  let mainIngredients: { name: string; amount: string; unit?: string; notes?: string }[] = [];
  let auxiliaryIngredients: { name: string; amount: string; unit?: string; notes?: string }[] = [];
  let seasonings: { name: string; amount: string; unit?: string; notes?: string }[] = [];
  let currentIngredientCategory: 'main' | 'auxiliary' | 'seasoning' | undefined;
  let preparationSteps: { description: string; duration?: string; tips?: string }[] = [];
  let cookingSteps: { instruction: string; duration?: string; tips?: string; ingredients?: string[] }[] = [];
  let currentPrepStep: { description: string; duration?: string; tips?: string } | null = null;
  let currentCookStep: { instruction: string; duration?: string; tips?: string; ingredients?: string[] } | null = null;

  let currentSection = '';

  const peekNextLine = (idx: number): string => (idx + 1 < lines.length) ? lines[idx + 1] : '';
  const isBasicInfoKey = (l: string): boolean =>
    /^(准备时间|烹饪时间|份[量数]|难度|分类|(烹饪)?技法|(菜肴)?味型)/.test(l);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^📝\s*简介/) || line.match(/^简介/)) {
      currentSection = 'description';
      continue;
    }

    if (line.match(/^🗺️?\s*总体流程/) || line.match(/^总体流程/)) {
      currentSection = 'overallFlow';
      continue;
    }

    if (line.match(/^⏱️?\s*基本信息/) || line.match(/^基本信息/)) {
      currentSection = 'basicInfo';
      continue;
    }

    if (line.match(/^🥦\s*食材/) || line.match(/^食材清单/) || line.match(/^食材$/)) {
      currentSection = 'ingredients';
      currentIngredientCategory = undefined;
      continue;
    }

    if (line.match(/^主料/)) {
      currentSection = 'ingredients';
      currentIngredientCategory = 'main';
      continue;
    }

    if (line.match(/^辅料/)) {
      currentSection = 'ingredients';
      currentIngredientCategory = 'auxiliary';
      continue;
    }

    if (line.match(/^调料/)) {
      currentSection = 'ingredients';
      currentIngredientCategory = 'seasoning';
      continue;
    }

    if (line.match(/^📋\s*备料/) || line.match(/^备料步骤/) || line.match(/^备料$/)) {
      currentSection = 'preparation';
      continue;
    }

    if (line.match(/^🍳\s*(炒|制作|烹饪)/) || line.match(/^(炒|制作|烹饪)步骤/) || line.match(/^(炒|制作|烹饪)$/)) {
      currentSection = 'cooking';
      continue;
    }

    if (line.match(/^🏷️\s*标签/) || line.match(/^标签$/)) {
      currentSection = 'tags';
      const inlineTags = line.replace(/^🏷️\s*标签[\s：:]*/, '').replace(/^标签[\s：:]*/, '').trim();
      if (inlineTags) {
        tags = inlineTags.split(/[,，、\s]+/).filter(t => t.length > 0);
      }
      continue;
    }

    if (currentSection === 'basicInfo') {
      if (line.match(/^准备时间/)) {
        let val = line.replace(/^准备时间[\s：:]*/, '').trim();
        if (!val) {
          const next = peekNextLine(i);
          if (next && !isBasicInfoKey(next) && !next.match(/^(项目|信息|食材|用量)\s*$/)) {
            val = next;
            i++;
          }
        }
        prepTime = val || prepTime;
        continue;
      }
      if (line.match(/^烹饪时间/)) {
        let val = line.replace(/^烹饪时间[\s：:]*/, '').trim();
        if (!val) {
          const next = peekNextLine(i);
          if (next && !isBasicInfoKey(next) && !next.match(/^(项目|信息|食材|用量)\s*$/)) {
            val = next;
            i++;
          }
        }
        cookTime = val || cookTime;
        continue;
      }
      if (line.match(/^份[量数]/)) {
        let val = line.replace(/^份[量数][\s：:]*/, '').trim();
        if (!val) {
          const next = peekNextLine(i);
          if (next && !isBasicInfoKey(next) && !next.match(/^(项目|信息|食材|用量)\s*$/)) {
            val = next;
            i++;
          }
        }
        const numMatch = val.match(/(\d+)/);
        if (numMatch) servings = parseInt(numMatch[1]);
        continue;
      }
      if (line.match(/^难度/)) {
        let val = line.replace(/^难度[\s：:]*/, '').trim();
        if (!val) {
          const next = peekNextLine(i);
          if (next && !isBasicInfoKey(next) && !next.match(/^(项目|信息|食材|用量)\s*$/)) {
            val = next;
            i++;
          }
        }
        if (val.match(/简单|容易|一星/)) difficulty = 'easy';
        else if (val.match(/困难|复杂|三星/)) difficulty = 'hard';
        else difficulty = 'medium';
        continue;
      }
      if (line.match(/^分类/)) {
        let val = line.replace(/^分类[\s：:]*/, '').trim();
        if (!val) {
          const next = peekNextLine(i);
          if (next && !isBasicInfoKey(next) && !next.match(/^(项目|信息|食材|用量)\s*$/)) {
            val = next;
            i++;
          }
        }
        if (val) {
          categories = val.split(/[、，,\s]+/).filter(c => c.length > 0);
        }
        if (categories.length === 0) categories = ['家常菜'];
        continue;
      }
      if (line.match(/^(烹饪)?技法/)) {
        let val = line.replace(/^(烹饪)?技法[\s：:]*/, '').trim();
        if (!val) {
          const next = peekNextLine(i);
          if (next && !isBasicInfoKey(next) && !next.match(/^(项目|信息|食材|用量)\s*$/)) {
            val = next;
            i++;
          }
        }
        technique = val || undefined;
        continue;
      }
      if (line.match(/^(菜肴)?味型/)) {
        let val = line.replace(/^(菜肴)?味型[\s：:]*/, '').trim();
        if (!val) {
          const next = peekNextLine(i);
          if (next && !isBasicInfoKey(next) && !next.match(/^(项目|信息|食材|用量)\s*$/)) {
            val = next;
            i++;
          }
        }
        flavor = val || undefined;
        continue;
      }
      if (line.match(/^(项目|信息|食材|用量)\s*$/) || line.match(/项目\s+信息/) || line.match(/食材\s+用量/)) {
        continue;
      }
      const tabParts = line.split(/\t+/);
      if (tabParts.length === 2) {
        const key = tabParts[0].trim();
        const val = tabParts[1].trim();
        if (key.match(/准备时间/)) prepTime = val || prepTime;
        else if (key.match(/烹饪时间/)) cookTime = val || cookTime;
        else if (key.match(/份[量数]/)) {
          const numMatch = val.match(/(\d+)/);
          if (numMatch) servings = parseInt(numMatch[1]);
        }
        else if (key.match(/难度/)) {
          if (val.match(/简单|容易|一星/)) difficulty = 'easy';
          else if (val.match(/困难|复杂|三星/)) difficulty = 'hard';
          else difficulty = 'medium';
        }
        else if (key.match(/分类/)) {
          const valParts = val.split(/[、，,\s]+/).filter((c: string) => c.length > 0);
          if (valParts.length > 0) categories = valParts;
        }
        else if (key.match(/技法/)) {
          technique = val || undefined;
        }
        else if (key.match(/味型/)) {
          flavor = val || undefined;
        }
      }
      continue;
    }

    if (currentSection === 'ingredients') {
      if (line.match(/^(食材|用量)\s*$/) || line.match(/食材\s+用量/)) {
        continue;
      }

      const parsedIngredient = parseIngredientLine(line);
      if (parsedIngredient) {
        if (currentIngredientCategory === 'main') {
          mainIngredients.push(parsedIngredient);
        } else if (currentIngredientCategory === 'auxiliary') {
          auxiliaryIngredients.push(parsedIngredient);
        } else if (currentIngredientCategory === 'seasoning') {
          seasonings.push(parsedIngredient);
        } else {
          ingredients.push(parsedIngredient);
        }
      } else {
        const delimParts = line.split(/[、，,。.;；\s]+/);
        delimParts.forEach(part => {
          const trimmed = part.trim();
          if (trimmed) {
            const spaceMatch = trimmed.match(/^(.+?)\s+(\S+)$/);
            if (spaceMatch) {
              const amountStr = spaceMatch[2];
              const notesMatch = amountStr.match(/[（(](.+)[）)]/);
              const cleanAmount = amountStr.replace(/[（(].+[）)]/, '').trim();
              const numMatch = cleanAmount.match(/^([\d.]+)\s*(.*)/);
              const ing = {
                name: spaceMatch[1].trim(),
                amount: numMatch ? numMatch[1] : cleanAmount || '',
                unit: numMatch && numMatch[2] ? numMatch[2] : undefined,
                notes: notesMatch ? notesMatch[1] : undefined,
              };
              if (currentIngredientCategory === 'main') {
                mainIngredients.push(ing);
              } else if (currentIngredientCategory === 'auxiliary') {
                auxiliaryIngredients.push(ing);
              } else if (currentIngredientCategory === 'seasoning') {
                seasonings.push(ing);
              } else {
                ingredients.push(ing);
              }
            } else {
              const ing = { name: trimmed, amount: '' };
              if (currentIngredientCategory === 'main') {
                mainIngredients.push(ing);
              } else if (currentIngredientCategory === 'auxiliary') {
                auxiliaryIngredients.push(ing);
              } else if (currentIngredientCategory === 'seasoning') {
                seasonings.push(ing);
              } else {
                ingredients.push(ing);
              }
            }
          }
        });
      }
      continue;
    }

    if (currentSection === 'preparation') {
      const stepMatch = line.match(/^第?\s*\d+[.、)\s]+(.*)/);

      if (stepMatch) {
        if (currentPrepStep) {
          preparationSteps.push(currentPrepStep);
        }
        currentPrepStep = { description: stepMatch[1].trim() };
        continue;
      }

      if (!currentPrepStep) continue;

      const tipsMatch = line.match(/💡\s*小贴士[：:]?\s*(.*)/);
      if (tipsMatch) {
        currentPrepStep.tips = tipsMatch[1].trim();
        continue;
      }

      const timeMatch = line.match(/耗时[：:]\s*(.+)$/);
      if (timeMatch) {
        currentPrepStep.duration = timeMatch[1].trim();
        continue;
      }

      if (currentPrepStep.description) {
        currentPrepStep.description += '\n' + line;
      } else {
        currentPrepStep.description = line;
      }
      continue;
    }

    if (currentSection === 'cooking') {
      const stepMatch = line.match(/^第?\s*\d+[.、)\s]+(.*)/);

      if (stepMatch) {
        if (currentCookStep) {
          cookingSteps.push(currentCookStep);
        }
        currentCookStep = { instruction: stepMatch[1].trim() };
        continue;
      }

      if (!currentCookStep) continue;

      const tipsMatch = line.match(/💡\s*小贴士[：:]?\s*(.*)/);
      if (tipsMatch) {
        currentCookStep.tips = tipsMatch[1].trim();
        continue;
      }

      const timeMatch = line.match(/耗时[：:]\s*(.+)$/);
      if (timeMatch) {
        currentCookStep.duration = timeMatch[1].trim();
        continue;
      }

      if (currentCookStep.instruction) {
        currentCookStep.instruction += '\n' + line;
      } else {
        currentCookStep.instruction = line;
      }
      continue;
    }

    if (currentSection === 'tags') {
      const cleanedLine = line.replace(/^标签[\s：:]*/, '');
      tags = cleanedLine.split(/[,，、\s]+/).filter(t => t.length > 0);
      continue;
    }

    if (currentSection === 'description') {
      if (!description) {
        description = line;
      }
      continue;
    }

    if (currentSection === 'overallFlow') {
      if (!overallFlow) {
        overallFlow = line;
      } else {
        overallFlow = overallFlow + '\n' + line;
      }
      continue;
    }

    if (!name) {
      name = line;
      continue;
    }

    if (line.match(/^🎬\s*实操视频/) || line.match(/^实操视频/) || line.match(/^视频链接/)) {
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (nextLine.match(/^https?:\/\//)) {
          videoUrl = nextLine;
          i++;
        }
      }
      continue;
    }

    if (line.match(/^菜品图片/) || line.match(/^图片/)) {
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (nextLine.match(/^https?:\/\//)) {
          imageUrl = nextLine;
          i++;
        }
      }
      continue;
    }

    if (line.match(/^https?:\/\//) && !videoUrl && isVideoUrl(line)) {
      videoUrl = line;
      continue;
    }

    if (line.match(/^https?:\/\//) && !imageUrl) {
      imageUrl = line;
      continue;
    }
  }

  if (currentPrepStep) {
    preparationSteps.push(currentPrepStep);
  }
  if (currentCookStep) {
    cookingSteps.push(currentCookStep);
  }

  if (ingredients.length === 0 && mainIngredients.length === 0 && auxiliaryIngredients.length === 0 && seasonings.length === 0) {
    ingredients = [{ name: '请补充食材', amount: '' }];
  }

  if (tags.length === 0) {
    tags = categories.length > 0 ? [...categories] : ['家常菜'];
  }

  if (categories.length === 0) {
    categories = ['家常菜'];
  }

  return {
    id: generateRecipeId(),
    name: name || '未命名菜谱',
    description: description || undefined,
    categories,
    tags,
    servings,
    prepTime,
    cookTime,
    difficulty,
    technique,
    flavor,
    imageUrl,
    imageUrls: imageUrl ? [imageUrl] : [],
    videoUrl,
    overallFlow: overallFlow || undefined,
    ingredients,
    mainIngredients,
    auxiliaryIngredients,
    seasonings,
    source: 'user' as const,
    preparationSteps: preparationSteps.map((step, index) => ({
      id: `prep_${index + 1}`,
      description: step.description,
      duration: step.duration,
      tips: step.tips,
    })),
    cookingSteps: cookingSteps.map((step, index) => ({
      id: `cook_${index + 1}`,
      instruction: step.instruction,
      duration: step.duration,
      tips: step.tips,
      ingredients: step.ingredients,
    })),
  };
};

const exportIngredientLine = (ing: { name: string; amount: string; unit?: string; notes?: string }) => {
  let amountStr = ing.amount;
  if (ing.unit) {
    amountStr += ing.unit;
  }
  if (ing.notes) {
    amountStr += `（${ing.notes}）`;
  }
  if (amountStr) {
    return `${ing.name}\t${amountStr}`;
  } else {
    return ing.name;
  }
};

const exportRecipeToText = (recipe: Recipe): string => {
  const lines: string[] = [];

  lines.push(recipe.name);
  lines.push('');

  lines.push('📝 简介');
  lines.push(recipe.description || '');
  lines.push('');

  lines.push('🗺️ 总体流程');
  lines.push(recipe.overallFlow || '');
  lines.push('');

  lines.push('⏱️ 基本信息');
  lines.push(`准备时间\t${recipe.prepTime}`);
  lines.push(`烹饪时间\t${recipe.cookTime}`);
  lines.push(`份量\t${recipe.servings}人份`);
  const difficultyText = recipe.difficulty === 'easy' ? '简单' : recipe.difficulty === 'medium' ? '中等' : '困难';
  lines.push(`难度\t${difficultyText}`);
  lines.push(`分类\t${(recipe.categories || []).join('、')}`);
  lines.push(`烹饪技法\t${recipe.technique || ''}`);
  lines.push(`菜肴味型\t${recipe.flavor || ''}`);
  lines.push('');

  lines.push('主料');
  (recipe.mainIngredients || []).forEach(ing => lines.push(exportIngredientLine(ing)));
  lines.push('');

  lines.push('辅料');
  (recipe.auxiliaryIngredients || []).forEach(ing => lines.push(exportIngredientLine(ing)));
  lines.push('');

  lines.push('调料');
  (recipe.seasonings || []).forEach(ing => lines.push(exportIngredientLine(ing)));
  lines.push('');

  lines.push('📋 备料步骤');
  (recipe.preparationSteps || []).forEach((step, index) => {
    let line = `${index + 1}. ${step.description}`;
    if (step.duration) {
      line += ` 耗时：${step.duration}`;
    }
    if (step.tips) {
      line += ` 💡 小贴士：${step.tips}`;
    }
    lines.push(line);
  });
  lines.push('');

  lines.push('🍳 炒菜步骤');
  (recipe.cookingSteps || []).forEach((step, index) => {
    let line = `${index + 1}. ${step.instruction}`;
    if (step.duration) {
      line += ` 耗时：${step.duration}`;
    }
    if (step.tips) {
      line += ` 💡 小贴士：${step.tips}`;
    }
    lines.push(line);
  });
  lines.push('');

  lines.push('🏷️ 标签');
  lines.push((recipe.tags || []).join('、'));
  lines.push('');

  if (recipe.videoUrl) {
    lines.push('🎬 实操视频');
    lines.push(recipe.videoUrl);
    lines.push('');
  }

  return lines.join('\n');
};

export { parseRecipeText, exportRecipeToText };
export default parseRecipeText;