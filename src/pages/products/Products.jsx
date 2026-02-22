import { useEffect, useState } from 'react';
import { getProducts, deleteProduct, toggleProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import AdminLayout from '../../components/layout/AdminLayout';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ProductForm from './ProductForm';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        getProducts({ page, limit: 15, search: search || undefined }),
        getCategories(),
      ]);
      setProducts(pRes.data.data);
      setPagination(pRes.data.pagination);
      setCategories(cRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar producto?')) return;
    await deleteProduct(id);
    load();
  };

  const handleToggle = async (id) => { await toggleProduct(id); load(); };

  const handleEdit = (product) => { setEditProduct(product); setShowModal(true); };
  const handleNew = () => { setEditProduct(null); setShowModal(true); };
  const handleSaved = () => { setShowModal(false); load(); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Productos</h1>
            <p className="text-gray-500 mt-1">{pagination.total ?? 0} productos en total</p>
          </div>
          <button className="btn-primary" onClick={handleNew}>+ Nuevo producto</button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text" className="input max-w-xs" placeholder="Buscar producto..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Buscar</button>
        </form>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div></div>
        ) : (
          <>
            <Table headers={['Imagen', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones']}>
              {products.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Sin productos</td></tr>
              ) : products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">🔧</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    {p.partNumber && <p className="text-xs text-gray-400">#{p.partNumber}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 font-semibold">${p.price?.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3">
                    <Badge color={p.stock > 0 ? 'green' : 'red'}>{p.stock} u.</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={p.active ? 'green' : 'gray'}>{p.active ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Editar</button>
                      <button onClick={() => handleToggle(p._id)} className="text-amber-500 hover:text-amber-700 text-sm font-medium">
                        {p.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button className="btn-secondary px-3 py-1" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
                <span className="text-sm text-gray-600">{page} / {pagination.pages}</span>
                <button className="btn-secondary px-3 py-1" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>→</button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProduct ? 'Editar producto' : 'Nuevo producto'}>
        <ProductForm product={editProduct} categories={categories} onSaved={handleSaved} onCancel={() => setShowModal(false)} />
      </Modal>
    </AdminLayout>
  );
}
