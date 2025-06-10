// app/navigation/types.ts

export type RootStackParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  Sales: undefined;
  Settings: undefined;

  // Accounts stack
  Accounts: undefined;
  AccountsHome: undefined;
  SuppliersList: undefined;
  SupplierProfile: {
    supplier: {
      id: string;
      name: string;
      balance?: number;
    };
  };

  // Optional modals or future screens
  AddProductModal?: undefined;
  AddSupplierModal?: undefined;
  ExportDataModal?: undefined;
};
