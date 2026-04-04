import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, User, Mail, Phone, Lock, Save, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { TopBar } from '../components/TopBar';
import { phoneMask } from '../lib/masks';

export function StudentProfilePage() {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = React.useState<any>(null);
  const [nome, setNome] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [telefone, setTelefone] = React.useState('');
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const info = localStorage.getItem('student_info');
    if (!info) {
      navigate('/aluno/login');
      return;
    }
    const parsed = JSON.parse(info);
    setStudentInfo(parsed);
    setNome(parsed.nome || '');
    setEmail(parsed.email || '');
    setTelefone(parsed.telefone || '');
    setCpf(parsed.cpf || '');

    // Load avatar
    const savedAvatar = localStorage.getItem(`student_avatar_${parsed.email}`);
    if (savedAvatar) setAvatar(savedAvatar);
  }, [navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
      if (studentInfo?.email) {
        localStorage.setItem(`student_avatar_${studentInfo.email}`, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    // Update student_info in localStorage
    const updatedInfo = { ...studentInfo, nome, telefone, cpf };
    localStorage.setItem('student_info', JSON.stringify(updatedInfo));
    setStudentInfo(updatedInfo);

    // Update registered_students
    const registeredStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
    const idx = registeredStudents.findIndex((s: any) => s.email === email);
    if (idx >= 0) {
      registeredStudents[idx].nome = nome;
      registeredStudents[idx].telefone = telefone;
      if (newPassword) {
        registeredStudents[idx].password = newPassword;
      }
      localStorage.setItem('registered_students', JSON.stringify(registeredStudents));
    }

    // Update remembered credentials if needed
    const remembered = localStorage.getItem('student_remembered');
    if (remembered && newPassword) {
      const parsed = JSON.parse(remembered);
      if (parsed.email === email) {
        parsed.password = newPassword;
        localStorage.setItem('student_remembered', JSON.stringify(parsed));
      }
    }

    setSaved(true);
    toast.success('Perfil atualizado com sucesso!');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSaved(false), 3000);

    // Dispatch event to update sidebar
    window.dispatchEvent(new Event('student-profile-updated'));
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none";
  const labelClass = "block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors";

  if (!studentInfo) return null;

  return (
    <>
      <TopBar title="Meu Perfil" subtitle="Edite suas informações pessoais" />
      <div className="pt-24 px-4 sm:px-8 pb-12 max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Avatar Section */}
          <div className="card-saas p-8 flex flex-col items-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-outline shadow-xl bg-surface-container-high">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary text-4xl font-black font-headline">
                    {nome.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform border-2 border-surface-container"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <h2 className="text-xl font-black text-on-surface font-headline tracking-tight mt-5">{nome}</h2>
            <p className="text-sm text-on-surface-variant font-medium">{email}</p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} className="card-saas p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-black text-on-surface font-headline tracking-tight mb-2">Informações Pessoais</h3>

            <div className="space-y-2">
              <label className={labelClass}>Nome Completo</label>
              <div className="relative group">
                <User className={iconClass} />
                <input className={inputClass} type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>E-mail</label>
              <div className="relative group">
                <Mail className={iconClass} />
                <input className={`${inputClass} opacity-60 cursor-not-allowed`} type="email" value={email} disabled />
              </div>
              <p className="text-[10px] text-on-surface-variant/60 ml-1">O e-mail não pode ser alterado.</p>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Telefone / WhatsApp</label>
              <div className="relative group">
                <Phone className={iconClass} />
                <input className={inputClass} type="tel" placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(phoneMask(e.target.value))} />
              </div>
            <div className="space-y-2">
              <label className={labelClass}>CPF</label>
              <div className="relative group">
                <User className={iconClass} />
                <input className={inputClass} type="text" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} />
              </div>
            </div>

            <div className="border-t border-outline pt-5 mt-5">
              <h3 className="text-lg font-black text-on-surface font-headline tracking-tight mb-4">Alterar Senha</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={labelClass}>Nova Senha</label>
                  <div className="relative group">
                    <Lock className={iconClass} />
                    <input
                      className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline rounded-xl text-on-surface text-sm font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Deixe em branco para manter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Confirmar Nova Senha</label>
                  <div className="relative group">
                    <Lock className={iconClass} />
                    <input
                      className={inputClass}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-error font-semibold bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                {error}
              </motion.p>
            )}

            {saved && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-5 h-5" />
                Perfil atualizado com sucesso!
              </motion.div>
            )}

            <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 group">
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Salvar Alterações
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
}

export default StudentProfilePage;
