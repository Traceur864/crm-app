'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '@/lib/api/deals';
import { activitiesApi, CreateActivityDto } from '@/lib/api/activities';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Phone, Mail, FileText, Calendar, X, Plus } from 'lucide-react';

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

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  contacted: 'Contactado',
  proposal: 'Propuesta',
  negotiation: 'Negociación',
  won: 'Ganado',
  lost: 'Perdido',
};

const stageColors: Record<string, string> = {
  lead: 'text-gray-400 bg-gray-800',
  contacted: 'text-blue-400 bg-blue-500/10',
  proposal: 'text-yellow-400 bg-yellow-500/10',
  negotiation: 'text-orange-400 bg-orange-500/10',
  won: 'text-teal-400 bg-teal-500/10',
  lost: 'text-red-400 bg-red-500/10',
};

const emptyForm: CreateActivityDto = {
  type: 'note',
  description: '',
};

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateActivityDto>(emptyForm);

  const { data: deal, isLoading: loadingDeal } = useQuery({
    queryKey: ['deals', id],
    queryFn: () => dealsApi.getOne(Number(id)),
  });

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['activities', 'deal', id],
    queryFn: () => activitiesApi.getByDeal(Number(id)),
  });

  const createMutation = useMutation({
    mutationFn: activitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'deal', id] });
      toast.success('Actividad creada');
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error('Error al crear la actividad'),
  });

  const deleteMutation = useMutation({
    mutationFn: activitiesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'deal', id] });
      toast.success('Actividad eliminada');
    },
    onError: () => toast.error('Error al eliminar la actividad'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, dealId: Number(id) });
  };

  if (loadingDeal) {
    return <div className="p-8 text-gray-500">Cargando...</div>;
  }

  if (!deal) {
    return <div className="p-8 text-gray-500">Deal no encontrado</div>;
  }

  return (
    <div className="p-8 max-w-4xl">

      {/* Back button */}
      <button
        onClick={() => router.push('/deals')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition"
      >
        <ArrowLeft size={16} />
        Volver a Deals
      </button>

      {/* Deal header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{deal.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${stageColors[deal.stage]}`}>
                {stageLabels[deal.stage]}
              </span>
              {deal.contact && (
                <span className="text-gray-400 text-sm">
                  {deal.contact.firstName} {deal.contact.lastName}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-teal-400">
              ${Number(deal.value).toLocaleString()}
            </p>
            {deal.expectedCloseDate && (
              <p className="text-gray-500 text-xs mt-1">
                Cierre: {new Date(deal.expectedCloseDate).toLocaleDateString('es-MX')}
              </p>
            )}
          </div>
        </div>

        {deal.notes && (
          <p className="text-gray-400 text-sm mt-4 pt-4 border-t border-gray-800">
            {deal.notes}
          </p>
        )}
      </div>

      {/* Activities */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">
          Actividades <span className="text-gray-500 font-normal text-sm">({activities.length})</span>
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
        >
          <Plus size={14} />
          Agregar
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
        {loadingActivities ? (
          <div className="text-gray-500 text-sm">Cargando actividades...</div>
        ) : activities.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-sm">No hay actividades para este deal</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = typeIcons[activity.type];
            const colorClass = typeColors[activity.type];
            return (
              <div key={activity.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium mb-1">{typeLabels[activity.type]}</p>
                  <p className="text-gray-400 text-sm">{activity.description}</p>
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(activity.createdAt).toLocaleDateString('es-MX', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
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