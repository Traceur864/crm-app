'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi, CreateActivityDto } from '@/lib/api/activities';
import { dealsApi } from '@/lib/api/deals';
import { contactsApi } from '@/lib/api/contacts';
import { Plus, X, Phone, Mail, Users, FileText, Calendar } from 'lucide-react';

const emptyForm: CreateActivityDto = {
  type: 'note',
  description: '',
  dealId: undefined,
  contactId: undefined,
};

const typeIcons = {
  note: FileText,
  call: Phone,
  email: Mail,
  meeting: Calendar,
};

const typeColors = {
  note: 'text-gray-400 bg-gray-800',
  call: 'text-blue-400 bg-blue-500/10',
  email: 'text-purple-400 bg-purple-500/10',
  meeting: 'text-teal-400 bg-teal-500/10',
};

const typeLabels = {
  note: 'Nota',
  call: 'Llamada',
  email: 'Email',
  meeting: 'Reunión',
};

export default function ActivitiesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateActivityDto>(emptyForm);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: activitiesApi.getAll,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsApi.getAll,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: activitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: activitiesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Actividades</h1>
          <p className="text-gray-400 mt-1 text-sm">{activities.length} actividades registradas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          Nueva actividad
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">Nueva actividad</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm text-gray-300 mb-1">Tipo *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as CreateActivityDto['type'] })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 text-sm"
                >
                  <option value="note">Nota</option>
                  <option value="call">Llamada</option>
                  <option value="email">Email</option>
                  <option value="meeting">Reunión</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Descripción *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  placeholder="Detalle de la actividad..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Deal relacionado</label>
                <select
                  value={form.dealId ?? ''}
                  onChange={(e) => setForm({ ...form, dealId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 text-sm"
                >
                  <option value="">Sin deal</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Contacto relacionado</label>
                <select
                  value={form.contactId ?? ''}
                  onChange={(e) => setForm({ ...form, contactId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 text-sm"
                >
                  <option value="">Sin contacto</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-teal-500 hover:bg-teal-400 text-white py-2 rounded-lg text-sm font-medium transition">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activities list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Cargando...</div>
        ) : activities.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <Users size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No hay actividades aún</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = typeIcons[activity.type];
            const colorClass = typeColors[activity.type];
            return (
              <div key={activity.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex gap-4">

                {/* Icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon size={16} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm font-medium">
                      {typeLabels[activity.type]}
                    </span>
                    {activity.deal && (
                      <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                        {activity.deal.title}
                      </span>
                    )}
                    {activity.contact && (
                      <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                        {activity.contact.firstName} {activity.contact.lastName}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{activity.description}</p>
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(activity.createdAt).toLocaleDateString('es-MX', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteMutation.mutate(activity.id)}
                  className="text-gray-600 hover:text-red-400 transition shrink-0"
                >
                  <X size={16} />
                </button>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}