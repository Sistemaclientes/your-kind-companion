import React, { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { 
  Settings as SettingsIcon, 
  Eye, 
  Palette, 
  Shield, 
  UploadCloud, 
  Check,
  Save,
  Info,
  Loader2,
  BarChart3,
  User,
  Plus,
  Trash2,
  Mail,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

export function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({ nome: '', email: '', senha: '' });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('institution_logo');
    if (saved) setLogoPreview(saved);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 2MB.');
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Apenas PNG ou JPG são permitidos.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      localStorage.setItem('institution_logo', result);
      window.dispatchEvent(new Event('logo-updated'));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    localStorage.removeItem('institution_logo');
    window.dispatchEvent(new Event('logo-updated'));
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  React.useEffect(() => {
    const userJson = localStorage.getItem('saas_user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
      if (user.is_master) {
        fetchAdmins();
      }
    }
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await api.get('/admins');
      setAdmins(data);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    try {
      await api.post('/admins', newAdmin);
      setNewAdmin({ nome: '', email: '', senha: '' });
      fetchAdmins();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao criar administrador');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este administrador?')) return;
    try {
      await api.delete(`/admins/${id}`);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir administrador');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1.5 align-middle">
      <Info className="w-3.5 h-3.5 text-on-surface-variant/40 cursor-help hover:text-primary transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-on-surface text-surface text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-on-surface" />
      </div>
    </div>
  );

  return (
    <>
      <TopBar title="Painel Administrativo" subtitle="Configurações Gerais" />
      <main className="pt-20 px-6 pb-20 max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-3xl font-bold text-text-primary mb-2 font-headline tracking-tight">Configurações Gerais</h3>
            <p className="text-text-secondary font-medium">Gerencie os parâmetros globais das suas avaliações e a experiência dos alunos.</p>
          </div>
          
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 border border-emerald-400/20"
              >
                <div className="bg-white/20 p-1 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold">Configurações salvas com sucesso!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <form className="grid grid-cols-1 lg:grid-cols-12 gap-8" onSubmit={(e) => e.preventDefault()}>
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card-saas p-8">
              <div className="flex items-center gap-3 mb-6 text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Regras Acadêmicas</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center text-sm font-semibold text-text-primary mb-2">
                    Nota mínima para aprovação
                    <Tooltip text="Define a pontuação necessária para que o aluno seja considerado aprovado. Notas abaixo deste valor serão marcadas como reprovadas." />
                  </label>
                  <div className="relative">
                    <input 
                      className="input-saas pr-16 font-bold text-primary text-lg" 
                      defaultValue="7.0"
                      max="10" 
                      min="0" 
                      step="0.5" 
                      type="number"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm bg-surface-container-high px-2 py-1 rounded">/ 10</div>
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">Define o limiar para o status de 'Aprovado' nos relatórios.</p>
                </div>

                <div className="pt-2">
                  <label className="flex items-center text-sm font-semibold text-text-primary mb-2">
                    Mensagem de Resultado Personalizada
                    <Tooltip text="Esta mensagem será exibida ao aluno na tela de resultados após a conclusão da prova." />
                  </label>
                  <textarea 
                    className="input-saas min-h-[120px] py-3 resize-none" 
                    defaultValue="Parabéns pelo seu desempenho na avaliação!"
                    rows={4}
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-[11px] text-text-secondary italic font-medium">Use {'{nome_aluno}'} para inserir o nome automaticamente.</p>
                    <p className="text-[11px] text-text-secondary font-medium">0 / 500 caracteres</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-saas p-8">
              <div className="flex items-center gap-3 mb-6 text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Experiência do Aluno</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Exibir resultado imediatamente', sub: 'O aluno verá sua nota logo após finalizar a prova.', checked: true, tooltip: "Se desativado, o aluno só verá o resultado quando você liberar manualmente." },
                  { label: 'Permitir refazer avaliação', sub: 'Habilita o botão de tentativa adicional para alunos reprovados.', checked: false, tooltip: "Define se o aluno pode tentar a prova novamente caso não atinja a nota mínima." },
                  { label: 'Liberar revisão de questões', sub: 'Permite que o aluno veja quais questões errou e o gabarito.', checked: true, tooltip: "Exibe o detalhamento de acertos e erros após a conclusão." },
                ].map((item, i) => (
                  <label key={i} className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-low cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all group border border-transparent hover:border-primary/20">
                    <div className="pt-1">
                      <input 
                        defaultChecked={item.checked}
                        className="rounded-md text-primary focus:ring-primary/20 border-outline bg-surface-container w-5 h-5 cursor-pointer transition-all" 
                        type="checkbox"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="block text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{item.label}</span>
                        <Tooltip text={item.tooltip} />
                      </div>
                      <span className="block text-xs text-text-secondary mt-1 font-medium leading-relaxed">{item.sub}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card-saas p-8">
              <div className="flex items-center gap-3 mb-6 text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Identidade Visual</span>
              </div>
              
              <div className="space-y-6">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <div 
                  className="aspect-video w-full rounded-xl bg-surface-container-low overflow-hidden relative group border-2 border-dashed border-outline hover:border-primary/50 transition-all flex items-center justify-center cursor-pointer"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} className="absolute inset-0 w-full h-full object-contain p-4" alt="Logo" />
                  ) : (
                    <img 
                      className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" 
                      src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="relative z-10 text-center p-4">
                    <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-outline group-hover:scale-110 transition-transform">
                      <UploadCloud className="text-primary w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-text-primary">{logoPreview ? 'Alterar Logo' : 'Logo da Instituição'}</p>
                    <p className="text-[11px] text-text-secondary mt-1 font-medium">PNG ou JPG (Máx. 2MB)</p>
                  </div>
                </div>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex items-center gap-2 text-xs font-bold text-error hover:text-error/80 transition-colors mt-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover logo
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline">
                    <label className="flex items-center text-[11px] font-bold text-text-secondary uppercase mb-3 tracking-wider">
                      Cor Principal
                      <Tooltip text="Cor utilizada em botões, ícones e elementos de destaque em toda a plataforma." />
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary shadow-sm ring-2 ring-surface-container"></div>
                      <span className="text-xs font-mono font-bold text-text-primary">#0F8B8D</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline">
                    <label className="flex items-center text-[11px] font-bold text-text-secondary uppercase mb-3 tracking-wider">
                      Cor de Sucesso
                      <Tooltip text="Cor utilizada para indicar aprovações e ações concluídas com êxito." />
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 shadow-sm ring-2 ring-surface-container"></div>
                      <span className="text-xs font-mono font-bold text-text-primary">#10B981</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-saas p-8">
              <div className="flex items-center gap-3 mb-6 text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Marketing e Rastreamento</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center text-sm font-semibold text-text-primary mb-2">
                    Facebook Pixel ID
                    <Tooltip text="O ID do seu Pixel do Facebook para rastreamento de eventos e conversões." />
                  </label>
                  <input 
                    className="input-saas w-full" 
                    placeholder="Ex: 123456789012345"
                    type="text"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-text-primary mb-2">
                    Facebook API Token (Conversões)
                    <Tooltip text="Token de acesso para a API de Conversões do Facebook (CAPI) para rastreamento server-side." />
                  </label>
                  <input 
                    className="input-saas w-full" 
                    placeholder="EAAB..."
                    type="password"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-text-primary mb-2">
                    Google Tag ID (GTM / GA4)
                    <Tooltip text="O ID da sua Tag do Google (G-XXXXXXXXXX) ou Gerenciador de Tags (GTM-XXXXXXX)." />
                  </label>
                  <input 
                    className="input-saas w-full" 
                    placeholder="Ex: G-XXXXXXXXXX"
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* Administrator Management (Master Only) */}
            {currentUser?.is_master && (
              <div className="card-saas p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-primary">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold uppercase tracking-wider block">Gestão de Administradores</span>
                      <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">Apenas Master</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* New Admin Form */}
                  <form onSubmit={handleCreateAdmin} className="p-6 bg-surface-container-low rounded-2xl border border-outline space-y-4">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Adicionar Novo Admin</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                        <input 
                          className="w-full pl-11 pr-4 py-3 bg-surface border border-outline rounded-xl text-sm font-medium focus:border-primary transition-all outline-none" 
                          placeholder="Nome"
                          value={newAdmin.nome}
                          onChange={e => setNewAdmin({...newAdmin, nome: e.target.value})}
                          required
                        />
                      </div>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                        <input 
                          className="w-full pl-11 pr-4 py-3 bg-surface border border-outline rounded-xl text-sm font-medium focus:border-primary transition-all outline-none" 
                          placeholder="E-mail"
                          type="email"
                          value={newAdmin.email}
                          onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                        <input 
                          className="w-full pl-11 pr-4 py-3 bg-surface border border-outline rounded-xl text-sm font-medium focus:border-primary transition-all outline-none" 
                          placeholder="Senha"
                          type="password"
                          value={newAdmin.senha}
                          onChange={e => setNewAdmin({...newAdmin, senha: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={isCreatingAdmin}
                      className="btn-primary w-full py-3 text-xs uppercase tracking-widest"
                    >
                      {isCreatingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {isCreatingAdmin ? 'Criando...' : 'Adicionar Administrador'}
                    </button>
                  </form>

                  {/* Admin List */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Administradores Ativos</p>
                    <div className="grid grid-cols-1 gap-3">
                      {admins.map((admin: any) => (
                        <div key={admin.id} className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline group hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-on-surface">{admin.nome}</p>
                                {admin.is_master && (
                                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter rounded-full border border-primary/20">Master</span>
                                )}
                              </div>
                              <p className="text-xs text-on-surface-variant font-medium">{admin.email}</p>
                            </div>
                          </div>
                          {!admin.is_master && (
                            <button 
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="p-2.5 text-on-surface-variant/30 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Action Buttons */}
          <div className="lg:col-span-12 flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-8 border-t border-outline">
            <button className="px-8 py-3.5 rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-surface-container-high transition-all">
              Descartar Alterações
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary min-w-[240px] flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span className="text-base">
                {isSaving ? 'Salvando alterações...' : 'Salvar Configurações'}
              </span>
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
