import { getCategoryConfig } from "@/constants/categories";
import { useAccountQuery } from "@/hooks/queries/useAccountsQuery";
import { useBudgetQuery } from "@/hooks/queries/useBudgetQuery";
import { useTransactionsQuery } from "@/hooks/queries/useTransactionsQuery";
import { formatPrice } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { Transaction } from "@/types";
import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { isSameMonth } from "date-fns";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  {
    icon: "camera",
    label: "AI Receipt Scan",
    action: "scan",
    color: "#1A85FF",
  },
  {
    icon: "mic",
    label: "Voice Entry",
    action: "voice",
    color: "#FF6B4A",
  },
  {
    icon: "plus",
    label: "Add Manually",
    action: "manual",
    color: "#3DDC84",
  },
] as const;

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const currency = useUserStore((s) => s.currency);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  const {
    data: accounts = [],
    isLoading: accountLoading,
    isRefetching: accountRefetcing,
    refetch: refetchAccounts,
  } = useAccountQuery();

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    isRefetching: transactionsRefetcing,
    refetch: refetchTransactions,
  } = useTransactionsQuery();

  const { data: budget = null, refetch: refetchBudget } = useBudgetQuery();

  const laoding = accountLoading || transactionsLoading;
  const refreshing = accountRefetcing || transactionsRefetcing;

  const onRefresh = () => {
    refetchAccounts();
    refetchTransactions();
    refetchBudget();
  };

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  const monthTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) => isSameMonth(new Date(tx.date), now));
  }, [transactions]);

  const monthIncome = useMemo(
    () =>
      monthTransactions
        .filter((tx) => tx.type === "INCOME")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [monthTransactions],
  );
  const monthExpense = useMemo(
    () =>
      monthTransactions
        .filter((tx) => tx.type === "EXPENSE")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [monthTransactions],
  );

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions],
  );

  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .forEach((tx) => {
        map[tx.category] = (map[tx.category] ?? 0) + tx.amount;
      });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category: category as Transaction["category"],
        amount,
        color: getCategoryConfig(category as Transaction["category"]).color,
      }));
  }, [monthTransactions]);

  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
      <ScrollView
        className="flex-1 bg-brand-body"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="bg-brand-bg rounded-[28px] px-5 mx-1 pt-5 pb-[22px]">
          <View className="flex-row justify-between items-center mb-[22px]">
            <Image
              source={require("../../../assets/images/welth-light.png")}
              style={{ width: 80, height: "100%" }}
              contentFit="contain"
            />
            <View className="flex-row items-center gap-2.5">
              <View className="items-end">
                <Text className="text-brand-text-secondary text-xs">
                  {getGreeting()}
                </Text>
                <Text className="text-brand-text-primary text-base font-medium">
                  {user?.firstName ?? "there"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/profile")}
                className="w-[38px] h-[38px] rounded-full bg-[#1A1D26] items-center justify-center overflow-hidden"
              >
                {user?.imageUrl && user.hasImage ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={{ width: 38, height: 38 }}
                    contentFit="cover"
                  />
                ) : (
                  <Feather name="user" size={18} color="#8A8D96" />
                )}
              </TouchableOpacity>
            </View>

            <View className="mb-[22px]">
              <Text className="text-brand-text-secondary text-xs mb-1.5">
                Total balance
              </Text>
              <Text className="text-brand-text-primary text-[38px] font-medium tracking-tight">
                {formatPrice(totalBalance, currency)}
              </Text>
              <View className="flex-row gap-3.5 mt-2.5">
                <View className="flex-row items-center gap-1.5">
                  <Feather name="arrow-up-right" size={14} color="#3DDC84" />
                  <Text className="text-brand-success text-[13px]">
                    {formatPrice(monthIncome, currency)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Feather name="arrow-down-right" size={14} color="#FF6B4A" />
                  <Text className="text-brand-coral text-[13px]">
                    {formatPrice(monthExpense, currency)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
