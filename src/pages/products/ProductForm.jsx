import { useState, useEffect } from 'react';
import api from '../../api/axios';

const IVECO_MODELS = [
  'Daily', 'Stralis', 'Tector', 'Eurocargo', 'Vertis',
  'Powerstar', 'Hi-Way', 'Hi-Road', 'Cursor', 'AT',
];

export default function ProductForm({ product, onSave, onSaved, onClose, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category: product?.category?._id || product?.category || '',
    brand: product?.brand || '',
    partNumber: product?.partNumber || '',
    description: product?.description || '',
    featured: product?.featured || false,
  });

  const [compatible, setCompatible] = useState(() => {
    if (!Array.isArray(product?.compatible)) return [];
    return product.compatible
      .flatMap(m => m.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()))
      .filter(Boolean);
  });

  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data));
  }, []);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeExisting = (idx) => setExistingImages(prev => prev.filter((_, i) => i !== idx));

  const removeNew = (idx) => {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const toggleModel = (model) => {
    setCompatible(prev =>
      prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('price', form.price);
    fd.append('stock', form.stock);
    fd.append('category', form.category);
    fd.append('brand', form.brand);
    fd.append('partNumber', form.partNumber);
    fd.append('description', form.description);
    fd.append('featured', form.featured);
    fd.append('compatible', compatible.join(','));
    const keepImagesData = existingImages.map(img => ({ url: img.url, filename: img.filename || '' }));
    console.log('keepImages:', JSON.stringify(keepImagesData));
    fd.append('keepImages', JSON.stringify(keepImagesData));
    console.log('newFiles a enviar:', newFiles.length, newFiles.map(f => f.name + ' ' + f.size));
    newFiles.forEach(f => fd.append('images', f));

    try {
      if (product) {
        await api.put(`/products/${product._id}`, fd);
      } else {
        await api.post('/products', fd);
      }
      setSuccess(product ? '✓ Producto actualizado correctamente' : '✓ Producto creado correctamente');
      setTimeout(onSave || onSaved, 1200);
    } catch (err) {
      if (!err.response || err.response.status < 400) {
        setSuccess(product ? '✓ Producto actualizado correctamente' : '✓ Producto creado correctamente');
        setTimeout(onSave || onSaved, 1200);
      } else {
        setError(err.response?.data?.message || 'Error al guardar');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-3 rounded text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-600 px-4 py-3 rounded text-sm">{success}</div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nombre *</label>
        <input className="input w-full" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Precio (ARS) *</label>
          <input type="number" className="input w-full" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Stock</label>
          <input type="number" className="input w-full" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Categoría</label>
        <select className="input w-full" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
          <option value="">Sin categoría</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Marca</label>
          <input className="input w-full" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nº de parte</label>
          <input className="input w-full" value={form.partNumber} onChange={e => setForm({...form, partNumber: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descripción</label>
        <textarea className="input w-full h-20 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Modelos IVECO compatibles
        </label>
        <div className="flex flex-wrap gap-2">
          {IVECO_MODELS.map(model => (
            <button key={model} type="button" onClick={() => toggleModel(model)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border-2 ${
                compatible.includes(model)
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-500'
              }`}>
              {model}
            </button>
          ))}
        </div>
        {compatible.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            Seleccionados: <span className="text-amber-600 font-medium">{compatible.join(', ')}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="featured" checked={form.featured}
          onChange={e => setForm({...form, featured: e.target.checked})}
          className="w-4 h-4 accent-amber-500" />
        <label htmlFor="featured" className="text-sm text-gray-600">Producto destacado</label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Fotos del producto
        </label>

        {existingImages.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-2">Fotos actuales:</p>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img, i) => (
                <div key={i} className="relative group w-20 h-20">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => removeExisting(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs
                               flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {previews.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-2">Fotos nuevas:</p>
            <div className="flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative group w-20 h-20">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-lg border-2 border-amber-300" />
                  <button type="button" onClick={() => removeNew(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs
                               flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <div className="flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-amber-400
                          text-gray-400 hover:text-amber-500 rounded-xl px-4 py-3 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Agregar fotos</span>
          </div>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
        </label>
        <p className="text-xs text-gray-400 mt-1">Máx 5 fotos · 5MB por foto.</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
          {loading ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button type="button" onClick={onClose || onCancel}
          className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:border-gray-300 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}
