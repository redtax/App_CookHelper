import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useApp } from '../context';

const CategoryScreen: React.FC = () => {
  const { recipes, setSelectedCategory, selectedCategory } = useApp();
  const [activeType, setActiveType] = useState<'cuisine' | 'technique' | 'flavor'>('cuisine');

  const categories = useMemo(() => {
    const cuisines = new Set<string>();
    const techniques = new Set<string>();
    const flavors = new Set<string>();

    recipes.forEach(recipe => {
      recipe.tags.forEach(tag => cuisines.add(tag));
      if (recipe.technique) techniques.add(recipe.technique);
      if (recipe.flavor) flavors.add(recipe.flavor);
    });

    return {
      cuisines: Array.from(cuisines).slice(0, 12),
      techniques: Array.from(techniques).filter(t => t && t !== '（待补充）'),
      flavors: Array.from(flavors).filter(f => f && f !== '（待补充）'),
    };
  }, [recipes]);

  const renderCategoryItem = (item: string) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item ? styles.activeCategory : undefined,
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
    >
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item ? styles.activeCategoryText : undefined,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const getCurrentData = () => {
    if (activeType === 'cuisine')
      return categories.cuisines;
    if (activeType === 'technique')
      return categories.techniques;
    return categories.flavors;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>菜谱分类</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeType === 'cuisine' ? styles.activeTab : undefined]}
          onPress={() => setActiveType('cuisine')}
        >
          <Text style={[styles.tabText, activeType === 'cuisine' ? styles.activeTabText : undefined]}>
            菜系分类
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeType === 'technique' ? styles.activeTab : undefined]}
          onPress={() => setActiveType('technique')}
        >
          <Text style={[styles.tabText, activeType === 'technique' ? styles.activeTabText : undefined]}>
            烹饪技法
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeType === 'flavor' ? styles.activeTab : undefined]}
          onPress={() => setActiveType('flavor')}
        >
          <Text style={[styles.tabText, activeType === 'flavor' ? styles.activeTabText : undefined]}>
            菜肴味型
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getCurrentData()}
        renderItem={({ item }) => renderCategoryItem(item)}
        keyExtractor={(item, index) => `${item}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#f4511e',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  gridContent: {
    padding: 15,
    paddingBottom: 60,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  activeCategory: {
    backgroundColor: '#f4511e',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
    textAlign: 'center',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CategoryScreen;
