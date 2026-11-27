import { useCallback } from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import Button from "@/components/button";
import Card from "@/components/card";
import CardHeader from "@/components/cardHeader";
import EmptyState from "@/components/emptyState";
import HistoryItem from "@/components/historyItem";
import SearchBar from "@/components/searchBar";
import { useHistoryFetching } from "@/hooks/useHistoryFetching";
import { History } from "@/types";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/tokens";

export default function HistoryPage() {
  const {
    history,
    hasHistory,
    isRefreshing,
    refreshHistory,
    query,
    setQuery,
    handleDelete,
    handleFetch,
    handleClearAll,
  } = useHistoryFetching();

  const renderItem: ListRenderItem<History> = useCallback(
    ({ item }) => (
      <HistoryItem item={item} onDelete={handleDelete} onOpen={handleFetch} />
    ),
    [handleDelete, handleFetch],
  );

  if (!hasHistory) {
    return (
      <View style={styles.container}>
        <EmptyState text="Your history is empty" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <CardHeader
          title="History"
          action={
            <Button
              label="Clear all"
              fun={handleClearAll}
              icon="trash-outline"
              small
              alt
              danger
            />
          }
        >
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search by title or volume"
          />
        </CardHeader>

        <FlatList
          data={history}
          keyExtractor={(h) => h.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshHistory}
              tintColor={colors.main}
            />
          }
          ListEmptyComponent={
            <EmptyState text={`No results for "${query.trim()}"`} />
          }
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg2,
    alignItems: "center",
    paddingVertical: 24,
  },
  card: { flex: 1 },
  list: { flex: 1, width: "100%" },
  listContent: { gap: spacing.md, paddingBottom: spacing.xl },
});
