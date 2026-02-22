import { useState } from 'react';
import { createProduct, updateProduct } from '../../api/products';

export default function ProductForm({ product, categories, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || 0,
    category: product?.category?._id || '',
    brand: product?.brand || '',
    partNumber: product?.partNumber || '',
    compatible: product?.compatible?.join(', ') || '',
    featured: product?.featured || false,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'compatible') fd.append(k, JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean)));
        else if (k === 'featured') fd.append(k, String(v));
        else fd.append(k, v);
      });
      images.forEach(img => fd.append('images', img));

      if (product) await updateProduct(product._id, fd);
      else await createProduct(fd);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio (ARS) *</label>
          <input type="number" className="input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input type="number" className="input" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} min="0" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
          <option value="">Sin categoría</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <input className="input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nº de parte</label>
          <input className="input" value={form.partNumber} onChange={e => setForm({...form, partNumber: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Modelos IVECO compatibles (separados por coma)</label>
        <input className="input" placeholder="Daily 35S14, Daily 50C15, Stralis" value={form.compatible} onChange={e => setForm({...form, compatible: e.target.value})} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea className="input h-20 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes (máx. 5)</label>
        <input type="file" accept="image/*" multiple onChange={e => setImages([...e.target.files])} className="text-sm text-gray-500 file:mr-3 file:btn-secondary file:rounded-lg file:border-0 file:text-sm file:font-medium" />
        {images.length > 0 && <p className="text-xs text-gray-400 mt-1">{images.length} imagen(es) seleccionada(s)</p>}
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded" />
        <label htmlFor="featured" className="text-sm text-gray-700">Producto destacado</label>
      </div>

      {product?.images?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Imágenes actuales</p>
          <div className="flex gap-2">
            {product.images.map((img, i) => (
              <img key={i} src={img.url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear producto'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}
