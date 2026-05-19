import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useApp } from '../context';
import { Recipe } from '../types';
import parseRecipeText from '../parseRecipe';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const categories = ['全部', '家常菜', '川菜', '辣味菜', '海鲜', '汤羹', '面食', '清真菜', '凉菜', '粤菜', '硬菜', '湘菜', '烧烤', '京菜', '鲁菜', '苏菜', '浙菜', '徽菜'];

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '简单';
    case 'medium': return '中等';
    case 'hard': return '困难';
    default: return difficulty;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '#4CAF50';
    case 'medium': return '#FF9800';
    case 'hard': return '#f44336';
    default: return '#999';
  }
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { recipes, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, addRecipe } = useApp();
  const [showImportModal, setShowImportModal] = useState(false);
  const [recipeText, setRecipeText] = useState('');
  const [importError, setImportError] = useState('');

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !selectedCategory || selectedCategory === '全部' || (recipe.categories || []).includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchQuery, selectedCategory]);

  const handleImport = async () => {
    if (!recipeText.trim()) {
      setImportError('请输入菜谱内容');
      return;
    }

    try {
      const recipe = parseRecipeText(recipeText.trim());
      if (!recipe.name || recipe.name === '未命名菜谱') {
        setImportError('无法识别菜谱名称，请确保第一行是菜谱名称');
        return;
      }
      await addRecipe(recipe);
      setShowImportModal(false);
      setRecipeText('');
      setImportError('');
    } catch (error) {
      setImportError('解析失败，请检查菜谱格式');
    }
  };

  const handleCloseImport = () => {
    setShowImportModal(false);
    setRecipeText('');
    setImportError('');
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
    >
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={styles.difficultyText}>{getDifficultyText(item.difficulty)}</Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.recipeDescription} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={styles.recipeMeta}>
        <Text style={styles.metaText}>⏱ {item.prepTime} + {item.cookTime}</Text>
        <Text style={styles.metaText}>👥 {item.servings}人份</Text>
      </View>
      <View style={styles.tagContainer}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#f4511e" />
      
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索菜谱..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.importButton}
          onPress={() => setShowImportModal(true)}
        >
          <Text style={styles.importButtonText}>+ 导入</Text>
        </TouchableOpacity>
      </View>
      
      {/* 分类栏 */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      {/* 菜谱列表 */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeItem}
        contentContainerStyle={styles.recipeList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>没有找到相关菜谱</Text>
          </View>
        }
      />

      {/* 导入模态框 */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        onRequestClose={handleCloseImport}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseImport}>
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>导入菜谱</Text>
            <TouchableOpacity onPress={handleImport}>
              <Text style={styles.modalConfirmText}>导入</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formatGuide}>
              <Text style={styles.formatGuideTitle}>📋 菜谱格式参考</Text>
              <Text style={styles.formatGuideText}>
              {'番茄炒蛋\n\n📝 简介\n家常菜经典款，酸甜可口\n\n🗺️ 总体流程\n备料→炒蛋→炒番茄→混合调味\n\n⏱️ 基本信息\n准备时间\t10分钟\n烹饪时间\t5分钟\n份量\t2人份\n难度\t简单\n分类\t家常菜\n技法\t炒\n味型\t酸甜\n\n主料\n鸡蛋\t3个\n番茄\t2个\n\n辅料\n葱花\t适量\n\n调料\n盐\t适量\n糖\t1勺\n\n📋 备料步骤\n番茄洗净，在顶部划十字刀\n将番茄放入开水中烫30秒 💡 小贴士：更容易去皮\n\n🍳 炒菜步骤\n热锅凉油，倒入蛋液 耗时：1分钟 💡 小贴士：油温七成热\n\n🏷️ 标签\n家常菜、快手菜、下饭菜'}
            </Text>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <TextInput
                style={styles.recipeTextInput}
                placeholder="粘贴或输入菜谱内容..."
                placeholderTextColor="#999"
                value={recipeText}
                onChangeText={(text) => {
                  setRecipeText(text);
                  setImportError('');
                }}
                multiline
                textAlignVertical="top"
              />
            </KeyboardAvoidingView>

            {importError ? (
              <Text style={styles.errorText}>{importError}</Text>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#f4511e',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333',
  },
  importButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  importButtonText: {
    fontSize: 14,
    color: '#f4511e',
    fontWeight: 'bold',
  },
  categoryContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#f4511e',
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recipeList: {
    padding: 12,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recipeName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  recipeMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#999',
    marginRight: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#f4511e',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f4511e',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#fff',
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  formatGuide: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formatGuideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  formatGuideText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 22,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  recipeTextInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    minHeight: 300,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default HomeScreen;
