import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useApp } from '../context';
import { CookingNote } from '../types';

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const renderMarkdown = (text: string): React.ReactElement[] => {
  const lines = text.split('\n');
  const elements: React.ReactElement[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <View key={`code-${i}`} style={styles.mdCodeBlock}>
            <Text style={styles.mdCodeText} selectable>{codeLines.join('\n')}</Text>
          </View>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.trim() === '') {
      elements.push(<View key={`empty-${i}`} style={styles.mdEmptyLine} />);
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <Text key={`h1-${i}`} style={styles.mdH1} selectable>{line.slice(2)}</Text>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <Text key={`h2-${i}`} style={styles.mdH2} selectable>{line.slice(3)}</Text>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <Text key={`h3-${i}`} style={styles.mdH3} selectable>{line.slice(4)}</Text>
      );
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <Text key={`bullet-${i}`} style={styles.mdBullet} selectable>
          {'\u2022'} {line.slice(2)}
        </Text>
      );
      continue;
    }

    if (line.trim() === '---') {
      elements.push(<View key={`hr-${i}`} style={styles.mdHr} />);
      continue;
    }

    if (line.startsWith('> ')) {
      elements.push(
        <View key={`quote-${i}`} style={styles.mdQuoteContainer}>
          <Text style={styles.mdQuoteText} selectable>{line.slice(2)}</Text>
        </View>
      );
      continue;
    }

    const parts = line.split(/(\*\*.*?\*\*)/g);
    elements.push(
      <Text key={`text-${i}`} style={styles.mdText} selectable>
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <Text key={idx} style={styles.mdBold}>{part.slice(2, -2)}</Text>;
          }
          return part;
        })}
      </Text>
    );
  }

  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <View key="code-end" style={styles.mdCodeBlock}>
        <Text style={styles.mdCodeText} selectable>{codeLines.join('\n')}</Text>
      </View>
    );
  }

  return elements;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavProp>();
  const {
    recipes,
    favorites,
    inventory,
    cookingNotes,
    shoppingList,
    toggleShoppingItem,
    addShoppingItem,
    removeShoppingItem,
    addInventoryItem,
    toggleFavorite,
    loadRecipes,
    activeCookingRecipeId,
    setActiveCooking,
    addCookingNote,
    updateCookingNote,
    deleteCookingNote,
    userModifiedRecipes,
  } = useApp();
  const [activeSection, setActiveSection] = useState<
    'favorites' | 'shopping' | 'notes' | 'myRecipes' | 'inventory' | 'settings' | 'about'
  >('favorites');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [readmeContent, setReadmeContent] = useState('加载中...');
  const [unfavoritedIds, setUnfavoritedIds] = useState<Set<string>>(new Set());
  const [shoppingName, setShoppingName] = useState('');
  const [shoppingQty, setShoppingQty] = useState('');
  const [shoppingUnit, setShoppingUnit] = useState('');

  useEffect(() => {
    if (activeSection === 'about') {
      const loadReadme = async () => {
        try {
          const asset = Asset.fromModule(require('../../assets/README.md'));
          await asset.downloadAsync();
          if (asset.localUri) {
            const response = await fetch(asset.localUri);
            const text = await response.text();
            setReadmeContent(text);
          }
        } catch {
          setReadmeContent('无法加载 README.md');
        }
      };
      loadReadme();
    }
  }, [activeSection]);

  const favoriteRecipes = recipes.filter(r =>
    favorites.includes(r.id) || unfavoritedIds.has(r.id)
  );

  const modifiedRecipes = recipes.filter(r => userModifiedRecipes.includes(r.id));
  const freeNotes = cookingNotes.filter(n => n.recipeId === '_free_note_');

  const handleResetData = () => {
    Alert.alert('确认重置', '确定要重置所有数据吗？这将删除您编辑的菜谱，恢复初始状态。', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await loadRecipes();
          Alert.alert('提示', '数据已重置完成！');
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('清除缓存', '确定要清除图片缓存吗？这会释放内存，但下次打开图片需要重新加载。', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: () => Alert.alert('提示', '缓存已清除！'),
      },
    ]);
  };

  const handleClearCooking = () => {
    Alert.alert('清除烹饪状态', '确定要清除当前正在进行的烹饪记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: () => setActiveCooking(null, 0),
      },
    ]);
  };

  const handleSendFeedback = async () => {
    const email = 'redtax@163.com';
    const subject = encodeURIComponent('味溯新东方 用户反馈');
    const body = encodeURIComponent('请在这里写下您的建议...\n\n');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    await Linking.openURL(url).catch(() => {
      Alert.alert('提示', '无法打开邮件客户端，请手动发送邮件至\nredtax@163.com');
    });
  };

  const handleStarToggle = (recipeId: string) => {
    if (favorites.includes(recipeId)) {
      toggleFavorite(recipeId);
      setUnfavoritedIds(prev => new Set(prev).add(recipeId));
    } else if (unfavoritedIds.has(recipeId)) {
      toggleFavorite(recipeId);
      const updated = new Set(unfavoritedIds);
      updated.delete(recipeId);
      setUnfavoritedIds(updated);
    }
  };

  const handleAddFreeNote = () => {
    setEditingNoteId(null);
    setNoteContent('');
    setShowNoteModal(true);
  };

  const handleEditFreeNote = (note: CookingNote) => {
    setEditingNoteId(note.id);
    setNoteContent(note.content);
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) {
      Alert.alert('提示', '笔记内容不能为空');
      return;
    }
    if (editingNoteId) {
      const note = cookingNotes.find(n => n.id === editingNoteId);
      if (note) {
        updateCookingNote({ ...note, content: noteContent.trim() });
      }
    } else {
      const newNote: CookingNote = {
        id: Date.now().toString(),
        recipeId: '_free_note_',
        recipeName: '自由笔记',
        date: new Date().toLocaleDateString('zh-CN'),
        content: noteContent.trim(),
        rating: 0,
        isSuccess: true,
      };
      addCookingNote(newNote);
    }
    setShowNoteModal(false);
    setNoteContent('');
    setEditingNoteId(null);
  };

  const handleDeleteFreeNote = (noteId: string) => {
    Alert.alert('确认删除', '确定要删除这条笔记吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => deleteCookingNote(noteId),
      },
    ]);
  };

  const handleAddShoppingItem = () => {
    if (!shoppingName.trim()) {
      Alert.alert('提示', '请输入食材名称');
      return;
    }
    addShoppingItem({
      id: Date.now().toString(),
      name: shoppingName.trim(),
      quantity: shoppingQty || '1',
      unit: shoppingUnit || '个',
      checked: false,
    });
    setShoppingName('');
    setShoppingQty('');
    setShoppingUnit('');
  };

  const handlePurchaseItem = (item: { id: string; name: string; quantity: string; unit: string }) => {
    removeShoppingItem(item.id);
    addInventoryItem({
      id: Date.now().toString(),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      addedDate: new Date().toISOString().split('T')[0],
    });
    Alert.alert('提示', '已添加到食材库存');
  };

  const menuSections = [
    { key: 'favorites' as const, label: '我的收藏', count: favorites.length },
    { key: 'shopping' as const, label: '采购清单', count: shoppingList.length },
    { key: 'notes' as const, label: '烹饪笔记', count: freeNotes.length },
    { key: 'myRecipes' as const, label: '我的配方', count: modifiedRecipes.length },
    { key: 'inventory' as const, label: '食材库存', count: inventory.length },
    { key: 'settings' as const, label: '设置', count: 0 },
    { key: 'about' as const, label: '关于', count: 0 },
  ];

  const renderMenuGrid = () => (
    <View style={styles.menuGrid}>
      {menuSections.map(section => (
        <TouchableOpacity
          key={section.key}
          style={[
            styles.menuItem,
            activeSection === section.key ? styles.menuItemActive : undefined,
          ]}
          onPress={() => setActiveSection(section.key)}
        >
          <Text style={[
            styles.menuLabel,
            activeSection === section.key ? styles.menuLabelActive : undefined,
          ]}>
            {section.label}
          </Text>
          {section.key !== 'settings' && section.key !== 'about' ? (
            <Text style={[
              styles.menuCount,
              { color: section.count > 0 ? '#f4511e' : '#666' },
            ]}>
              {section.count}
            </Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'favorites':
        return favoriteRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无收藏菜谱</Text>
            <Text style={styles.emptySubtext}>在菜谱详情页点击收藏即可添加</Text>
          </View>
        ) : (
          favoriteRecipes.map(recipe => (
            <View key={recipe.id} style={styles.recipeItem}>
              <TouchableOpacity
                style={styles.recipeInfoTouchable}
                onPress={() => navigation.navigate('RecipeDetail', { recipe })}
              >
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <Text style={styles.recipeTags}>{recipe.tags.slice(0, 3).join('、')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.favButton}
                onPress={() => handleStarToggle(recipe.id)}
              >
                <Text style={[
                  styles.favIcon,
                  favorites.includes(recipe.id) && !unfavoritedIds.has(recipe.id)
                    ? styles.favIconActive
                    : styles.favIconInactive,
                ]}>
                  {favorites.includes(recipe.id) && !unfavoritedIds.has(recipe.id) ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        );

      case 'shopping':
        return shoppingList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>采购清单为空</Text>
            <Text style={styles.emptySubtext}>前往「备料」页面或备料步骤中添加食材</Text>
          </View>
        ) : (
          <View>
            <View style={styles.shoppingAddRow}>
              <TextInput
                style={styles.shoppingInput}
                placeholder="食材名称"
                placeholderTextColor="#999"
                value={shoppingName}
                onChangeText={setShoppingName}
              />
              <TextInput
                style={styles.shoppingInputSmall}
                placeholder="数量"
                placeholderTextColor="#999"
                value={shoppingQty}
                onChangeText={setShoppingQty}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.shoppingInputSmall}
                placeholder="单位"
                placeholderTextColor="#999"
                value={shoppingUnit}
                onChangeText={setShoppingUnit}
              />
              <TouchableOpacity style={styles.shoppingAddBtn} onPress={handleAddShoppingItem}>
                <Text style={styles.shoppingAddBtnText}>添加</Text>
              </TouchableOpacity>
            </View>
            {shoppingList.map(item => (
              <View key={item.id} style={[styles.shopItem, item.checked ? styles.shopItemChecked : undefined]}>
                <TouchableOpacity
                  style={styles.shopItemInfo}
                  onPress={() => toggleShoppingItem(item.id)}
                >
                  <Text style={[styles.shopItemName, item.checked ? styles.shopItemNameChecked : undefined]}>
                    {item.name}
                  </Text>
                  <Text style={styles.shopItemDetail}>
                    {item.quantity} {item.unit}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shopPurchaseBtn}
                  onPress={() => handlePurchaseItem(item)}
                >
                  <Text style={styles.shopPurchaseBtnText}>已购买</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shopDeleteBtn}
                  onPress={() => removeShoppingItem(item.id)}
                >
                  <Text style={styles.shopDeleteBtnText}>删除</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'notes':
        return (
          <View>
            <TouchableOpacity style={styles.addNoteBtn} onPress={handleAddFreeNote}>
              <Text style={styles.addNoteBtnText}>+ 添加笔记</Text>
            </TouchableOpacity>
            {freeNotes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无自由笔记</Text>
                <Text style={styles.emptySubtext}>点击上方按钮记录烹饪心得</Text>
              </View>
            ) : (
              freeNotes.map(note => (
                <TouchableOpacity
                  key={note.id}
                  style={styles.freeNoteCard}
                  onPress={() => handleEditFreeNote(note)}
                >
                  <View style={styles.freeNoteHeader}>
                    <Text style={styles.freeNoteDate}>{note.date}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteFreeNote(note.id)}
                      style={styles.freeNoteDeleteBtn}
                    >
                      <Text style={styles.freeNoteDeleteText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.freeNoteContent} numberOfLines={4}>
                    {note.content}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        );

      case 'myRecipes':
        return modifiedRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无维护过的菜谱</Text>
            <Text style={styles.emptySubtext}>编辑或导入菜谱后将在这里显示</Text>
          </View>
        ) : (
          modifiedRecipes.map(recipe => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeListItem}
              onPress={() => navigation.navigate('RecipeDetail', { recipe })}
            >
              <View style={styles.recipeListItemInfo}>
                <Text style={styles.recipeListItemName}>{recipe.name}</Text>
                <Text style={styles.recipeListItemTags}>
                  {(recipe.categories || []).slice(0, 2).join(' · ')}
                  {recipe.tags && recipe.tags.length > 0
                    ? (recipe.categories && recipe.categories.length > 0 ? ' · ' : '') + recipe.tags.slice(0, 3).join('、')
                    : ''}
                </Text>
              </View>
              <Text style={styles.recipeListItemArrow}>{'\u2192'}</Text>
            </TouchableOpacity>
          ))
        );

      case 'inventory':
        return inventory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无库存食材</Text>
            <Text style={styles.emptySubtext}>前往「备料」页面添加食材</Text>
          </View>
        ) : (
          inventory.map(item => (
            <View key={item.id} style={styles.invItem}>
              <Text style={styles.invName}>{item.name}</Text>
              <Text style={styles.invQty}>{item.quantity} {item.unit}</Text>
            </View>
          ))
        );

      case 'settings':
        return (
          <View>
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>用户反馈</Text>
              <TouchableOpacity style={styles.feedbackBtn} onPress={handleSendFeedback}>
                <Text style={styles.feedbackBtnText}>发送反馈邮件</Text>
                <Text style={styles.feedbackBtnSub}>redtax@163.com</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>数据管理</Text>
              <TouchableOpacity style={styles.settingBtn} onPress={handleResetData}>
                <Text style={styles.settingBtnText}>重置数据</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingBtnSecondary} onPress={handleClearCache}>
                <Text style={styles.settingBtnTextSecondary}>清除图片缓存</Text>
              </TouchableOpacity>
              {activeCookingRecipeId ? (
                <TouchableOpacity style={styles.settingBtnSecondary} onPress={handleClearCooking}>
                  <Text style={styles.settingBtnTextSecondary}>清除当前烹饪状态</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        );

      case 'about':
        return null;

      default:
        return null;
    }
  };

  if (activeSection === 'about') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderMenuGrid()}
          <View style={styles.section}>
            {renderMarkdown(readmeContent)}
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>味溯新东方 - 记录每一道美味</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderMenuGrid()}

        <View style={styles.section}>
          {renderSectionContent()}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>味溯新东方 - 记录每一道美味</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showNoteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingNoteId ? '编辑笔记' : '添加笔记'}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={noteContent}
              onChangeText={setNoteContent}
              placeholder="记录你的烹饪心得..."
              placeholderTextColor="#999"
              multiline
              autoFocus
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowNoteModal(false);
                  setNoteContent('');
                  setEditingNoteId(null);
                }}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveNote}>
                <Text style={styles.modalSaveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 60,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    width: '30%',
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  menuItemActive: {
    backgroundColor: '#f4511e',
  },
  menuLabel: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#fff',
  },
  menuCount: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 12,
    paddingBottom: 60,
  },
  recipeItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeInfoTouchable: {
    flex: 1,
    padding: 14,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  recipeTags: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  favButton: {
    padding: 14,
  },
  favIcon: {
    fontSize: 20,
  },
  favIconActive: {
    color: '#f4511e',
  },
  favIconInactive: {
    color: '#ccc',
  },
  addNoteBtn: {
    backgroundColor: '#f4511e',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  addNoteBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  freeNoteCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  freeNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  freeNoteDate: {
    fontSize: 12,
    color: '#999',
  },
  freeNoteDeleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  freeNoteDeleteText: {
    fontSize: 12,
    color: '#e53935',
  },
  freeNoteContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  recipeListItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeListItemInfo: {
    flex: 1,
  },
  recipeListItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  recipeListItemTags: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  recipeListItemArrow: {
    fontSize: 16,
    color: '#bbb',
    marginLeft: 8,
  },
  invItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invName: {
    fontSize: 15,
    color: '#333',
  },
  invQty: {
    fontSize: 14,
    color: '#888',
  },
  shoppingAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  shoppingInput: {
    flex: 2,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shoppingInputSmall: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shoppingAddBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shoppingAddBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shopItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  shopItemChecked: {
    opacity: 0.5,
  },
  shopItemInfo: {
    flex: 1,
  },
  shopItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  shopItemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  shopItemDetail: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  shopPurchaseBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  shopPurchaseBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  shopDeleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  shopDeleteBtnText: {
    fontSize: 13,
    color: '#f44336',
  },
  settingSection: {
    marginBottom: 20,
  },
  settingSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  settingLabel: {
    fontSize: 15,
    color: '#444',
  },
  settingBtn: {
    backgroundColor: '#f4511e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  settingBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  settingBtnSecondary: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  settingBtnTextSecondary: {
    color: '#555',
    fontSize: 15,
    fontWeight: '500',
  },
  feedbackBtn: {
    backgroundColor: '#f4511e',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  feedbackBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackBtnSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  mdH1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  mdH2: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 6,
  },
  mdH3: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  mdBullet: {
    fontSize: 14,
    color: '#555',
    paddingLeft: 12,
  },
  mdCodeBlock: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    marginVertical: 4,
  },
  mdCodeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#444',
  },
  mdHr: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  mdQuoteContainer: {
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#f4511e',
    marginVertical: 4,
  },
  mdQuoteText: {
    fontStyle: 'italic',
    color: '#666',
    fontSize: 14,
  },
  mdText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 2,
  },
  mdBold: {
    fontWeight: 'bold',
  },
  mdEmptyLine: {
    height: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 60,
  },
  footerText: {
    fontSize: 12,
    color: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 120,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 15,
    color: '#888',
  },
  modalSaveBtn: {
    backgroundColor: '#f4511e',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  modalSaveText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen;