import { useEffect, useState } from 'react';
import { getStats } from '../../api/stats';
import AdminLayout from '../../components/layout/AdminLayout';

const StatCard = ({ title, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const statusLabels = {
  pending: { label: 'Pendiente', color: 'text-yellow-600' },
  paid: { label: 'Pagado', color: 'text-blue-600' },
  processing: { label: 'En proceso', color: 'text-indigo-600' },
  shipped: { label: 'Enviado', color: 'text-purple-600' },
  delivered: { label: 'Entregado', color: 'text-green-600' },
  cancelled: { label: 'Cancelado', color: 'text-red-600' },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen general del negocio</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total órdenes" value={stats?.totalOrders ?? 0} icon="📦" color="bg-amber-50" />
          <StatCard title="Productos activos" value={stats?.totalProducts ?? 0} icon="🔧" color="bg-blue-50" />
          <StatCard title="Clientes" value={stats?.totalUsers ?? 0} icon="👥" color="bg-green-50" />
          <StatCard title="Órdenes pendientes" value={stats?.pendingOrders ?? 0} icon="⏳" color="bg-orange-50" />
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Ingresos totales aprobados</h2>
          <p className="text-4xl font-bold text-amber-600">
            ${stats?.totalRevenue?.toLocaleString('es-AR') ?? '0'}
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Órdenes recientes</h2>
          {stats?.recentOrders?.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin órdenes aún</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentOrders?.map(order => {
                const s = statusLabels[order.status] || { label: order.status, color: 'text-gray-600' };
                return (
                  <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">${order.total?.toLocaleString('es-AR')}</p>
                      <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
