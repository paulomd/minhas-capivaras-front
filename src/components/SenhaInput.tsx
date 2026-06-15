"use client";

type SenhaInputProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showRules?: boolean;
  variant?: "dark" | "light";
};

export function validarSenha(senha: string): string | null {
  if (!senha) return "Informe a senha.";

  if (senha.length < 6 || senha.length > 20) {
    return "A senha deve ter entre 6 e 20 caracteres.";
  }

  if (!/[0-9]/.test(senha)) {
    return "A senha deve conter pelo menos 1 número.";
  }

  if (!/[A-Z]/.test(senha)) {
    return "A senha deve conter pelo menos 1 letra maiúscula.";
  }

  if (!/[a-z]/.test(senha)) {
    return "A senha deve conter pelo menos 1 letra minúscula.";
  }

  return null;
}

function regraOk(senha: string) {
  return {
    tamanho: senha.length >= 6 && senha.length <= 20,
    numero: /[0-9]/.test(senha),
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
  };
}

export default function SenhaInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = true,
  showRules = false,
  variant = "dark",
}: SenhaInputProps) {
  const regras = regraOk(value);
  const light = variant === "light";

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium ${light ? "text-slate-700" : "text-lg text-slate-200"}`}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type="password"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          light
            ? "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            : "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-base text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        }
        placeholder={placeholder}
      />

      {showRules && (
        <div
          className={
            light
              ? "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              : "rounded-lg border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-xs"
          }
        >
          <p className={`mb-1 ${light ? "text-slate-600" : "text-slate-300"}`}>
            A senha deve conter:
          </p>
          <ul className="space-y-1">
            <li className={regras.tamanho ? "text-emerald-600" : light ? "text-slate-400" : "text-slate-400"}>
              - Entre 6 e 20 caracteres
            </li>
            <li className={regras.numero ? "text-emerald-600" : light ? "text-slate-400" : "text-slate-400"}>
              - Pelo menos 1 número
            </li>
            <li className={regras.maiuscula ? "text-emerald-600" : light ? "text-slate-400" : "text-slate-400"}>
              - Pelo menos 1 letra maiúscula
            </li>
            <li className={regras.minuscula ? "text-emerald-600" : light ? "text-slate-400" : "text-slate-400"}>
              - Pelo menos 1 letra minúscula
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

