import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  Lock,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { useVisualSettings } from '../components/VisualSettingsProvider';
import { useAuthStore } from '../lib/authStore';

export function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({ nome: '', email: '', senha: '' });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const { settings, updateSettings, isLoading: settingsLoading } = useVisualSettings();
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<string>('academicas');
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB.');
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.error('Apenas PNG ou JPG são permitidos.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      try {
        await updateSettings({ logo_url: result });
        toast.success('Logo atualizada!');
        window.dispatchEvent(new Event('logo-updated'));
      } catch (err) {
        toast.error('Erro ao salvar logo no banco de dados');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    try {
      await updateSettings({ logo_url: '' });
      toast.success('Logo removida!');
      window.dispatchEvent(new Event('logo-updated'));
      if (logoInputRef.current) logoInputRef.current.value = '';
    } catch (err) {
      toast.error('Erro ao remover logo');
    }
  };

  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      fetchAdmins();
    }
  }, [user]);

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
    if (!newAdmin.email.trim() || !newAdmin.senha || newAdmin.senha.length < 6) {
      toast.error('Preencha todos os campos. Senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setIsCreatingAdmin(true);
    try {
      const result = await api.post('/admins', newAdmin);
      toast.success(`Administrador ${result.nome || newAdmin.email} criado com sucesso!`);
      setNewAdmin({ nome: '', email: '', senha: '' });
      fetchAdmins();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar administrador');
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
      toast.error(err.message || 'Erro ao excluir administrador');
    }
  };

  const handleSendResetLink = async (email: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      if (error) throw error;
      toast.success(`Link de redefinição enviado para ${email}`);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar link de redefinição');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwordData.new.length < 6) {
      setPasswordMsg({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setPasswordMsg({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }
    setIsChangingPassword(true);
    try {
      // First verify current password by re-authenticating
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.email) throw new Error('Usuário não encontrado');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authUser.email,
        password: passwordData.current,
      });
      if (signInError) throw new Error('Senha atual incorreta');

      const { error: updateError } = await supabase.auth.updateUser({ password: passwordData.new });
      if (updateError) throw new Error(updateError.message);

      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Erro ao alterar senha' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
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

  const sections = [
    { id: 'academicas', label: 'Acadêmicas', icon: SettingsIcon },
    { id: 'visual', label: 'Visual', icon: Palette },
    { id: 'seguranca', label: 'Segurança', icon: Lock },
    { id: 'marketing', label: 'Marketing', icon: BarChart3 },
    { id: 'admins', label: 'Admins', icon: Shield },
  ];

  return (
    <>
      <TopBar title="Painel Administrativo" subtitle="Configurações Gerais" />
      <main className="pt-24 px-4 sm:px-6 pb-20 max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-on-surface mb-1 font-headline tracking-tight">Configurações</h3>
            <p className="text-on-surface-variant text-sm">Gerencie os parâmetros globais das suas avaliações.</p>
          </div>
          
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20 shadow-sm"
              >
                <div className="bg-primary/20 p-1 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold">Configurações salvas!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          <div className="flex items-center gap-2 p-1 bg-surface-container-low/50 rounded-2xl border border-outline/30 backdrop-blur-sm">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 h-11",
                  activeSection === section.id
                    ? "bg-surface-container-high text-primary border border-primary/20 shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 border border-transparent"
                )}
              >
                <section.icon className={cn("w-4.5 h-4.5", activeSection === section.id ? "text-primary" : "text-on-surface-variant/70")} />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <AnimatePresence mode="wait">
            {/* REGRAS ACADÊMICAS + EXPERIÊNCIA */}
            {activeSection === 'academicas' && (
              <motion.div
                key="academicas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="card-saas p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 text-primary">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <SettingsIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Regras Acadêmicas</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-on-surface mb-2">
                        Nota mínima para aprovação
                        <Tooltip text="Define a pontuação necessária para que o aluno seja considerado aprovado." />
                      </label>
                      <div className="relative">
                        <input 
                          className="input-saas pr-16 font-bold text-primary text-lg w-full" 
                          defaultValue="7.0"
                          max="10" 
                          min="0" 
                          step="0.5" 
                          type="number"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm bg-surface-container-high px-2 py-1 rounded">/ 10</div>
                      </div>
                      <p className="mt-2 text-xs text-on-surface-variant">Define o limiar para o status de 'Aprovado' nos relatórios.</p>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-on-surface mb-2">
                        Mensagem de Resultado
                        <Tooltip text="Exibida ao aluno na tela de resultados após a conclusão da prova." />
                      </label>
                      <textarea 
                        className="input-saas min-h-[100px] py-3 resize-none w-full" 
                        defaultValue="Parabéns pelo seu desempenho na avaliação!"
                        rows={3}
                      />
                      <div className="flex justify-between mt-2">
                        <p className="text-[11px] text-on-surface-variant italic font-medium">Use {'{nome_aluno}'} para nome automático.</p>
                        <p className="text-[11px] text-on-surface-variant font-medium">0 / 500</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-saas p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 text-primary">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Eye className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Experiência do Aluno</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'Exibir resultado imediatamente', sub: 'Nota visível logo após finalizar.', checked: true, tooltip: "Se desativado, o aluno só verá o resultado quando você liberar manualmente." },
                      { label: 'Permitir refazer avaliação', sub: 'Tentativa adicional para reprovados.', checked: false, tooltip: "Define se o aluno pode tentar a prova novamente." },
                      { label: 'Liberar revisão de questões', sub: 'Aluno vê acertos e gabarito.', checked: true, tooltip: "Exibe o detalhamento de acertos e erros após a conclusão." },
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all group border border-transparent hover:border-primary/20">
                        <div className="pt-0.5">
                          <input 
                            defaultChecked={item.checked}
                            className="rounded-md text-primary focus:ring-primary/20 border-outline bg-surface-container w-4 h-4 cursor-pointer" 
                            type="checkbox"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{item.label}</span>
                            <Tooltip text={item.tooltip} />
                          </div>
                          <span className="text-xs text-on-surface-variant mt-0.5 block font-medium">{item.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* IDENTIDADE VISUAL */}
            {activeSection === 'visual' && (
              <motion.div
                key="visual"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card-saas p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 text-primary">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Palette className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Identidade Visual</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Logo Upload */}
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-on-surface">Logo da Instituição</p>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <div 
                        className="aspect-video w-full max-w-sm rounded-xl bg-surface-container-low overflow-hidden relative group border-2 border-dashed border-outline hover:border-primary/50 transition-all flex items-center justify-center cursor-pointer"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        {settings.logo_url ? (
                          <>
                            <img src={settings.logo_url} className="absolute inset-0 w-full h-full object-contain p-4" alt="Logo" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                              <div className="text-center">
                                <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-outline">
                                  <UploadCloud className="text-primary w-5 h-5" />
                                </div>
                                <p className="text-xs font-bold text-white">Alterar Logo</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <img 
                              className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" 
                              src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80"
                              referrerPolicy="no-referrer"
                            />
                            <div className="relative z-10 text-center p-4">
                              <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-outline group-hover:scale-110 transition-transform">
                                <UploadCloud className="text-primary w-5 h-5" />
                              </div>
                              <p className="text-sm font-bold text-on-surface">Clique para enviar</p>
                              <p className="text-[11px] text-on-surface-variant mt-1 font-medium">PNG ou JPG (Máx. 2MB)</p>
                            </div>
                          </>
                        )}
                      </div>
                      {settings.logo_url && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="flex items-center gap-2 text-xs font-bold text-error hover:text-error/80 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remover logo
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-on-surface">Cores da Plataforma</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-surface-container-low border border-outline">
                          <label className="flex items-center text-[11px] font-bold text-on-surface-variant uppercase mb-3 tracking-wider">
                            Cor Principal
                            <Tooltip text="Cor de botões, ícones e elementos de destaque." />
                          </label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={settings.primary_color} 
                              onChange={(e) => updateSettings({ primary_color: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0"
                            />
                            <span className="text-xs font-mono font-bold text-on-surface uppercase">{settings.primary_color}</span>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-surface-container-low border border-outline">
                          <label className="flex items-center text-[11px] font-bold text-on-surface-variant uppercase mb-3 tracking-wider">
                            Cor de Sucesso
                            <Tooltip text="Cor para aprovações e ações concluídas." />
                          </label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={settings.success_color} 
                              onChange={(e) => updateSettings({ success_color: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0"
                            />
                            <span className="text-xs font-mono font-bold text-on-surface uppercase">{settings.success_color}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SEGURANÇA */}
            {activeSection === 'seguranca' && (
              <motion.div
                key="seguranca"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card-saas p-6 sm:p-8 max-w-lg">
                  <div className="flex items-center gap-3 mb-6 text-primary">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Alterar Senha</span>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {passwordMsg && (
                      <div className={cn(
                        "p-3 rounded-xl text-sm font-medium flex items-center gap-2 border",
                        passwordMsg.type === 'success' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'
                      )}>
                        {passwordMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {passwordMsg.text}
                      </div>
                    )}
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                      <input
                        className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline rounded-xl text-sm font-medium focus:border-primary transition-all outline-none"
                        placeholder="Senha atual"
                        type="password"
                        value={passwordData.current}
                        onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                        required
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                      <input
                        className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline rounded-xl text-sm font-medium focus:border-primary transition-all outline-none"
                        placeholder="Nova senha (mín. 6 caracteres)"
                        type="password"
                        value={passwordData.new}
                        onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                        required
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                      <input
                        className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline rounded-xl text-sm font-medium focus:border-primary transition-all outline-none"
                        placeholder="Confirmar nova senha"
                        type="password"
                        value={passwordData.confirm}
                        onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                        required
                      />
                    </div>
                    <button type="submit" disabled={isChangingPassword} className="btn-primary w-full py-3 text-xs uppercase tracking-widest">
                      {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* MARKETING */}
            {activeSection === 'marketing' && (
              <motion.div
                key="marketing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card-saas p-6 sm:p-8 max-w-2xl">
                  <div className="flex items-center gap-3 mb-6 text-primary">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Marketing e Rastreamento</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-on-surface mb-2">
                        Facebook Pixel ID
                        <Tooltip text="O ID do seu Pixel do Facebook para rastreamento de eventos." />
                      </label>
                      <input className="input-saas w-full" placeholder="Ex: 123456789012345" type="text" />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-semibold text-on-surface mb-2">
                        Facebook API Token
                        <Tooltip text="Token de acesso para a API de Conversões do Facebook (CAPI)." />
                      </label>
                      <input className="input-saas w-full" placeholder="EAAB..." type="password" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex items-center text-sm font-semibold text-on-surface mb-2">
                        Google Tag ID (GTM / GA4)
                        <Tooltip text="O ID da sua Tag do Google (G-XXXXXXXXXX) ou GTM." />
                      </label>
                      <input className="input-saas w-full" placeholder="Ex: G-XXXXXXXXXX" type="text" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ADMINS */}
            {activeSection === 'admins' && (
              <motion.div
                key="admins"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card-saas p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-8 text-primary">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold uppercase tracking-wider block">Gestão de Administradores</span>
                      <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">Apenas Master</span>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <form onSubmit={handleCreateAdmin} className="p-5 bg-surface-container-low rounded-2xl border border-outline space-y-4">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Adicionar Novo Admin</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Administradores Ativos</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {admins.map((admin: any) => (
                          <div key={admin.id} className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <User className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-on-surface truncate">{admin.nome}</p>
                                  {admin.is_master && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter rounded-full border border-primary/20 shrink-0">Master</span>
                                  )}
                                </div>
                                <p className="text-xs text-on-surface-variant font-medium truncate">{admin.email}</p>
                              </div>
                            </div>
                            {!admin.is_master && (
                              <button 
                                onClick={() => handleDeleteAdmin(admin.id)}
                                className="p-2 text-on-surface-variant/30 hover:text-error hover:bg-error/10 rounded-xl transition-all shrink-0"
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10 pt-8 border-t border-outline">
            <button className="px-8 py-3 rounded-xl text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all">
              Descartar Alterações
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary w-auto px-8 py-3 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default SettingsPage;
