// Import components first
import LimitOrderView from './LimitOrderView';
import LimitOrderSellView from './LimitOrderSellView';
import OrderTypeModal from './OrderTypeModal';
import SimpleStockChart from './SimpleStockChart';

// Re-export as named exports
export { LimitOrderView, LimitOrderSellView, OrderTypeModal, SimpleStockChart };

// Add a dummy default export to satisfy Expo Router
// This prevents the "missing the required default export" warning
const ComponentsExport = {
  LimitOrderView,
  LimitOrderSellView,
  OrderTypeModal,
  SimpleStockChart
};

export default ComponentsExport;
