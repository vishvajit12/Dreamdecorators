import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { X, Plus, Save } from 'lucide-react'
import { fetchTypologies, fetchGlassTypes, fetchFinishTypes, createItem, updateItem } from '../../services/api'

const blank = {
  code: '', width: '', height: '',
  typology: '', glass_type: '', finish: '',
  has_mesh: false, quantity: 1, notes: '',
}

export default function AddItemForm({ projectId, open, onClose, editItem = null }) {
  const qc      = useQueryClient()
  const isEdit  = !!editItem
  const [form, setForm] = useState(editItem ? {
    code: editItem.code, width: editItem.width, height: editItem.height,
    typology: editItem.typology, glass_type: editItem.glass_type,
    finish: editItem.finish, has_mesh: editItem.has_mesh,
    quantity: editItem.quantity, notes: editItem.notes || '',
  } : { ...blank })

  const { data: typologies  = [] } = useQuery({ queryKey: ['typologies'],  queryFn: fetchTypologies  })
  const { data: glassTypes  = [] } = useQuery({ queryKey: ['glassTypes'],  queryFn: fetchGlassTypes  })
  const { data: finishTypes = [] } = useQuery({ queryKey: ['finishTypes'], queryFn: fetchFinishTypes })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? updateItem(projectId, editItem.id, data)
      : createItem(projectId, data),
    onSuccess: () => {
      toast.success(isEdit ? 'Item updated!' : 'Item added!')
      qc.invalidateQueries(['project', String(projectId)])
      qc.invalidateQueries(['boq', String(projectId)])
      setForm({ ...blank })
      onClose()
    },
    onError: (e) => toast.error(e.message),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.typology || !form.glass_type || !form.finish) {
      toast.error('Please select typology, glass type and finish.')
      return
    }
    mutation.mutate({
      ...form,
      width: parseFloat(form.width),
      height: parseFloat(form.height),
      quantity: parseInt(form.quantity),
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(14,14,35,0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <div>
                <h2 className="font-bold text-white">{isEdit ? 'Edit Item' : 'Add Window / Door'}</h2>
                <p className="text-xs text-white/40 mt-0.5">Enter dimensions and specifications</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Code + Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Item Code <span className="text-red-400">*</span></label>
                  <input className="glass-input" placeholder="e.g. W1, D2" required
                    value={form.code} onChange={e => set('code', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Quantity</label>
                  <input className="glass-input" type="number" min="1" required
                    value={form.quantity} onChange={e => set('quantity', e.target.value)} />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Width (mm) <span className="text-red-400">*</span></label>
                  <input className="glass-input" type="number" min="1" step="1" placeholder="e.g. 1200" required
                    value={form.width} onChange={e => set('width', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Height (mm) <span className="text-red-400">*</span></label>
                  <input className="glass-input" type="number" min="1" step="1" placeholder="e.g. 1500" required
                    value={form.height} onChange={e => set('height', e.target.value)} />
                </div>
              </div>

              {/* Typology */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Typology <span className="text-red-400">*</span></label>
                <select className="glass-select" required
                  value={form.typology} onChange={e => set('typology', e.target.value)}>
                  <option value="">— Select typology —</option>
                  {typologies.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}
                </select>
              </div>

              {/* Glass + Finish */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Glass Type <span className="text-red-400">*</span></label>
                  <select className="glass-select" required
                    value={form.glass_type} onChange={e => set('glass_type', e.target.value)}>
                    <option value="">— Select glass —</option>
                    {glassTypes.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Finish <span className="text-red-400">*</span></label>
                  <select className="glass-select" required
                    value={form.finish} onChange={e => set('finish', e.target.value)}>
                    <option value="">— Select finish —</option>
                    {finishTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Mesh + Notes */}
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <input
                  id="has_mesh"
                  type="checkbox"
                  className="w-4 h-4 rounded accent-indigo-500"
                  checked={form.has_mesh}
                  onChange={e => set('has_mesh', e.target.checked)}
                />
                <label htmlFor="has_mesh" className="text-sm text-white/70 cursor-pointer select-none">
                  Include flyscreen / mesh
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Notes</label>
                <input className="glass-input" placeholder="Optional description…"
                  value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary flex-1 justify-center" disabled={mutation.isPending}>
                  <Save size={15} />
                  {mutation.isPending ? 'Saving…' : isEdit ? 'Update Item' : 'Add Item'}
                </button>
                <button type="button" className="btn-secondary px-4" onClick={onClose}>
                  <X size={15} />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
