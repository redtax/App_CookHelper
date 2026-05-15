const parseRecipeText = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let name = '';
  let description = '';
  let category = '家常菜';
  let difficulty = 'medium' as 'easy' | 'medium' | 'hard';
  let servings = 2;
  let prepTime = '15分钟';
  let cookTime = '20分钟';
  let tags: string[] = [];
  let imageUrl: string | undefined;
  let ingredients: { name: string; amount: string; unit?: string; notes?: string }[] = [];
  let preparationSteps: { description: string; tips?: string }[] = [];
  let cookingSteps: { instruction: string; duration?: string; tips?: string; ingredients?: string[] }[] = [];

  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^📝\s*简介/) || line.match(/^简介/)) {
      currentSection = 'description';
      continue;
    }

    if (line.match(/^⏱️?\s*基本信息/) || line.match(/^基本信息/)) {
      currentSection = 'basicInfo';
      continue;
    }

    if (line.match(/^🥦\s*食材/) || line.match(/^食材清单/) || line.match(/^食材$/)) {
      currentSection = 'ingredients';
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
      continue;
    }

    if (currentSection === 'basicInfo') {
      if (line.match(/^准备时间/)) {
        const val = line.replace(/^准备时间\s*/, '').trim();
        prepTime = val || prepTime;
        continue;
      }
      if (line.match(/^烹饪时间/)) {
        const val = line.replace(/^烹饪时间\s*/, '').trim();
        cookTime = val || cookTime;
        continue;
      }
      if (line.match(/^份[量数]/)) {
        const val = line.replace(/^份[量数]\s*/, '').trim();
        const numMatch = val.match(/(\d+)/);
        if (numMatch) servings = parseInt(numMatch[1]);
        continue;
      }
      if (line.match(/^难度/)) {
        const val = line.replace(/^难度\s*/, '').trim();
        if (val.match(/简单|容易|一星/)) difficulty = 'easy';
        else if (val.match(/困难|复杂|三星/)) difficulty = 'hard';
        else difficulty = 'medium';
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
      }
      continue;
    }

    if (currentSection === 'ingredients') {
      if (line.match(/^(食材|用量)\s*$/) || line.match(/食材\s+用量/)) {
        continue;
      }
      const tabParts = line.split(/\t+/);
      if (tabParts.length >= 2) {
        const ingredientName = tabParts[0].trim();
        const amountStr = tabParts[1].trim();
        const notesMatch = amountStr.match(/[（(](.+)[）)]/);
        const cleanAmount = amountStr.replace(/[（(].+[）)]/, '').trim();
        const amountMatch = cleanAmount.match(/^([\d.]+)\s*(.*)/);
        if (amountMatch) {
          ingredients.push({
            name: ingredientName,
            amount: amountMatch[1],
            unit: amountMatch[2] || undefined,
            notes: notesMatch ? notesMatch[1] : undefined,
          });
        } else {
          ingredients.push({
            name: ingredientName,
            amount: cleanAmount || '适量',
            notes: notesMatch ? notesMatch[1] : undefined,
          });
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
            ingredients.push({
              name: ingredientName,
              amount: amountMatch[1],
              unit: amountMatch[2] || undefined,
              notes: notesMatch ? notesMatch[1] : undefined,
            });
          } else {
            ingredients.push({
              name: ingredientName,
              amount: cleanAmount || '适量',
              notes: notesMatch ? notesMatch[1] : undefined,
            });
          }
        } else {
          ingredients.push({ name: line, amount: '适量' });
        }
      }
      continue;
    }

    if (currentSection === 'preparation') {
      const stepMatch = line.match(/^\d+[.、)\s]+(.*)/);
      let desc = stepMatch ? stepMatch[1] : line;
      const tipsMatch = desc.match(/💡\s*小贴士[：:]?\s*(.*)/);
      if (tipsMatch) {
        desc = desc.replace(/💡\s*小贴士[：:]?\s*.*/, '').trim();
        if (preparationSteps.length > 0) {
          preparationSteps[preparationSteps.length - 1].tips = tipsMatch[1].trim();
        }
        continue;
      }
      const inlineTips = desc.match(/（(.+)）|\((.+)\)/);
      const cleanDesc = desc.replace(/[（(].+[）)]/, '').trim();
      preparationSteps.push({
        description: cleanDesc || desc,
        tips: inlineTips ? (inlineTips[1] || inlineTips[2]) : undefined,
      });
      continue;
    }

    if (currentSection === 'cooking') {
      const stepMatch = line.match(/^\d+[.、)\s]+(.*)/);
      let instruction = stepMatch ? stepMatch[1] : line;
      const tipsMatch = instruction.match(/💡\s*小贴士[：:]?\s*(.*)/);
      if (tipsMatch) {
        instruction = instruction.replace(/💡\s*小贴士[：:]?\s*.*/, '').trim();
        if (cookingSteps.length > 0) {
          cookingSteps[cookingSteps.length - 1].tips = tipsMatch[1].trim();
        }
        continue;
      }
      instruction = instruction.replace(/^操作[：:]\s*/, '');
      const durationMatch = instruction.match(/耗时[约大概]*\s*(\d+\s*[分秒分钟]+(?:左右)?)/);
      const inlineTipsMatch = instruction.match(/[（(](.*?)[）)]/);
      let cleanInstruction = instruction
        .replace(/耗时[约大概]*\s*\d+\s*[分秒分钟]+(?:左右)?[，,]?\s*/, '')
        .replace(/[（(].*?[）)]/, '')
        .trim();
      if (cleanInstruction.endsWith('，') || cleanInstruction.endsWith(',')) {
        cleanInstruction = cleanInstruction.slice(0, -1).trim();
      }
      cookingSteps.push({
        instruction: cleanInstruction || instruction,
        duration: durationMatch ? durationMatch[1] : undefined,
        tips: inlineTipsMatch ? inlineTipsMatch[1] : undefined,
      });
      continue;
    }

    if (currentSection === 'tags') {
      tags = line.split(/[,，、\s]+/).filter(t => t.length > 0);
      continue;
    }

    if (currentSection === 'description') {
      if (!description) {
        description = line;
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

  if (ingredients.length === 0) {
    ingredients = [{ name: '请补充食材', amount: '适量' }];
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
    imageUrl,
    ingredients,
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

export default parseRecipeText;
