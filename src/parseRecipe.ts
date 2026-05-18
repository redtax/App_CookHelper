import { Recipe } from './types';

const parseIngredientLine = (line: string) => {
  const tabParts = line.split(/\t+/);
  if (tabParts.length >= 2) {
    const ingredientName = tabParts[0].trim();
    const amountStr = tabParts[1].trim();
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
        notes: notesMatch ? notesMatch[1] : undefined,
      };
    }
  } else {
    const spaceParts = line.split(/\s{2,}/);
    if (spaceParts.length >= 2) {
      const ingredientName = spaceParts[0].trim();
      const amountStr = spaceParts.slice(1).join(' ').trim();
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
          notes: notesMatch ? notesMatch[1] : undefined,
        };
      }
    }
  }
  const delimParts = line.split(/[、，,。.;；\s]+/);
  if (delimParts.length > 1) {
    return null; // multiple ingredients, handled separately
  }
  return { name: line, amount: '' };
};

const parseRecipeText = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let name = '';
  let description = '';
  let category = '家常菜';
  let difficulty = 'medium' as 'easy' | 'medium' | 'hard';
  let servings = 2;
  let prepTime = '15分钟';
  let cookTime = '20分钟';
  let technique: string | undefined;
  let flavor: string | undefined;
  let tags: string[] = [];
  let imageUrl: string | undefined;
  let overallFlow: string | undefined;
  let ingredients: { name: string; amount: string; unit?: string; notes?: string }[] = [];
  let mainIngredients: { name: string; amount: string; unit?: string; notes?: string }[] = [];
  let auxiliaryIngredients: { name: string; amount: string; unit?: string; notes?: string }[] = [];
  let seasonings: { name: string; amount: string; unit?: string; notes?: string }[] = [];
  let currentIngredientCategory: 'main' | 'auxiliary' | 'seasoning' | undefined;
  let preparationSteps: { description: string; tips?: string }[] = [];
  let cookingSteps: { instruction: string; duration?: string; tips?: string; ingredients?: string[] }[] = [];

  let currentSection = '';

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

    if (line.match(/^🍳\s*炒[制菜]/) || line.match(/^炒[制菜]步骤/) || line.match(/^炒[制菜]$/)) {
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
        const val = line.replace(/^准备时间[\s：:]*/, '').trim();
        prepTime = val || prepTime;
        continue;
      }
      if (line.match(/^烹饪时间/)) {
        const val = line.replace(/^烹饪时间[\s：:]*/, '').trim();
        cookTime = val || cookTime;
        continue;
      }
      if (line.match(/^份[量数]/)) {
        const val = line.replace(/^份[量数][\s：:]*/, '').trim();
        const numMatch = val.match(/(\d+)/);
        if (numMatch) servings = parseInt(numMatch[1]);
        continue;
      }
      if (line.match(/^难度/)) {
        const val = line.replace(/^难度[\s：:]*/, '').trim();
        if (val.match(/简单|容易|一星/)) difficulty = 'easy';
        else if (val.match(/困难|复杂|三星/)) difficulty = 'hard';
        else difficulty = 'medium';
        continue;
      }
      if (line.match(/^分类/)) {
        category = line.replace(/^分类[\s：:]*/, '').trim() || category;
        continue;
      }
      if (line.match(/^技法/)) {
        const val = line.replace(/^技法[\s：:]*/, '').trim();
        technique = val || undefined;
        continue;
      }
      if (line.match(/^味型/)) {
        const val = line.replace(/^味型[\s：:]*/, '').trim();
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
          category = val || category;
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
        // Handle multiple ingredients
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
      const stepMatch = line.match(/^\d+[.、)\s]+(.*)/);
      let desc = stepMatch ? stepMatch[1] : line;
      const tipsMatch = desc.match(/💡\s*小贴士[：:]?\s*(.*)/);
      if (tipsMatch) {
        const cleanDesc = desc.replace(/💡\s*小贴士[：:]?\s*.*/, '').trim();
        if (cleanDesc) {
          preparationSteps.push({
            description: cleanDesc,
            tips: tipsMatch[1].trim(),
          });
        } else if (preparationSteps.length > 0) {
          preparationSteps[preparationSteps.length - 1].tips = tipsMatch[1].trim();
        }
        continue;
      }
      const inlineTips = desc.match(/[（(]([^）)]+)[）)]/);
      const cleanDesc = desc.replace(/[（(].+[）)]/, '').trim();
      preparationSteps.push({
        description: cleanDesc || desc,
        tips: inlineTips ? inlineTips[1] : undefined,
      });
      continue;
    }

    if (currentSection === 'cooking') {
      const stepMatch = line.match(/^\d+[.、)\s]+(.*)/);
      const instruction = stepMatch ? stepMatch[1] : line;
      const tipsMatch = instruction.match(/💡\s*小贴士[：:]?\s*(.*)/);
      if (tipsMatch) {
        const instructionWithoutTips = instruction.replace(/💡\s*小贴士[：:]?\s*.*/, '').trim();
        if (instructionWithoutTips) {
          cookingSteps.push({
            instruction: instructionWithoutTips,
            tips: tipsMatch[1].trim(),
          });
        } else if (cookingSteps.length > 0) {
          cookingSteps[cookingSteps.length - 1].tips = tipsMatch[1].trim();
        }
        continue;
      }
      cookingSteps.push({
        instruction,
      });
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

    if (line.match(/^https?:\/\//) && !imageUrl) {
      imageUrl = line;
      continue;
    }
  }

  if (cookingSteps.length === 0 && preparationSteps.length > 0) {
    cookingSteps = preparationSteps.map(s => ({
      instruction: s.description,
      tips: s.tips,
    }));
    preparationSteps = [];
  }

  if (cookingSteps.length === 0) {
    cookingSteps = [{ instruction: '请补充炒菜步骤' }];
  }

  if (ingredients.length === 0 && mainIngredients.length === 0 && auxiliaryIngredients.length === 0 && seasonings.length === 0) {
    ingredients = [{ name: '请补充食材', amount: '' }];
  }

  if (tags.length === 0) {
    tags = [category];
  }

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: name || '未命名菜谱',
    description: description || undefined,
    category,
    tags,
    servings,
    prepTime,
    cookTime,
    difficulty,
    technique,
    flavor,
    imageUrl,
    overallFlow: overallFlow || undefined,
    ingredients,
    mainIngredients,
    auxiliaryIngredients,
    seasonings,
    preparationSteps: preparationSteps.map((step, index) => ({
      id: `prep_${index + 1}`,
      description: step.description,
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

  if (recipe.description) {
    lines.push('📝 简介');
    lines.push(recipe.description);
    lines.push('');
  }

  if (recipe.overallFlow) {
    lines.push('🗺️ 总体流程');
    const flowLines = recipe.overallFlow.split('\n');
    flowLines.forEach(line => lines.push(line));
    lines.push('');
  }

  lines.push('⏱️ 基本信息');
  lines.push(`准备时间\t${recipe.prepTime}`);
  lines.push(`烹饪时间\t${recipe.cookTime}`);
  lines.push(`份量\t${recipe.servings}人份`);
  const difficultyText = recipe.difficulty === 'easy' ? '简单' : recipe.difficulty === 'medium' ? '中等' : '困难';
  lines.push(`难度\t${difficultyText}`);
  lines.push(`分类\t${recipe.category}`);
  if (recipe.technique) {
    lines.push(`技法\t${recipe.technique}`);
  }
  if (recipe.flavor) {
    lines.push(`味型\t${recipe.flavor}`);
  }
  lines.push('');

  const hasCategories = recipe.mainIngredients.length > 0 || recipe.auxiliaryIngredients.length > 0 || recipe.seasonings.length > 0;
  if (hasCategories) {
    if (recipe.mainIngredients.length > 0) {
      lines.push('主料');
      recipe.mainIngredients.forEach(ing => lines.push(exportIngredientLine(ing)));
      lines.push('');
    }
    if (recipe.auxiliaryIngredients.length > 0) {
      lines.push('辅料');
      recipe.auxiliaryIngredients.forEach(ing => lines.push(exportIngredientLine(ing)));
      lines.push('');
    }
    if (recipe.seasonings.length > 0) {
      lines.push('调料');
      recipe.seasonings.forEach(ing => lines.push(exportIngredientLine(ing)));
      lines.push('');
    }
  } else {
    lines.push('🥦 食材清单');
    recipe.ingredients.forEach(ing => lines.push(exportIngredientLine(ing)));
    lines.push('');
  }

  if (recipe.preparationSteps.length > 0) {
    lines.push('📋 备料步骤');
    recipe.preparationSteps.forEach((step, index) => {
      let line = `${index + 1}. ${step.description}`;
      if (step.tips) {
        line += ` 💡 小贴士：${step.tips}`;
      }
      lines.push(line);
    });
    lines.push('');
  }

  lines.push('🍳 炒菜步骤');
  recipe.cookingSteps.forEach((step, index) => {
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

  if (recipe.tags.length > 0) {
    lines.push('🏷️ 标签');
    lines.push(recipe.tags.join('、'));
  }

  return lines.join('\n');
};

export { parseRecipeText, exportRecipeToText };
export default parseRecipeText;
