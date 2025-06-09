import { useEffect, useState } from 'react';
import AddProductModal from './AddProductsModal';

export default function EditProductModal({
  visible,
  onClose,
  onSave,
  product,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedProduct: any) => void;
  product: any;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCode(product.code);
      setType(product.type);
      setStock(product.stock?.toString() || '');
    }
  }, [product]);

  const handleSave = () => {
    if (!name || !code || !type || !stock) return;
    onSave({ ...product, name, code, type, stock: parseInt(stock) });
    onClose();
  };

  return (
    <AddProductModal
      visible={visible}
      onClose={onClose}
      onAdd={handleSave} // ✅ reuse logic for update
      initialData={{ name, code, type, stock }}
    />
  );
}
