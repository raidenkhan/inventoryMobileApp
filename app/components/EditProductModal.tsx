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
  //const [code, setCode] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [stock, setStock] = useState('');
  
  useEffect(() => {
    if (product) {
      setName(product.name);
     // setCode(product.code);
      setUnitPrice(product.unitPrice);
      setStock(product.stock?.toString() || '');
       
    }
  }, [product]);

  const handleSave = () => {
    if (!name ||   !unitPrice || !stock) return;
    onSave({ ...product, name , unitPrice, stock: parseInt(stock) });
    onClose();
  };

  return (
    <AddProductModal
      visible={visible}
      onClose={onClose}
      onAdd={handleSave} // ✅ reuse logic for update
      initialData={{ name, unitPrice, stock }}
    />
  );
}
