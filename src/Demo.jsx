import { useState } from 'react'
import './App.css'
import './Demo.css'

const atletasExemplo = [
  { id: '01', nome: 'Atleta Exemplo 01', categoria: 'Sub-13', posicao: 'Goleiro', status: 'Ativo' },
  { id: '02', nome: 'Atleta Exemplo 02', categoria: 'Sub-13', posicao: 'Ala', status: 'Ativo' },
  { id: '03', nome: 'Atleta Exemplo 03', categoria: 'Sub-15', posicao: 'Pivô', status: 'Ativo' },
  { id: '04', nome: 'Atleta Exemplo 04', categoria: 'Sub-15', posicao: 'Fixo', status: 'Ativo' },
  { id: '05', nome: 'Atleta Exemplo 05', categoria: 'Sub-17', posicao: 'Ala', status: 'Inativo' },
]

const categoriasExemplo = ['Sub-07', 'Sub-09', 'Sub-11', 'Sub-13', 'Sub-15', 'Sub-17', 'Sub-20']
const posicoesExemplo = [...new Set(atletasExemplo.map((atleta) => atleta.posicao))]

export default function Demo() {
  const [tela, setTela] = useState('dashboard')
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [posicao, setPosicao] = useState('Todas')
  const [atletaSelecionado, setAtletaSelecionado] = useState(null)

  const atletasFiltrados = atletasExemplo.filter((atleta) =>
    atleta.nome.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR')) &&
    (categoria === 'Todas' || atleta.categoria === categoria) &&
    (posicao === 'Todas' || atleta.posicao === posicao)
  )

  function abrirCategoria(nome) {
    setCategoria(nome)
    setTela('atletas')
  }

  function abrirAtleta(atleta) {
    setAtletaSelecionado(atleta)
    setTela('perfil')
  }

  return (
    <main className="app demo-app">
      <a className="demo-skip" href="#conteudo-demo">Ir para o conteúdo</a>
      <header className="barra-superior">
        <div className="marca">
          <div className="logo" aria-hidden="true">BS</div>
          <div><strong>Base Scout</strong><span>GESTÃO DE ATLETAS</span></div>
        </div>
        <nav className="menu" aria-label="Navegação da demonstração">
          <button type="button" className={tela === 'dashboard' ? 'ativo' : ''} onClick={() => setTela('dashboard')}>Dashboard</button>
          <button type="button" className={tela === 'categorias' ? 'ativo' : ''} onClick={() => setTela('categorias')}>Categorias</button>
          <button type="button" className={tela === 'atletas' || tela === 'perfil' ? 'ativo' : ''} onClick={() => setTela('atletas')}>Atletas</button>
          <a href="/">Acesso restrito</a>
        </nav>
      </header>

      <div className="demo-banner" role="note">
        <strong>Demonstração de portfólio</strong>
        <span>Dados fictícios, sem conexão com o banco e sem edição de cadastros.</span>
      </div>

      <div id="conteudo-demo" className="painel">
        {tela === 'dashboard' && (
          <>
            <header className="cabecalho-pagina">
              <div><h1>Visão geral</h1><p>Uma amostra do acompanhamento de atletas por categoria.</p></div>
              <button type="button" className="botao-principal" onClick={() => setTela('atletas')}>Explorar atletas</button>
            </header>
            <section className="cards-resumo" aria-label="Indicadores demonstrativos">
              <article className="card-resumo"><div className="icone-resumo verde">AT</div><div><strong>5</strong><span>Atletas de exemplo</span></div></article>
              <article className="card-resumo"><div className="icone-resumo claro">OK</div><div><strong>4</strong><span>Ativos</span></div></article>
              <article className="card-resumo"><div className="icone-resumo amarelo">CT</div><div><strong>7</strong><span>Categorias</span></div></article>
              <article className="card-resumo"><div className="icone-resumo azul">PS</div><div><strong>4</strong><span>Posições</span></div></article>
            </section>
            <section className="grade-dashboard">
              <article className="card-dashboard">
                <header className="titulo-card"><h2>Atletas por categoria</h2></header>
                <div className="grafico-categorias">
                  {categoriasExemplo.map((nome) => {
                    const total = atletasExemplo.filter((atleta) => atleta.categoria === nome).length
                    return <div className="barra-categoria" key={nome}><div className="barra-area"><div className="barra-preenchida" style={{ height: `${Math.max(total / 2 * 100, 4)}%` }} /></div><strong>{total}</strong><span>{nome}</span></div>
                  })}
                </div>
              </article>
              <article className="card-dashboard">
                <header className="titulo-card linha"><h2>Cadastros de exemplo</h2><button type="button" className="botao-link" onClick={() => setTela('atletas')}>Ver todos →</button></header>
                <div className="lista-recentes">
                  {atletasExemplo.map((atleta) => <article className="atleta-recente" key={atleta.id}><div className="avatar" aria-hidden="true">{atleta.id}</div><div className="info-atleta"><strong>{atleta.nome}</strong><span className="tag">{atleta.posicao}</span><span className="tag categoria">{atleta.categoria}</span></div></article>)}
                </div>
              </article>
            </section>
          </>
        )}

        {tela === 'categorias' && (
          <>
            <header className="cabecalho-pagina"><div><h1>Categorias</h1><p>Selecione uma categoria para filtrar os atletas de exemplo.</p></div></header>
            <section className="grade-categorias" aria-label="Categorias demonstrativas">
              {categoriasExemplo.map((nome, index) => {
                const total = atletasExemplo.filter((atleta) => atleta.categoria === nome).length
                const cor = ['verde', 'azul', 'roxo', 'amarelo', 'vermelho', 'anil', 'turquesa'][index]
                return <article className={`card-categoria ${cor}`} key={nome}><div className="icone-categoria" aria-hidden="true">CT</div><div><strong>{nome}</strong><span>{total} {total === 1 ? 'atleta' : 'atletas'}</span></div><button type="button" aria-label={`Ver atletas da categoria ${nome}`} onClick={() => abrirCategoria(nome)}>›</button></article>
              })}
            </section>
          </>
        )}

        {tela === 'atletas' && (
          <>
            <header className="cabecalho-pagina"><div><h1>Atletas</h1><p>Pesquise e filtre os registros fictícios.</p></div><span className="demo-total">{atletasFiltrados.length} resultado(s)</span></header>
            <section className="filtros-atletas" aria-label="Filtros de atletas">
              <label className="campo-filtro"><span>Buscar</span><input type="search" placeholder="Buscar atleta de exemplo" value={busca} onChange={(event) => setBusca(event.target.value)} /></label>
              <label className="campo-filtro"><span>Categoria</span><select value={categoria} onChange={(event) => setCategoria(event.target.value)}><option>Todas</option>{categoriasExemplo.map((nome) => <option key={nome}>{nome}</option>)}</select></label>
              <label className="campo-filtro"><span>Posição</span><select value={posicao} onChange={(event) => setPosicao(event.target.value)}><option>Todas</option>{posicoesExemplo.map((nome) => <option key={nome}>{nome}</option>)}</select></label>
            </section>
            <section className="grade-atletas" aria-label="Atletas fictícios">
              {atletasFiltrados.length === 0 && <div className="estado-lista">Nenhum exemplo corresponde aos filtros. Ajuste a busca ou a categoria.</div>}
              {atletasFiltrados.map((atleta) => <article className="card-atleta" key={atleta.id}><div className="foto-atleta" aria-hidden="true">{atleta.id}</div><div className="conteudo-atleta"><h2>{atleta.nome}</h2><div className="badges-atleta"><span className="tag">{atleta.posicao}</span><span className="tag categoria">{atleta.categoria}</span><span className="tag idade">{atleta.status}</span></div><p>Perfil demonstrativo</p><button type="button" className="botao-mini destaque" onClick={() => abrirAtleta(atleta)}>Ver perfil</button></div></article>)}
            </section>
          </>
        )}

        {tela === 'perfil' && atletaSelecionado && (
          <section className="demo-perfil">
            <button type="button" className="botao-link" onClick={() => setTela('atletas')}>← Voltar para atletas</button>
            <div className="demo-perfil-card"><div className="foto-atleta" aria-hidden="true">{atletaSelecionado.id}</div><div><h1>{atletaSelecionado.nome}</h1><p>Perfil fictício para demonstrar a visualização de um cadastro.</p><div className="badges-atleta"><span className="tag">{atletaSelecionado.categoria}</span><span className="tag">{atletaSelecionado.posicao}</span><span className="tag idade">{atletaSelecionado.status}</span></div></div></div>
            <div className="estado-lista">Documentos pessoais, contatos e fotos não fazem parte da demonstração pública.</div>
          </section>
        )}
      </div>
    </main>
  )
}
