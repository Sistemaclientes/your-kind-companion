import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Loader2,
  Tag,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface Category {
  id: string;
  nome: string;
  cor?: string;
  icon?: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryChange: () => void;
}

export function CategoryModal({ isOpen, onClose, onCategoryChange }: CategoryModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/categorias');
      const categoriesArray = Array.isArray(data) ? data : [];
      setCategories(categoriesArray);
    } catch (err: any) {
      toast.error('Erro ao carregar categorias: ' + err.message);
      setCategories([]); // Ensure it's an array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSaving(true);
    try {
      await api.post('/categorias', { nome: newCategoryName.trim() });
      setNewCategoryName('');
      fetchCategories();
      onCategoryChange();
      toast.success('Categoria criada com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao criar categoria: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editCategoryName.trim()) return;

    setIsSaving(true);
    try {
      await api.put(`/categorias/${id}`, { nome: editCategoryName.trim() });
      setEditingId(null);
      fetchCategories();
      onCategoryChange();
      toast.success('Categoria atualizada com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao atualizar categoria: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"? Esta ação não pode ser desfeita e pode afetar provas existentes.`)) {
      return;
    }

    try {
      await api.delete(`/categorias/${id}`);
      fetchCategories();
      onCategoryChange();
      toast.success('Categoria excluída com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao excluir categoria: ' + err.message);
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditCategoryName(category.nome);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Gerenciar Categorias</h3>
                  <p className="text-sm text-on-surface-variant font-medium">Adicione, edite ou remova categorias</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* New Category Form */}
              <form onSubmit={handleCreate} className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Nova Categoria</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Matemática, Português..."
                    className="input-saas flex-1 h-12"
                    disabled={isSaving}
                  />
                  <button
                    type="submit"
                    disabled={!newCategoryName.trim() || isSaving}
                    className="bg-primary text-primary-foreground px-4 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 h-12"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    <span>Adicionar</span>
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Categorias Existentes</label>
                  <span className="text-[10px] font-bold text-on-surface-variant/60">{categories.length} total</span>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/40">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-sm font-medium">Carregando categorias...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-outline rounded-2xl">
                    <AlertCircle className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-3" />
                    <p className="text-on-surface-variant font-medium">Nenhuma categoria cadastrada.</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {categories.map((category) => (
                      <div 
                        key={category.id}
                        className={cn(
                          "group flex items-center justify-between p-3 rounded-2xl border transition-all",
                          editingId === category.id 
                            ? "bg-primary/5 border-primary ring-1 ring-primary" 
                            : "bg-surface-container-low border-outline/30 hover:border-primary/30"
                        )}
                      >
                        <div className="flex-1 mr-4">
                          {editingId === category.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={editCategoryName}
                              onChange={(e) => setEditCategoryName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate(category.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface w-full h-8"
                            />
                          ) : (
                            <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                              {category.nome}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                          {editingId === category.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(category.id)}
                                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                title="Salvar"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 bg-surface-container text-on-surface-variant rounded-lg hover:bg-surface-container-high transition-colors"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(category)}
                                className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(category.id, category.nome)}
                                className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-surface-container-low border-t border-outline flex justify-end">
              <button
                onClick={onClose}
                className="btn-saas px-8 bg-on-surface text-surface hover:bg-on-surface/90"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
