'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi, CreateContactDto } from '@/lib/api/contacts';
import { companiesApi } from '@/lib/api/companies';
import { Users, Plus, Pencil, Trash2, X } from 'lucide-react';

const emptyForm: CreateContactDto = {
  firstName: '', lastName: '', email: '', phone: '', position: '', companyId: undefined,
};

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<CreateContactDto>(emptyForm);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: contactsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateContactDto> }) =>
      contactsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contactsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (contact: typeof contacts[0]) => {
    setForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone ?? '',
      position: contact.position ?? '',
      companyId: contact.companyId ?? undefined,
    });
    setEditing(contact.id);
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

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Contactos</h1>
          <p className="text-gray-400 mt-1 text-sm">{contacts.length} contactos registrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          Nuevo contacto
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">{editing ? 'Editar contacto' : 'Nuevo contacto'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Nombre *</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                    placeholder="Juan"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Apellido *</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                    placeholder="García"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
                  />
                </div>
              </div>

              {[
                { key: 'email', label: 'Email *', placeholder: 'juan@email.com', required: true },
                { key: 'phone', label: 'Teléfono', placeholder: '3312345678', required: false },
                { key: 'position', label: 'Cargo', placeholder: 'Manager', required: false },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-300 mb-1">{label}</label>
                  <input
                    value={form[key as keyof CreateContactDto] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={required}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-300 mb-1">Empresa</label>
                <select
                  value={form.companyId ?? ''}
                  onChange={(e) => setForm({ ...form, companyId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 text-sm"
                >
                  <option value="">Sin empresa</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

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

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No hay contactos aún</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-6 py-3">Nombre</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-6 py-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-6 py-3">Cargo</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-6 py-3">Empresa</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-6 py-3">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4 text-white text-sm font-medium">
                    {contact.firstName} {contact.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{contact.email}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{contact.position ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{contact.company?.name ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      contact.status === 'active'
                        ? 'bg-teal-500/10 text-teal-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {contact.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => handleEdit(contact)} className="text-gray-400 hover:text-teal-400 transition">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(contact.id)} className="text-gray-400 hover:text-red-400 transition">
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