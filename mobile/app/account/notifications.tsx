import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSettings } from "@/contexts/SettingsContext";

interface NotificationSetting {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  icon: any;
  settingKey?: keyof ReturnType<typeof useSettings>["settings"];
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();

  const notificationSettings: NotificationSetting[] = [
    {
      id: "notifications",
      title: "Bật thông báo",
      subtitle: "Nhận tất cả thông báo từ ứng dụng",
      enabled: settings.notifications,
      icon: "notifications",
      settingKey: "notifications",
    },
  ];

  const toggleNotification = async (settingKey: keyof typeof settings) => {
    await updateSettings({ [settingKey]: !settings[settingKey] });
    
    Alert.alert(
      "Cài đặt đã lưu",
      settings[settingKey] 
        ? "Bạn sẽ không nhận thông báo từ ứng dụng nữa" 
        : "Bạn sẽ nhận thông báo từ ứng dụng"
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 pt-7" edges={["bottom"]}>
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </Pressable>
          <Text className="text-xl font-bold text-slate-900">Thông báo</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-5">
        {/* Notification Settings */}
        <View className="mb-5">
          <Text className="text-base font-bold text-slate-900 mb-3 px-1">
            Cài đặt thông báo
          </Text>
          <View className="bg-white rounded-3xl p-2 shadow-sm">
            {notificationSettings.map((notif) => (
              <View key={notif.id} className="flex-row items-center p-4">
                <View className="w-11 h-11 rounded-full bg-slate-100 items-center justify-center">
                  <Ionicons name={notif.icon} size={20} color="#0a7ea4" />
                </View>
                <View className="flex-1 ml-3.5">
                  <Text className="text-base font-semibold text-slate-900 mb-0.5">
                    {notif.title}
                  </Text>
                  <Text className="text-sm text-slate-500">{notif.subtitle}</Text>
                </View>
                <Switch
                  value={notif.enabled}
                  onValueChange={() => notif.settingKey && toggleNotification(notif.settingKey)}
                  trackColor={{ false: "#cbd5e1", true: "#0a7ea4" }}
                  thumbColor="white"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <View className="flex-1 ml-2">
              <Text className="text-sm font-semibold text-slate-900 mb-1">
                Về thông báo
              </Text>
              <Text className="text-sm text-slate-600 leading-5">
                Chức năng thông báo push hiện đang được phát triển. Hiện tại, ứng dụng sẽ lưu kết quả phân tích vào lịch sử tài khoản của bạn để bạn có thể xem lại bất cứ lúc nào.
              </Text>
            </View>
          </View>
        </View>

        {/* Feature Coming Soon */}
        <View className="bg-amber-50 rounded-2xl p-4 mt-4 border border-amber-100">
          <View className="flex-row items-start">
            <Ionicons name="rocket" size={20} color="#f59e0b" />
            <View className="flex-1 ml-2">
              <Text className="text-sm font-semibold text-slate-900 mb-1">
                Sắp ra mắt
              </Text>
              <Text className="text-sm text-slate-600 leading-5">
                • Thông báo khi phân tích hoàn tất{"\n"}
                • Nhắc nhở chăm sóc da hàng ngày{"\n"}
                • Mẹo skincare theo tình trạng da của bạn
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
