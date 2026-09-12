import cc from "currency-codes";
import getSymbol from "currency-symbol-map";
import { SafeAreaView } from "react-native-safe-area-context";

export type CurrencyEntry = { code: string; name: string; symbol: string };

export const ALL_CURRENCIES: CurrencyEntry[] = cc
  .codes()
  .map((code) => ({
    code,
    name: cc.code(code)?.currency ?? code,
    symbol: getSymbol(code) ?? code,
  }))
  .filter((c) => c.symbol !== c.code);

export function CurrencyPicker({
  visible,
  selectedCode,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedCode: string;
  onSelect: (currency: CurrencyEntry) => void;
  onClose: () => void;
}) {
  return <SafeAreaView></SafeAreaView>;
}
