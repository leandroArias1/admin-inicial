import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/ui/Modal';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getCategories();
    setCategories(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditCat(null); setForm({ name: '', description: '' }); setShowModal(true); };
  const openEdit = (cat) => { setEditCat(cat); setForm({ name: cat.name, description: cat.description || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCat) await updateCategory(editCat._id, form);
      else await createCategory(form);
      setShowModal(false);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar categoría?')) return;
    await deleteCategory(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Categorías</h1>
            <p className="text-gray-500 mt-1">{categories.length} categorías</p>
          </div>
          <button className="btn-primary" onClick={openNew}>+ Nueva categoría</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat._id} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.slug}</p>
                  {cat.description && <p className="text-sm text-gray-500 mt-1">{cat.description}</p>}
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => openEdit(cat)} className="text-blue-500 hover:text-blue-700 text-sm">Editar</button>
                  <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700 text-sm">Borrar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCat ? 'Editar categoría' : 'Nueva categoría'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : 'Guardar'}</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
