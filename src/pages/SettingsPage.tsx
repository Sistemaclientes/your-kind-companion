import React, { useState } from 'react';
import { TopBar } from '@/components/TopBar';
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
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm bg-background-light dark:bg-background-dark px-2 py-1 rounded">/ 10</div>
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
                  <label key={i} className="flex items-start gap-4 p-5 rounded-xl bg-background-light dark:bg-background-dark/50 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all group border border-transparent hover:border-primary/20">
                    <div className="pt-1">
                      <input 
                        defaultChecked={item.checked}
                        className="rounded-md text-primary focus:ring-primary/20 border-border bg-white dark:bg-cards-dark w-5 h-5 cursor-pointer transition-all" 
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
                <div className="aspect-video w-full rounded-xl bg-background-light dark:bg-background-dark/50 overflow-hidden relative group border-2 border-dashed border-border hover:border-primary/50 transition-all flex items-center justify-center cursor-pointer">
                  <img 
                    className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" 
                    src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="relative z-10 text-center p-4">
                    <div className="w-12 h-12 bg-white dark:bg-cards-dark rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-border group-hover:scale-110 transition-transform">
                      <UploadCloud className="text-primary w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-text-primary">Logo da Instituição</p>
                    <p className="text-[11px] text-text-secondary mt-1 font-medium">PNG ou JPG (Máx. 2MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-background-light dark:bg-background-dark/50 border border-border">
                    <label className="flex items-center text-[11px] font-bold text-text-secondary uppercase mb-3 tracking-wider">
                      Cor Principal
                      <Tooltip text="Cor utilizada em botões, ícones e elementos de destaque em toda a plataforma." />
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary shadow-sm ring-2 ring-white dark:ring-cards-dark"></div>
                      <span className="text-xs font-mono font-bold text-text-primary">#0F8B8D</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-background-light dark:bg-background-dark/50 border border-border">
                    <label className="flex items-center text-[11px] font-bold text-text-secondary uppercase mb-3 tracking-wider">
                      Cor de Sucesso
                      <Tooltip text="Cor utilizada para indicar aprovações e ações concluídas com êxito." />
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 shadow-sm ring-2 ring-white dark:ring-cards-dark"></div>
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

            <div className="card-saas p-8">
              <div className="flex items-center gap-3 mb-6 text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Segurança</span>
              </div>
              
              <div className="space-y-5">
                {[
                  { title: 'Bloqueio de Navegação', desc: 'Impede sair da aba durante a prova.', active: true, tooltip: "Detecta se o aluno tentou trocar de aba ou minimizar o navegador durante a prova." },
                  { title: 'Monitoramento Facial', desc: 'Capturas aleatórias pela webcam.', active: false, tooltip: "Utiliza a webcam para tirar fotos aleatórias do aluno para validar a identidade." },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background-light dark:bg-background-dark/50 border border-border">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-text-primary">{item.title}</p>
                        <Tooltip text={item.tooltip} />
                      </div>
                      <p className="text-[11px] text-text-secondary font-medium mt-0.5">{item.desc}</p>
                    </div>
                    <div 
                      className={cn(
                        "w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                        item.active ? "bg-primary" : "bg-border dark:bg-background-dark"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300",
                        item.active ? "right-1" : "left-1"
                      )}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-12 flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-8 border-t border-border">
            <button className="px-8 py-3.5 rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-background-light dark:hover:bg-background-dark transition-all">
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
