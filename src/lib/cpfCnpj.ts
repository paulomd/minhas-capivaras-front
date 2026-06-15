/**
 * CPF e CNPJ brasileiros - mesma regra de {@code br.com.maisrecorrencia.util.CpfCnpjUtils}.
 */

export const MENSAGEM_DOCUMENTO_INVALIDO = "Informe um CPF ou CNPJ válido.";

export function apenasDigitos(documento: string | null | undefined): string {
  if (documento == null) return "";
  let s = "";
  for (let i = 0; i < documento.length; i++) {
    const c = documento.charAt(i);
    if (c >= "0" && c <= "9") s += c;
  }
  return s;
}

function todosDigitosIguais(s: string): boolean {
  const primeiro = s.charAt(0);
  for (let i = 1; i < s.length; i++) {
    if (s.charAt(i) !== primeiro) return false;
  }
  return true;
}

function charParaInt(c: string): number {
  return c.charCodeAt(0) - 48;
}

function calcularDvCpf(cpf: string, tamanho: number): number {
  let soma = 0;
  let peso = tamanho + 1;
  for (let i = 0; i < tamanho; i++) {
    soma += charParaInt(cpf.charAt(i)) * peso;
    peso--;
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function cpfDigitosValidos(cpf: string): boolean {
  if (cpf.length !== 11 || todosDigitosIguais(cpf)) return false;
  const dv1 = calcularDvCpf(cpf, 9);
  const dv2 = calcularDvCpf(cpf, 10);
  return dv1 === charParaInt(cpf.charAt(9)) && dv2 === charParaInt(cpf.charAt(10));
}

function cnpjDigitosValidos(cnpj: string): boolean {
  if (cnpj.length !== 14 || todosDigitosIguais(cnpj)) return false;
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += charParaInt(cnpj.charAt(i)) * pesos1[i]!;
  }
  let resto = soma % 11;
  const dv1 = resto < 2 ? 0 : 11 - resto;
  if (dv1 !== charParaInt(cnpj.charAt(12))) return false;

  soma = 0;
  for (let i = 0; i < 13; i++) {
    soma += charParaInt(cnpj.charAt(i)) * pesos2[i]!;
  }
  resto = soma % 11;
  const dv2 = resto < 2 ? 0 : 11 - resto;
  return dv2 === charParaInt(cnpj.charAt(13));
}

/** CPF (11 dígitos) ou CNPJ (14 dígitos) com dígitos verificadores corretos. */
export function cpfOuCnpjValido(documento: string): boolean {
  const digitos = apenasDigitos(documento);
  if (digitos.length === 11) return cpfDigitosValidos(digitos);
  if (digitos.length === 14) return cnpjDigitosValidos(digitos);
  return false;
}

/**
 * Documento vazio ou só espaços é aceito (campo opcional).
 * Se houver texto, deve ser CPF ou CNPJ válido.
 */
export function validarDocumentoOpcional(documento: string): string | null {
  if (!documento.trim()) return null;
  return cpfOuCnpjValido(documento) ? null : MENSAGEM_DOCUMENTO_INVALIDO;
}

/** Mascara CPF/CNPJ para listagens (somente os dois últimos dígitos visíveis). */
export function anonimizarDocumento(documento: string | null | undefined): string {
  const digitos = apenasDigitos(documento);
  if (digitos.length === 11) {
    return `***.***.***-${digitos.slice(9)}`;
  }
  if (digitos.length === 14) {
    return `**.***.***/****-${digitos.slice(12)}`;
  }
  if (!digitos) return "";
  return "***";
}
