import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Edit2, Trash2, Plus, Wind } from 'lucide-react'
import { deleteItem } from '../../services/api'
import AddItemForm from '../items/AddItemForm'

function ItemRow({ item, projectId, onEdit, index }) {
  const qc = useQueryClient()
  const del = useMutation({
    mutationFn: () => deleteItem(projectId, item.id),
    onSuccess: () => {
      toast.success(`Item "${item.code}" deleted`)
      qc.invalidateQueries(['project', String(projectId)])
      qc.invalidateQueries(['boq', String(projectId)])
    },
    onError: e => toast.error(e.message),
  })

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      layout
    >
      <td>
        <span className="font-mono text-sm font-semibold text-indigo-300">{item.code}</span>
      </td>
      <td>
        <p className="text-sm text-white/80">{item.typology_name}</p>
      </td>
      <td>
        <span className="font-mono text-xs text-white/60">
          {item.width} × {item.height}
        </span>
      </td>
      <td className="text-white/60 text-xs">{item.glass_type_name}</td>
      <td className="text-white/60 text-xs">{item.finish_name}</td>
      <td className="text-center">
        <span className={`text-xs font-medium ${item.has_mesh ? 'text-emerald-400' : 'text-white/25'}`}>
          {item.has_mesh ? '✓' : '—'}
        </span>
      </td>
      <td className="text-center text-white/70 font-semibold">{item.quantity}</td>
      <td className="text-right text-xs text-white/50">{item.glass_area_sqft?.toFixed(2)} ft²</td>
      <td>
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-white/30 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => del.mutate()}
            disabled={del.isPending}
            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </motion.tr>
  )
}

export default function ItemsTable({ items = [], projectId }) {
  const [addOpen,  setAddOpen]  = useState(false)
  const [editItem, setEditItem] = useState(null)

  const handleEdit = (item) => {
    setEditItem(item)
    setAddOpen(true)
  }

  const handleClose = () => {
    setAddOpen(false)
    setEditItem(null)
  }

  return (
    <>
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <h3 className="font-semibold text-white text-sm">Windows & Doors</h3>
            <p className="text-xs text-white/40 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary text-xs py-2 px-4" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add Item
          </button>
        </div>

        {/* Table */}
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <Wind size={36} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/40 text-sm">No items yet.</p>
            <button className="btn-primary mt-4 mx-auto" onClick={() => setAddOpen(true)}>
              <Plus size={15} /> Add first item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Typology</th>
                  <th>W × H (mm)</th>
                  <th>Glass</th>
                  <th>Finish</th>
                  <th className="text-center">Mesh</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Glass Area</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((item, i) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      projectId={projectId}
                      onEdit={handleEdit}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <AddItemForm
        projectId={projectId}
        open={addOpen}
        onClose={handleClose}
        editItem={editItem}
      />
    </>
  )
}
