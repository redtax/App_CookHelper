import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AboutScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>关于炒菜助手</Text>
          <Text style={styles.subtitle}>版本 v2.1.0 (MVP)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>应用介绍</Text>
          <Text style={styles.sectionText}>
            炒菜助手是一款便捷的菜谱管理应用，帮助您轻松管理、编辑和烹饪美味佳肴。
            本应用包含539道精选菜谱，覆盖家常菜、川菜、粤菜等多种菜系。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>开发者信息</Text>
          <Text style={styles.sectionText}>本项目由 Redtax 开发完成</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>致谢</Text>
          <Text style={styles.sectionText}>
            React Native 和 Expo 官方团队
          </Text>
          <Text style={styles.sectionText}>
            开源社区的贡献者们
          </Text>
          <Text style={styles.sectionText}>
            青海新东方厨艺学校
          </Text>
          <Text style={styles.sectionText}>
            雷有良工作室雷有良大师
          </Text>
          <Text style={styles.sectionText}>
            所有用户的宝贵反馈
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>免责声明</Text>
          <Text style={styles.disclaimerText}>
            本应用中的菜谱内容均来源于青海新东方厨艺学校，仅供学习和参考使用。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>统计信息</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>539</Text>
              <Text style={styles.statLabel}>菜谱数量</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>316</Text>
              <Text style={styles.statLabel}>图片数量</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>(c) 2026 炒菜助手</Text>
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
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
  sectionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#777',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
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
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#999',
  },
});

export default AboutScreen;
