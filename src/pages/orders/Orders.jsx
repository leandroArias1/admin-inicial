import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '../../api/orders';
import AdminLayout from '../../components/layout/AdminLayout';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'yellow' },
  paid: { label: 'Pagado', color: 'blue' },
  processing: { label: 'En proceso', color: 'blue' },
  shipped: { label: 'Enviado', color: 'blue' },
  delivered: { label: 'Entregado', color: 'green' },
  cancelled: { label: 'Cancelado', color: 'red' },
};

const statusOptions = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await getOrders(filterStatus ? { status: filterStatus } : {});
    setOrders(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  const handleStatusChange = async (id, status) => {
    await updateOrderStatus(id, status);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Órdenes</h1>
            <p className="text-gray-500 mt-1">{orders.length} órdenes</p>
          </div>
          <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            {statusOptions.map(s => <option key={s} value={s}>{statusConfig[s]?.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div></div>
        ) : (
          <Table headers={['ID', 'Cliente', 'Total', 'Items', 'Estado', 'Fecha', 'Cambiar estado']}>
            {orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Sin órdenes</td></tr>
            ) : orders.map(order => {
              const s = statusConfig[order.status] || { label: order.status, color: 'gray' };
              return (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{order._id.slice(-8)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{order.user?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">${order.total?.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length} prod.</td>
                  <td className="px-4 py-3"><Badge color={s.color}>{s.label}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3">
                    <select
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={order.status}
                      onChange={e => handleStatusChange(order._id, e.target.value)}
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{statusConfig[s]?.label}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </AdminLayout>
  );
}
