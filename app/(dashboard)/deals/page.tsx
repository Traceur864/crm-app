'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi, CreateDealDto, DealStage, Deal } from '@/lib/api/deals';
import { contactsApi } from '@/lib/api/contacts';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const STAGES: { key: DealStage; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: 'border-gray-600' },
  { key: 'contacted', label: 'Contactado', color: 'border-blue-500' },
  { key: 'proposal', label: 'Propuesta', color: 'border-yellow-500' },
  { key: 'negotiation', label: 'Negociación', color: 'border-orange-500' },
  { key: 'won', label: 'Ganado', color: 'border-teal-500' },
  { key: 'lost', label: 'Perdido', color: 'border-red-500' },
];

const emptyForm: CreateDealDto = {
  title: '', value: 0, stage: 'lead', notes: '', contactId: undefined,
};

export default function DealsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [dragging, setDragging] = useState<Deal | null>(null);
  const [form, setForm] = useState<CreateDealDto>(emptyForm);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsApi.getAll,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: dealsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowForm(false);
      setForm(emptyForm);
      toast.success('Deal creado correctamente');
    },
    onError: () => toast.error('Error al crear el deal'),
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: DealStage }) =>
      dealsApi.updateStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Etapa del deal actualizada correctamente');
    },
    onError: () => toast.error('Error al actualizar la etapa del deal'),
  });

  const deleteMutation = useMutation({
    mutationFn: dealsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal eliminado correctamente');
    },
    onError: () => toast.error('Error al eliminar el deal'),
  });

  const handleDrop = (stage: DealStage) => {
    if (dragging && dragging.stage !== stage) {
      stageMutation.mutate({ id: dragging.id, stage });
    }
    setDragging(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const dealsByStage = (stage: DealStage) => deals.filter((d) => d.stage === stage);

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline de Deals</h1>
          <p className="text-gray-400 mt-1 text-sm">{deals.length} deals en total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          Nuevo deal
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">Nuevo deal</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Título *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Propuesta de software"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Valor ($)</label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Etapa</label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value as DealStage })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 text-sm"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Contacto</label>
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

              <div>
                <label className="block text-sm text-gray-300 mb-1">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Detalles del deal..."
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

      {/* Kanban */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Cargando...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(({ key, label, color }) => (
            <div
              key={key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(key)}
              className="shrink-0 w-64"
            >
              {/* Column header */}
              <div className={`border-t-2 ${color} bg-gray-900 rounded-xl p-4 mb-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-semibold">{label}</span>
                  <span className="text-gray-400 text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                    {dealsByStage(key).length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-24">
                {dealsByStage(key).map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => setDragging(deal)}
                    onDragEnd={() => setDragging(null)}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-gray-600 transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-white text-sm font-medium leading-snug">
                        <Link href={`/deals/${deal.id}`} className="text-white text-sm font-medium leading-snug hover:text-teal-400 transition">
                          {deal.title}
                        </Link>
                      </p>
                      <button
                        onClick={() => deleteMutation.mutate(deal.id)}
                        className="text-gray-600 hover:text-red-400 transition shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {deal.contact && (
                      <p className="text-gray-500 text-xs mb-2">
                        {deal.contact.firstName} {deal.contact.lastName}
                      </p>
                    )}
                    <p className="text-teal-400 text-sm font-semibold">
                      ${Number(deal.value).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}