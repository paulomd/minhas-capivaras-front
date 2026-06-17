"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BellRing,
  Briefcase,
  Building2,
  Car,
  ClipboardList,
  FileSearch,
  Gavel,
  HandCoins,
  HeartHandshake,
  Landmark,
  Mail,
  MessageCircle,
  Radar,
  Scale,
  ScrollText,
  ShieldCheck,
  ShoppingCart,
  Unlock,
  User,
  Users,
  Vote,
  Zap,
  Baby,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { apiFetch } from "@/lib/apiFetch";
import { formatarMoeda } from "@/lib/format";
import { PlanoBeneficios } from "@/components/planos/PlanoBeneficios";
import type { Plano } from "@/types/plano";
import "./home.css";

function HomeIconBox({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="home-icon-box" aria-hidden>
      <Icon size={22} strokeWidth={2} />
    </div>
  );
}

function PlanoCard({ plano }: { plano: Plano }) {
  const gratuito = plano.valorBase === 0;
  return (
    <div className="home-plano-card">
      <div className="home-plano-card-header">
        <Scale size={22} className="home-plano-card-icon" aria-hidden />
        <h3>{plano.nome}</h3>
      </div>
      <p className="home-plano-preco">{formatarMoeda(plano.valorBase)}</p>
      <PlanoBeneficios plano={plano} marcadorCheck className="home-plano-lista" />
      <Link href="/cadastro" className="home-botao">
        {gratuito ? "Começar grátis" : "Quero começar"}
      </Link>
    </div>
  );
}

const SERVICOS_DESTAQUE: {
  icon: LucideIcon;
  titulo: string;
  subtitulo: string;
  texto: string;
  bullets: string[];
  cta: string;
  href?: string;
}[] = [
  {
    icon: Radar,
    titulo: "Monitoramento diário",
    subtitulo: "Vigilância automática 24h",
    texto:
      "Seja notificado sobre novos processos e publicações vinculados ao CPF, CNPJ, OAB ou filtros que você define.",
    bullets: [
      "Consulta automática todos os dias",
      "Alertas por WhatsApp e e-mail",
      "Tribunais e diários oficiais",
    ],
    cta: "Monitorar agora",
  },
  {
    icon: FileSearch,
    titulo: "Processos e publicações",
    subtitulo: "Tudo organizado no painel",
    texto:
      "Acompanhe movimentações, consulte detalhes e mantenha histórico sem planilhas ou buscas manuais em portais.",
    bullets: [
      "Listagem clara de processos",
      "Detalhes e comunicações",
      "Painel simples e objetivo",
    ],
    cta: "Ver como funciona",
    href: "#como-funciona",
  },
];

const ETAPAS = [
  {
    icon: ClipboardList,
    titulo: "Cadastre o que importa",
    texto:
      "Informe OAB, CPF, CNPJ ou filtros específicos. Em poucos cliques você define o que precisa ser vigiado — sem burocracia.",
  },
  {
    icon: Radar,
    titulo: "Monitoramos por você",
    texto:
      "Nosso sistema consulta fontes oficiais e tribunais automaticamente, 24 horas por dia. Você não precisa entrar em portais judiciais.",
  },
  {
    icon: BellRing,
    titulo: "Receba alertas antes da surpresa",
    texto:
      "Nova movimentação? Você é avisado por e-mail e WhatsApp em tempo real — ganhe tempo para reagir com estratégia.",
  },
];

const BENEFICIOS: { icon: LucideIcon; titulo: string; texto: string }[] = [
  {
    icon: BellRing,
    titulo: "Saiba antes de ser intimado",
    texto:
      "Identifique processos e publicações relevantes com antecedência. Não deixe uma citação por edital ou intimação perdida virar prejuízo.",
  },
  {
    icon: Gavel,
    titulo: "Evite revelia e prazos perdidos",
    texto:
      "Muitas perdas acontecem porque a pessoa só descobre o processo quando já há decisão. Com alertas diários, você age no tempo certo.",
  },
  {
    icon: ShieldCheck,
    titulo: "Antecipe bloqueios e penhoras",
    texto:
      "Descubra ações no início e tenha margem para se posicionar — antes de surpresas em contas, bens ou operação da empresa.",
  },
  {
    icon: User,
    titulo: "Proteja seu nome e patrimônio",
    texto:
      "Ideal para quem quer vigilância sobre o próprio CPF/CNPJ ou de clientes, sem depender de consultas manuais espalhadas.",
  },
  {
    icon: MessageCircle,
    titulo: "WhatsApp e e-mail na palma da mão",
    texto:
      "Notificações diretas, sem precisar abrir tribunais ou pedir ao advogado só para saber se houve novidade.",
  },
  {
    icon: Unlock,
    titulo: "Sem fidelidade, sem letras miúdas",
    texto:
      "Contrate o plano que faz sentido para você. Cancele quando quiser, direto na plataforma.",
  },
];

const PUBLICO: { icon: LucideIcon; titulo: string; texto: string }[] = [
  {
    icon: User,
    titulo: "Pessoas físicas",
    texto: "Monitorar o próprio nome e evitar surpresas judiciais.",
  },
  {
    icon: Briefcase,
    titulo: "Empresários",
    texto: "Vigiar ações contra o CPF ou CNPJ da empresa.",
  },
  {
    icon: Scale,
    titulo: "Advogados",
    texto: "Praticidade no acompanhamento de processos e publicações.",
  },
  {
    icon: Building2,
    titulo: "Empresas e RH",
    texto: "Alertas organizados, sem planilhas e consultas manuais.",
  },
  {
    icon: Users,
    titulo: "Todos que querem estar à frente",
    texto: "Descobrir o processo tarde demais não precisa ser a norma.",
  },
];

const TIPOS_PROCESSO: { icon: LucideIcon; label: string }[] = [
  { icon: Scale, label: "Processos cíveis" },
  { icon: Briefcase, label: "Trabalhistas" },
  { icon: Gavel, label: "Criminais" },
  { icon: HandCoins, label: "Fiscais" },
  { icon: Baby, label: "Família" },
  { icon: Vote, label: "Eleitorais" },
  { icon: Landmark, label: "Execuções" },
  { icon: ShoppingCart, label: "Consumidor" },
  { icon: Car, label: "Busca e apreensão" },
  { icon: ScrollText, label: "Publicações oficiais" },
];

export default function HomePage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    document.body.style.removeProperty("overflow");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const dados = await apiFetch<Plano[]>("/planos");
        setPlanos(Array.isArray(dados) ? dados : []);
      } catch {
        setPlanos([]);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  return (
    <main className="pagina-publica pagina-inicial">
      <header className="home-navbar">
        <div className="home-container home-nav-content">
          <Logo href="/" size="sm" priority />
          <nav>
            <ul className="home-menu">
              <li><a href="#hero">Início</a></li>
              <li><a href="#beneficios">Benefícios</a></li>
              <li><a href="#como-funciona">Como Funciona</a></li>
              <li><a href="#planos">Planos</a></li>
              <li><a href="#contato">Contato</a></li>
              <li>
                <Link href="/login" className="home-btn-nav">Entrar</Link>
              </li>
              <li>
                <Link href="/cadastro" className="home-btn-nav">Criar Conta</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="home-hero" id="hero">
        <div className="home-container home-hero-grid">
          <div className="home-hero-copy">
            <span className="home-hero-badge">
              <Zap size={14} aria-hidden />
              Monitoramento processual inteligente
            </span>
            <h1>
              Saiba se você foi processado{" "}
              <span className="home-text-accent">antes mesmo de ser intimado</span>
            </h1>
            <p className="home-hero-sub">
              Receba <strong>notificações em tempo real</strong> sobre processos
              vinculados ao seu CPF, CNPJ, OAB ou filtros personalizados — em
              tribunais e diários oficiais do Brasil.
            </p>
            <div className="home-hero-actions">
              <Link href="/cadastro" className="home-btn-cta">
                Monitorar CPF ou CNPJ
              </Link>
              <Link href="#como-funciona" className="home-btn-ghost">
                Como funciona
              </Link>
            </div>
            <div className="home-hero-pills">
              <span className="home-hero-pill">
                <BellRing size={16} aria-hidden /> Monitoramento diário 24h
              </span>
              <span className="home-hero-pill">
                <MessageCircle size={16} aria-hidden /> WhatsApp e e-mail
              </span>
              <span className="home-hero-pill">
                <Landmark size={16} aria-hidden /> Tribunais e publicações
              </span>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-hero-visual-bg" aria-hidden />
            <Image
              src="/simbolo.png"
              alt="Ilustração Minhas Capivaras"
              width={320}
              height={320}
              className="home-hero-mascot"
              priority
            />
            <div className="home-float-card home-float-1">
              <BellRing size={20} aria-hidden />
              <div>
                <strong>Alerta em tempo real</strong>
                <span>Nova movimentação detectada</span>
              </div>
            </div>
            <div className="home-float-card home-float-2">
              <ShieldCheck size={20} aria-hidden />
              <div>
                <strong>Proteção jurídica</strong>
                <span>Antes da intimação</span>
              </div>
            </div>
            <div className="home-float-card home-float-3">
              <Mail size={20} aria-hidden />
              <div>
                <strong>WhatsApp + E-mail</strong>
                <span>Notificações automáticas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-servicos">
        <div className="home-container">
          <div className="home-servicos-grid">
            {SERVICOS_DESTAQUE.map((servico) => (
              <article key={servico.titulo} className="home-servico-card">
                <div className="home-servico-card-top">
                  <HomeIconBox icon={servico.icon} />
                  <div>
                    <h2>{servico.titulo}</h2>
                    <p className="home-servico-sub">{servico.subtitulo}</p>
                  </div>
                </div>
                <p className="home-servico-texto">{servico.texto}</p>
                <ul className="home-servico-lista">
                  {servico.bullets.map((b) => (
                    <li key={b}>✓ {b}</li>
                  ))}
                </ul>
                <Link
                  href={servico.href ?? "/cadastro"}
                  className="home-servico-link"
                >
                  {servico.cta} →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-beneficios" id="beneficios">
        <div className="home-container">
          <p className="home-eyebrow">Serviços que trazem tranquilidade jurídica</p>
          <h2 className="home-section-title">Por que escolher Minhas Capivaras?</h2>
          <p className="home-section-sub">
            Controle, alertas rápidos e praticidade — como as melhores plataformas de
            monitoramento, com a simplicidade que você precisa no dia a dia.
          </p>
          <div className="home-beneficios-grid">
            {BENEFICIOS.map((item) => (
              <div key={item.titulo} className="home-beneficio-card">
                <HomeIconBox icon={item.icon} />
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-como-funciona" id="como-funciona">
        <div className="home-container">
          <p className="home-eyebrow">Simples e automático</p>
          <h2>Como Funciona</h2>
          <p className="home-section-sub" style={{ marginBottom: 32 }}>
            Três passos para não ficar no escuro sobre o que acontece nos tribunais.
          </p>
          <div className="home-etapas">
            {ETAPAS.map((etapa, i) => (
              <div key={etapa.titulo} className="home-etapa">
                <div className="home-etapa-num">{i + 1}</div>
                <HomeIconBox icon={etapa.icon} />
                <h3>{etapa.titulo}</h3>
                <p>{etapa.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-publico">
        <div className="home-container home-publico-grid">
          <div className="home-publico-copy">
            <p className="home-eyebrow">Solução jurídica sob medida</p>
            <h2 className="home-section-title">Para quem é?</h2>
            <p className="home-section-sub" style={{ marginBottom: 24 }}>
              Se um processo não pode passar despercebido, esta plataforma foi feita
              para você.
            </p>
            <Link href="/cadastro" className="home-btn-cta">
              Quero começar
            </Link>
          </div>
          <div className="home-publico-cards">
            {PUBLICO.map((item) => (
              <div key={item.titulo} className="home-publico-card">
                <HomeIconBox icon={item.icon} />
                <div>
                  <h3>{item.titulo}</h3>
                  <p>{item.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-tipos">
        <div className="home-container">
          <p className="home-eyebrow">Tribunais e instâncias do Brasil</p>
          <h2 className="home-section-title">Principais áreas que cobrimos</h2>
          <p className="home-section-sub">
            Monitoramento amplo para diferentes classes e fontes de informação processual.
          </p>
          <div className="home-tipos-grid">
            {TIPOS_PROCESSO.map((tipo) => (
              <div key={tipo.label} className="home-tipo-card">
                <HomeIconBox icon={tipo.icon} />
                <span>{tipo.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-planos" id="planos">
        <div className="home-container">
          <p className="home-eyebrow">Planos flexíveis, proteção completa</p>
          <h2>Escolha o plano ideal para você</h2>
          <p className="home-plano-intro">
            Comece com o plano gratuito para testar ou escolha um plano completo com
            mais monitoramentos e notificações. Cadastro rápido — cancele quando quiser.
          </p>
          {carregando && <p className="home-muted">Carregando planos…</p>}
          {!carregando && planos.length === 0 && (
            <p className="home-muted">Planos indisponíveis no momento.</p>
          )}
          <div className="home-cards">
            {planos.map((plano) => (
              <PlanoCard key={plano.id} plano={plano} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta-final">
        <div className="home-container home-cta-inner">
          <HeartHandshake size={40} className="home-cta-icon" aria-hidden />
          <h2>Não espere a intimação chegar</h2>
          <p>
            Crie sua conta em minutos e coloque o monitoramento no automático.
            O primeiro alerta pode evitar um problema grande.
          </p>
          <Link href="/cadastro" className="home-btn-cta">
            Criar conta gratuita
          </Link>
        </div>
      </section>

      <footer className="home-footer" id="contato">
        <div className="home-container home-footer-grid">
          <div className="home-footer-brand">
            <Logo href="/" size="xs" />
            <p>Monitoramento processual com alertas em tempo real.</p>
          </div>
          <div className="home-footer-links">
            <a href="#">Política de Privacidade</a>
            <a href="#">Termos de Uso</a>
            <a href="mailto:contato@minhascapivaras.com.br">
              <Mail size={14} aria-hidden />
              contato@minhascapivaras.com.br
            </a>
          </div>
        </div>
        <div className="home-container">
          <p className="home-footer-copy">
            © {new Date().getFullYear()} Minhas Capivaras. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
