'use client';

import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/lib/api/companies';
import { contactsApi } from '@/lib/api/contacts';
import { dealsApi } from '@/lib/api/deals';
import { Building2, Users, Handshake, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsApi.getAll,
  });

  const wonDeals = deals.filter((d) => d.stage === 'won');
  const totalRevenue = wonDeals.reduce((acc, d) => acc + Number(d.value), 0);

  const stats = [
    { label: 'Empresas', value: companies.length, icon: Building2, color: 'text-blue-400' },
    { label: 'Contactos', value: contacts.length, icon: Users, color: 'text-purple-400' },
    { label: 'Deals activos', value: deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length, icon: Handshake, color: 'text-teal-400' },
    { label: 'Revenue ganado', value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400' },
  ];

  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">Resumen general del CRM</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Deals recientes */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Deals recientes</h2>
        {deals.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay deals aún</p>
        ) : (
          <div className="space-y-3">
            {deals.slice(0, 5).map((deal) => (
              <div key={deal.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{deal.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{deal.contact?.firstName} {deal.contact?.lastName}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">${Number(deal.value).toLocaleString()}</p>
                  <span className="text-xs text-teal-400 capitalize">{deal.stage}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}