import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useApp } from '../context';

const IngredientScreen: React.FC = () => {
  const { inventory, addInventoryItem, removeInventoryItem, updateInventoryItem, shoppingList, toggleShoppingItem, addShoppingItem, removeShoppingItem } = useApp();
  const [activeSection, setActiveSection] = useState<'inventory' | 'shopping'>('inventory');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');

  const handleAddInventory = () => {
    if (!newItemName.trim()) {
      Alert.alert('提示', '请输入食材名称');
      return;
    }
    addInventoryItem({
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: newItemQty || '1',
      unit: newItemUnit || '个',
      addedDate: new Date().toISOString().split('T')[0],
    });
    setNewItemName('');
    setNewItemQty('');
    setNewItemUnit('');
  };

  const handleAddShopping = () => {
    if (!newItemName.trim()) {
      Alert.alert('提示', '请输入食材名称');
      return;
    }
    addShoppingItem({
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: newItemQty || '1',
      unit: newItemUnit || '个',
      checked: false,
    });
    setNewItemName('');
    setNewItemQty('');
    setNewItemUnit('');
  };

  const handlePurchased = (item: { id: string; name: string; quantity: string; unit: string }) => {
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

  const handleOpenEditModal = (item: { id: string; quantity: string; unit: string; expiryDate?: string }) => {
    setEditingItemId(item.id);
    setEditQuantity(item.quantity);
    setEditUnit(item.unit);
    setEditExpiryDate(item.expiryDate || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingItemId) return;
    const targetItem = inventory.find(i => i.id === editingItemId);
    if (!targetItem) return;
    updateInventoryItem({
      ...targetItem,
      quantity: editQuantity || targetItem.quantity,
      unit: editUnit || targetItem.unit,
      expiryDate: editExpiryDate || undefined,
    });
    setEditModalVisible(false);
    setEditingItemId(null);
  };

  const expiredItems = inventory.filter(item => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>备料中心</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeSection === 'inventory' ? styles.activeTabButton : undefined]}
          onPress={() => setActiveSection('inventory')}
        >
          <Text style={[styles.tabText, activeSection === 'inventory' ? styles.activeTabText : undefined]}>
            食材库存
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeSection === 'shopping' ? styles.activeTabButton : undefined]}
          onPress={() => setActiveSection('shopping')}
        >
          <Text style={[styles.tabText, activeSection === 'shopping' ? styles.activeTabText : undefined]}>
            采购清单
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeSection === 'inventory' ? (
          <View style={styles.content}>
            {expiredItems.length > 0 ? (
              <View style={styles.expiryAlert}>
                <Text style={styles.expiryTitle}>即将过期提醒</Text>
                {expiredItems.map(item => (
                  <Text key={item.id} style={styles.expiryText}>
                    {item.name} - {item.expiryDate}
                  </Text>
                ))}
              </View>
            ) : null}

            <View style={styles.addRow}>
              <TextInput
                style={styles.input}
                placeholder="食材名称"
                placeholderTextColor="#999"
                value={newItemName}
                onChangeText={setNewItemName}
              />
              <TextInput
                style={styles.inputSmall}
                placeholder="数量"
                placeholderTextColor="#999"
                value={newItemQty}
                onChangeText={setNewItemQty}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.inputSmall}
                placeholder="单位"
                placeholderTextColor="#999"
                value={newItemUnit}
                onChangeText={setNewItemUnit}
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddInventory}>
                <Text style={styles.addBtnText}>添加</Text>
              </TouchableOpacity>
            </View>

            {inventory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无库存食材，快添加吧</Text>
              </View>
            ) : (
              inventory.map(item => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetail}>
                      {item.quantity} {item.unit}
                      {item.expiryDate ? `  ·  保质期: ${item.expiryDate}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEditModal(item)}
                  >
                    <Text style={styles.editBtnText}>编辑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeInventoryItem(item.id)}
                  >
                    <Text style={styles.deleteBtnText}>删除</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.addRow}>
              <TextInput
                style={styles.input}
                placeholder="食材名称"
                placeholderTextColor="#999"
                value={newItemName}
                onChangeText={setNewItemName}
              />
              <TextInput
                style={styles.inputSmall}
                placeholder="数量"
                placeholderTextColor="#999"
                value={newItemQty}
                onChangeText={setNewItemQty}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.inputSmall}
                placeholder="单位"
                placeholderTextColor="#999"
                value={newItemUnit}
                onChangeText={setNewItemUnit}
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddShopping}>
                <Text style={styles.addBtnText}>添加</Text>
              </TouchableOpacity>
            </View>

            {shoppingList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>采购清单为空，快添加吧</Text>
              </View>
            ) : (
              shoppingList.map(item => (
                <View key={item.id} style={[styles.itemCard, item.checked ? styles.itemChecked : undefined]}>
                  <TouchableOpacity
                    style={styles.itemInfoWrapper}
                    onPress={() => toggleShoppingItem(item.id)}
                  >
                    <Text style={[styles.itemName, item.checked ? styles.itemNameChecked : undefined]}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemDetail}>
                      {item.quantity} {item.unit}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.purchasedBtn}
                    onPress={() => handlePurchased(item)}
                  >
                    <Text style={styles.purchasedBtnText}>已购买</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeShoppingItem(item.id)}
                  >
                    <Text style={styles.deleteBtnText}>删除</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>编辑食材</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="数量"
              placeholderTextColor="#999"
              value={editQuantity}
              onChangeText={setEditQuantity}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="单位"
              placeholderTextColor="#999"
              value={editUnit}
              onChangeText={setEditUnit}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="保质期 (YYYY-MM-DD)"
              placeholderTextColor="#999"
              value={editExpiryDate}
              onChangeText={setEditExpiryDate}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingItemId(null);
                }}
              >
                <Text style={styles.modalCancelBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveBtnText}>保存</Text>
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
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#f4511e',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
  },
  activeTabText: {
    color: '#f4511e',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 15,
    paddingBottom: 60,
  },
  expiryAlert: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  expiryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 6,
  },
  expiryText: {
    fontSize: 13,
    color: '#BF360C',
    marginBottom: 2,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 6,
  },
  input: {
    flex: 2,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputSmall: {
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
  addBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  itemChecked: {
    opacity: 0.5,
  },
  itemInfoWrapper: {
    flex: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemDetail: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  purchasedBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  purchasedBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editBtnText: {
    fontSize: 13,
    color: '#1976D2',
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteBtnText: {
    fontSize: 13,
    color: '#f44336',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalCancelBtnText: {
    fontSize: 15,
    color: '#666',
  },
  modalSaveBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});

export default IngredientScreen;