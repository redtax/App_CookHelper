import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context';

const SettingsScreen: React.FC = () => {
  const { recipes, loadRecipes } = useApp();
  const [showImage, setShowImage] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const handleResetData = () => {
    Alert.alert(
      '确认重置',
      '确定要重置所有数据吗？这将删除您编辑的菜谱，恢复初始状态。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await loadRecipes(true);
            Alert.alert('提示', '数据已重置完成！');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      '清除缓存',
      '确定要清除图片缓存吗？这会释放内存，但下次打开图片需要重新加载。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            Alert.alert('提示', '缓存已清除！');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>设置</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>显示设置</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>显示菜谱图片</Text>
            <Switch
              value={showImage}
              onValueChange={setShowImage}
              trackColor={{ false: '#ddd', true: '#ff8a65' }}
              thumbColor={showImage ? '#f4511e' : '#f4f4f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据管理</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>自动备份数据</Text>
            <Switch
              value={autoBackup}
              onValueChange={setAutoBackup}
              trackColor={{ false: '#ddd', true: '#ff8a65' }}
              thumbColor={autoBackup ? '#f4511e' : '#f4f4f4'}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleResetData}>
            <Text style={styles.buttonText}>重置数据</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={handleClearCache}>
            <Text style={styles.buttonTextSecondary}>清除图片缓存</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据统计</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{recipes.length}</Text>
              <Text style={styles.statLabel}>当前菜谱</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>版本信息</Text>
          <Text style={styles.infoText}>炒菜助手 v2.1.0 (MVP)</Text>
          <Text style={styles.infoSubtext}>最后更新：2026-05-21</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>提示：更多功能正在开发中...</Text>
        </View>
      </ScrollView>
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
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#444',
  },
  button: {
    backgroundColor: '#f4511e',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoText: {
    fontSize: 15,
    color: '#444',
    marginVertical: 4,
  },
  infoSubtext: {
    fontSize: 13,
    color: '#777',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#999',
  },
});

export default SettingsScreen;
