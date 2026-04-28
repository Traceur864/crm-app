'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi, CreateCompanyDto } from '@/lib/api/companies';
import { Building2, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<CreateCompanyDto>({
    name: '', industry: '', website: '', phone: '', address: '',
  });
  const [search, setSearch] = useState('');

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: companiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa creada correctamente');
      resetForm();
    },
    onError: () => toast.error('Error al crear la empresa'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateCompanyDto> }) =>
      companiesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa actualizada correctamente');
      resetForm();
    },
    onError: () => toast.error('Error al actualizar la empresa'),
  });

const deleteMutation = useMutation({
  mutationFn: companiesApi.remove,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    toast.success('Empresa eliminada');
  },
  onError: () => toast.error('Error al eliminar la empresa'),
});

  const resetForm = () => {
    setForm({ name: '', industry: '', website: '', phone: '', address: '' });
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (company: typeof companies[0]) => {
    setForm({
      name: company.name,
      industry: company.industry ?? '',
      website: company.website ?? '',
      phone: company.phone ?? '',
      address: company.address ?? '',
    });
    setEditing(company.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing, dto: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = companies.filter((c) =>
    `${c.name} ${c.industry ?? ''} ${c.address ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Empresas</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {filtered.length} de {companies.length} empresas registradas
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          Nueva empresa
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">{editing ? 'Editar empresa' : 'Nueva empresa'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'name', label: 'Nombre *', placeholder: 'Empresa S.A.' },
                { key: 'industry', label: 'Industria', placeholder: 'Tecnología' },
                { key: 'website', label: 'Sitio web', placeholder: 'https://empresa.com' },
                { key: 'phone', label: 'Teléfono', placeholder: '3312345678' },
                { key: 'address', label: 'Dirección', placeholder: 'Guadalajara, Jalisco' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-300 mb-1">{label}</label>
                  <input
                    value={form[key as keyof CreateCompanyDto]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={key === 'name'}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-teal-500 hover:bg-teal-400 text-white py-2 rounded-lg text-sm font-medium transition">
                  {editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, industria o dirección..."
          className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : companies.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No hay empresas aún</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-6 py-3">Nombre</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-6 py-3">Industria</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-6 py-3">Teléfono</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-6 py-3">Sitio web</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => (
                <tr key={company.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4 text-white text-sm font-medium">{company.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{company.industry ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{company.phone ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{company.website ?? '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => handleEdit(company)} className="text-gray-400 hover:text-teal-400 transition">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(company.id)} className="text-gray-400 hover:text-red-400 transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}