import { useEffect, useRef, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'

const atletasIniciais = []

const categorias = [
  { nome: 'Sub-07', cor: 'verde' },
  { nome: 'Sub-09', cor: 'azul' },
  { nome: 'Sub-11', cor: 'roxo' },
  { nome: 'Sub-13', cor: 'amarelo' },
  { nome: 'Sub-15', cor: 'vermelho' },
  { nome: 'Sub-17', cor: 'anil' },
  { nome: 'Sub-20', cor: 'turquesa' },
]

const formularioInicial = {
  id: null,
  foto: '',
  fotoArquivo: null,
  nome: '',
  dataNascimento: '',
  posicao: '',
  categoria: '',
  peDominante: 'Direito',
  altura: '',
  peso: '',
  telefone: '',
  status: 'Ativo',
  instagram: '',
  facebook: '',
  x: '',
  identidadeArquivo: '',
  identidadeArquivoUrl: '',
  identidadeArquivoFile: null,
  certidaoNascimentoArquivo: '',
  certidaoNascimentoArquivoUrl: '',
  certidaoNascimentoArquivoFile: null,
  responsavel: '',
  telefoneResponsavel: '',
  planoSaudeSus: '',
  carteiraPlanoSusArquivo: '',
  carteiraPlanoSusArquivoUrl: '',
  carteiraPlanoSusArquivoFile: null,
  declaracaoEscolarArquivo: '',
  declaracaoEscolarArquivoUrl: '',
  declaracaoEscolarArquivoFile: null,
  clube: '',
  clubesAnteriores: '',
  caracteristicasTecnicas: '',
  caracteristicasFisicas: '',
  observacoesTreinador: '',
  observacoesGerais: '',
}

const documentoInicial = {
  tipo: 'Identidade do atleta e dos pais em PDF',
  arquivo: null,
}

const tiposDocumento = [
  'Identidade do atleta e dos pais em PDF',
  'Certidao de nascimento do atleta',
  'Atestado medico',
  'Eletrocardiograma',
  'Ecocardiograma',
  'Declaracao escolar',
  'Plano de saude ou SUS',
  'Carteira de vacinacao',
  'Ficha cadastral',
  'Comprovante',
  'Autorizacao',
  'Outro',
]

function formatarDataCadastro(data) {
  if (!data) {
    return ''
  }

  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function atletaDoBanco(linha) {
  return {
    id: linha.id,
    foto: linha.foto_url || '',
    nome: linha.nome,
    dataNascimento: linha.data_nascimento || '',
    categoria: linha.categoria,
    posicao: linha.posicao,
    idade: linha.idade ?? '',
    clube: linha.clube || 'Sem clube informado',
    status: linha.status || 'Ativo',
    telefone: linha.telefone || '',
    responsavel: linha.responsavel || '',
    telefoneResponsavel: linha.telefone_responsavel || '',
    peDominante: linha.pe_dominante || 'Direito',
    altura: linha.altura || '',
    peso: linha.peso || '',
    instagram: linha.instagram || '',
    facebook: linha.facebook || '',
    x: linha.x || '',
    identidadeArquivo: linha.identidade_arquivo || '',
    identidadeArquivoUrl: linha.identidade_arquivo_url || '',
    certidaoNascimentoArquivo: linha.certidao_nascimento_arquivo || '',
    certidaoNascimentoArquivoUrl: linha.certidao_nascimento_arquivo_url || '',
    planoSaudeSus: linha.plano_saude_sus || '',
    carteiraPlanoSusArquivo: linha.carteira_plano_sus_arquivo || '',
    carteiraPlanoSusArquivoUrl: linha.carteira_plano_sus_arquivo_url || '',
    declaracaoEscolarArquivo: linha.declaracao_escolar_arquivo || '',
    declaracaoEscolarArquivoUrl: linha.declaracao_escolar_arquivo_url || '',
    clubesAnteriores: linha.clubes_anteriores || '',
    caracteristicasTecnicas: linha.caracteristicas_tecnicas || '',
    caracteristicasFisicas: linha.caracteristicas_fisicas || '',
    observacoesTreinador: linha.observacoes_treinador || '',
    observacoesGerais: linha.observacoes_gerais || '',
    dataCadastro: formatarDataCadastro(linha.created_at),
  }
}

function atletaParaBanco(formulario, idade) {
  return {
    foto_url: formulario.foto,
    nome: formulario.nome,
    data_nascimento: formulario.dataNascimento,
    categoria: formulario.categoria,
    posicao: formulario.posicao,
    idade: idade === '' ? null : idade,
    clube: formulario.clube || 'Sem clube informado',
    status: formulario.status,
    telefone: formulario.telefone,
    responsavel: formulario.responsavel,
    telefone_responsavel: formulario.telefoneResponsavel,
    pe_dominante: formulario.peDominante,
    altura: formulario.altura,
    peso: formulario.peso,
    instagram: formulario.instagram,
    facebook: formulario.facebook,
    x: formulario.x,
    identidade_arquivo: formulario.identidadeArquivo,
    identidade_arquivo_url: formulario.identidadeArquivoUrl,
    certidao_nascimento_arquivo: formulario.certidaoNascimentoArquivo,
    certidao_nascimento_arquivo_url: formulario.certidaoNascimentoArquivoUrl,
    plano_saude_sus: formulario.planoSaudeSus,
    carteira_plano_sus_arquivo: formulario.carteiraPlanoSusArquivo,
    carteira_plano_sus_arquivo_url: formulario.carteiraPlanoSusArquivoUrl,
    declaracao_escolar_arquivo: formulario.declaracaoEscolarArquivo,
    declaracao_escolar_arquivo_url: formulario.declaracaoEscolarArquivoUrl,
    clubes_anteriores: formulario.clubesAnteriores,
    caracteristicas_tecnicas: formulario.caracteristicasTecnicas,
    caracteristicas_fisicas: formulario.caracteristicasFisicas,
    observacoes_treinador: formulario.observacoesTreinador,
    observacoes_gerais: formulario.observacoesGerais,
  }
}

function limparNomeArquivo(nome) {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '-')
    .toLowerCase()
}

function App() {
  const [sessao, setSessao] = useState(null)
  const [carregandoSessao, setCarregandoSessao] = useState(true)
  const [emailLogin, setEmailLogin] = useState('')
  const [senhaLogin, setSenhaLogin] = useState('')
  const [erroLogin, setErroLogin] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [modoRecuperacaoSenha, setModoRecuperacaoSenha] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('')
  const [mensagemLogin, setMensagemLogin] = useState('')
  const [mensagemGlobal, setMensagemGlobal] = useState(null)
  const [atletas, setAtletas] = useState(atletasIniciais)
  const [carregandoAtletas, setCarregandoAtletas] = useState(true)
  const [telaAtual, setTelaAtual] = useState('dashboard')
  const [buscaAtleta, setBuscaAtleta] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas')
  const [posicaoFiltro, setPosicaoFiltro] = useState('Todas')
  const [formulario, setFormulario] = useState(formularioInicial)
  const [atletaSelecionadoId, setAtletaSelecionadoId] = useState(null)
  const [documentosPorAtleta, setDocumentosPorAtleta] = useState({})
  const [documento, setDocumento] = useState(documentoInicial)
  const [documentoPreview, setDocumentoPreview] = useState(null)
  const [carregandoDocumentos, setCarregandoDocumentos] = useState(false)
  const [confirmacao, setConfirmacao] = useState(null)
  const arquivoDocumentoRef = useRef(null)
  const fotoAtletaRef = useRef(null)
  const editandoAtleta = formulario.id !== null

  useEffect(() => {
    async function carregarSessaoInicial() {
      const { data } = await supabase.auth.getSession()

      setSessao(data.session)
      setCarregandoSessao(false)
    }

    carregarSessaoInicial()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSessao(session)

      if (event === 'PASSWORD_RECOVERY') {
        setModoRecuperacaoSenha(true)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (sessao) {
      carregarAtletas()
    } else {
      setAtletas([])
    }
  }, [sessao])

  async function carregarAtletas() {
    setCarregandoAtletas(true)

    const { data, error } = await supabase
      .from('atletas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      mostrarMensagem('erro', `Erro ao carregar atletas: ${error.message}`)
      setCarregandoAtletas(false)
      return
    }

    setAtletas(data.map(atletaDoBanco))
    setCarregandoAtletas(false)
  }

  async function documentoDoBanco(linha) {
    let url = linha.arquivo_url || ''

    if (linha.arquivo_url && !linha.arquivo_url.startsWith('http')) {
      const { data } = await supabase.storage
        .from('documentos-atletas')
        .createSignedUrl(linha.arquivo_url, 60 * 60 * 24 * 7)

      url = data?.signedUrl || ''
    }

    return {
      id: linha.id,
      tipo: linha.tipo,
      nome: linha.nome_arquivo,
      tamanho: linha.tamanho,
      url,
      caminho: linha.arquivo_url,
      dataEnvio: new Date(linha.data_envio).toLocaleDateString('pt-BR'),
    }
  }

  async function carregarDocumentosDoAtleta(idAtleta) {
    setCarregandoDocumentos(true)

    const { data, error } = await supabase
      .from('documentos_atleta')
      .select('*')
      .eq('atleta_id', idAtleta)
      .order('data_envio', { ascending: false })

    if (error) {
      mostrarMensagem('erro', `Erro ao carregar documentos: ${error.message}`)
      setCarregandoDocumentos(false)
      return
    }

    const documentosFormatados = await Promise.all(data.map(documentoDoBanco))

    setDocumentosPorAtleta((documentosAtuais) => ({
      ...documentosAtuais,
      [idAtleta]: documentosFormatados,
    }))
    setCarregandoDocumentos(false)
  }

  function mostrarMensagem(tipo, texto) {
    setMensagemGlobal({ tipo, texto })

    window.clearTimeout(mostrarMensagem.timeoutId)
    mostrarMensagem.timeoutId = window.setTimeout(() => {
      setMensagemGlobal(null)
    }, 4200)
  }

  async function entrar(event) {
    event.preventDefault()
    setEntrando(true)
    setErroLogin('')
    setMensagemLogin('')

    const { error } = await supabase.auth.signInWithPassword({
      email: emailLogin,
      password: senhaLogin,
    })

    if (error) {
      setErroLogin('E-mail ou senha invalidos. Confira os dados e tente novamente.')
      setEntrando(false)
      return
    }

    setEmailLogin('')
    setSenhaLogin('')
    setEntrando(false)
  }

  async function enviarRecuperacaoSenha() {
    setErroLogin('')
    setMensagemLogin('')

    if (!emailLogin) {
      setErroLogin('Informe seu e-mail para receber a recuperacao de senha.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailLogin, {
      redirectTo: window.location.origin,
    })

    if (error) {
      setErroLogin(`Erro ao enviar recuperacao: ${error.message}`)
      return
    }

    setMensagemLogin('Enviamos um e-mail com instrucoes para redefinir sua senha.')
  }

  async function atualizarSenha(event) {
    event.preventDefault()
    setErroLogin('')
    setMensagemLogin('')

    if (novaSenha.length < 6) {
      setErroLogin('A nova senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmacaoNovaSenha) {
      setErroLogin('As senhas nao conferem.')
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    })

    if (error) {
      setErroLogin(`Erro ao atualizar senha: ${error.message}`)
      return
    }

    setNovaSenha('')
    setConfirmacaoNovaSenha('')
    setModoRecuperacaoSenha(false)
    setMensagemGlobal({ tipo: 'sucesso', texto: 'Senha atualizada com sucesso.' })
  }

  async function sair() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      mostrarMensagem('erro', `Erro ao sair: ${error.message}`)
    }
  }

  const totalAtletas = atletas.length
  const totalAtivos = atletas.filter((atleta) => atleta.status === 'Ativo').length
  const posicoes = new Set(atletas.map((atleta) => atleta.posicao)).size

  const atletasPorCategoria = categorias.map((categoria) => {
    return {
      ...categoria,
      total: atletas.filter((atleta) => atleta.categoria === categoria.nome).length,
    }
  })

  const maiorTotalCategoria = Math.max(...atletasPorCategoria.map((categoria) => categoria.total), 1)
  const ultimosCadastros = atletas.slice(0, 5)
  const opcoesCategorias = ['Todas', ...categorias.map((categoria) => categoria.nome)]
  const opcoesPosicoes = ['Todas', ...new Set(atletas.map((atleta) => atleta.posicao))]
  const atletasFiltrados = atletas.filter((atleta) => {
    const nomeEncontrado = atleta.nome.toLowerCase().includes(buscaAtleta.toLowerCase())
    const categoriaEncontrada = categoriaFiltro === 'Todas' || atleta.categoria === categoriaFiltro
    const posicaoEncontrada = posicaoFiltro === 'Todas' || atleta.posicao === posicaoFiltro

    return nomeEncontrado && categoriaEncontrada && posicaoEncontrada
  })
  const atletaSelecionado = atletas.find((atleta) => atleta.id === atletaSelecionadoId)
  const documentosDoAtleta = documentosPorAtleta[atletaSelecionadoId] || []

  useEffect(() => {
    if (telaAtual === 'perfil' && atletaSelecionadoId) {
      carregarDocumentosDoAtleta(atletaSelecionadoId)
    }
  }, [telaAtual, atletaSelecionadoId])

  function abrirTela(nomeTela) {
    setTelaAtual(nomeTela)
  }

  function atualizarFormulario(campo, valor) {
    setFormulario({
      ...formulario,
      [campo]: valor,
    })
  }

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) {
      return ''
    }

    const [dia, mes, ano] = dataNascimento.split('/')

    if (!dia || !mes || !ano) {
      return ''
    }

    const hoje = new Date()
    const nascimento = new Date(Number(ano), Number(mes) - 1, Number(dia))
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mesAindaNaoChegou = hoje.getMonth() < nascimento.getMonth()
    const diaAindaNaoChegou =
      hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate()

    if (mesAindaNaoChegou || diaAindaNaoChegou) {
      idade -= 1
    }

    return idade
  }

  function formatarDataNascimento(valor) {
    const apenasNumeros = valor.replace(/\D/g, '').slice(0, 8)
    const partes = []

    if (apenasNumeros.length > 0) {
      partes.push(apenasNumeros.slice(0, 2))
    }

    if (apenasNumeros.length > 2) {
      partes.push(apenasNumeros.slice(2, 4))
    }

    if (apenasNumeros.length > 4) {
      partes.push(apenasNumeros.slice(4, 8))
    }

    return partes.join('/')
  }

  async function uploadFotoAtleta(idReferencia) {
    if (!formulario.fotoArquivo) {
      return formulario.foto
    }

    const nomeArquivo = `${idReferencia}-${Date.now()}-${limparNomeArquivo(formulario.fotoArquivo.name)}`
    const caminhoArquivo = `atletas/${nomeArquivo}`

    const { error } = await supabase.storage
      .from('fotos-atletas')
      .upload(caminhoArquivo, formulario.fotoArquivo, {
        upsert: true,
      })

    if (error) {
      throw new Error(error.message)
    }

    const { data } = supabase.storage
      .from('fotos-atletas')
      .getPublicUrl(caminhoArquivo)

    return data.publicUrl
  }

  async function uploadPdfCadastro(idReferencia, campoFile, campoUrlAtual) {
    const arquivo = formulario[campoFile]

    if (!arquivo) {
      return formulario[campoUrlAtual]
    }

    const nomeArquivo = `${idReferencia}-${Date.now()}-${limparNomeArquivo(arquivo.name)}`
    const caminhoArquivo = `cadastro/${idReferencia}/${nomeArquivo}`

    const { error } = await supabase.storage
      .from('documentos-atletas')
      .upload(caminhoArquivo, arquivo, {
        upsert: true,
        contentType: arquivo.type,
      })

    if (error) {
      throw new Error(error.message)
    }

    const { data, error: signedUrlError } = await supabase.storage
      .from('documentos-atletas')
      .createSignedUrl(caminhoArquivo, 60 * 60 * 24 * 7)

    if (signedUrlError) {
      throw new Error(signedUrlError.message)
    }

    return data.signedUrl
  }

  function atualizarFotoAtleta(arquivo) {
    if (!arquivo) {
      return
    }

    const leitor = new FileReader()

    leitor.onload = () => {
      setFormulario((formularioAtual) => ({
        ...formularioAtual,
        foto: leitor.result,
        fotoArquivo: arquivo,
      }))
    }

    leitor.readAsDataURL(arquivo)
  }

  async function salvarAtleta(event) {
    event.preventDefault()

    if (!formulario.nome.trim()) {
      mostrarMensagem('erro', 'Informe o nome do atleta.')
      return
    }

    if (!formulario.categoria) {
      mostrarMensagem('erro', 'Selecione a categoria do atleta.')
      return
    }

    if (!formulario.posicao) {
      mostrarMensagem('erro', 'Selecione a posicao do atleta.')
      return
    }

    const idade = calcularIdade(formulario.dataNascimento)
    let fotoUrl = formulario.foto

    try {
      fotoUrl = await uploadFotoAtleta(formulario.id || 'novo')
    } catch (error) {
      mostrarMensagem('erro', `Erro ao enviar foto: ${error.message}`)
      return
    }

    let urlsDocumentosCadastro

    try {
      const idReferencia = formulario.id || 'novo'

      urlsDocumentosCadastro = {
        identidadeArquivoUrl: await uploadPdfCadastro(
          idReferencia,
          'identidadeArquivoFile',
          'identidadeArquivoUrl'
        ),
        certidaoNascimentoArquivoUrl: await uploadPdfCadastro(
          idReferencia,
          'certidaoNascimentoArquivoFile',
          'certidaoNascimentoArquivoUrl'
        ),
        carteiraPlanoSusArquivoUrl: await uploadPdfCadastro(
          idReferencia,
          'carteiraPlanoSusArquivoFile',
          'carteiraPlanoSusArquivoUrl'
        ),
        declaracaoEscolarArquivoUrl: await uploadPdfCadastro(
          idReferencia,
          'declaracaoEscolarArquivoFile',
          'declaracaoEscolarArquivoUrl'
        ),
      }
    } catch (error) {
      mostrarMensagem('erro', `Erro ao enviar documento: ${error.message}`)
      return
    }

    const dadosAtleta = atletaParaBanco(
      {
        ...formulario,
        foto: fotoUrl,
        ...urlsDocumentosCadastro,
      },
      idade
    )

    if (editandoAtleta) {
      const { data, error } = await supabase
        .from('atletas')
        .update(dadosAtleta)
        .eq('id', formulario.id)
        .select()
        .single()

      if (error) {
        mostrarMensagem('erro', `Erro ao editar atleta: ${error.message}`)
        return
      }

      const atletaAtualizado = atletaDoBanco(data)

      setAtletas(
        atletas.map((atleta) => {
          return atleta.id === atletaAtualizado.id ? atletaAtualizado : atleta
        })
      )
    } else {
      const { data, error } = await supabase
        .from('atletas')
        .insert(dadosAtleta)
        .select()
        .single()

      if (error) {
        mostrarMensagem('erro', `Erro ao cadastrar atleta: ${error.message}`)
        return
      }

      setAtletas([atletaDoBanco(data), ...atletas])
    }

    setFormulario(formularioInicial)
    setBuscaAtleta('')
    setCategoriaFiltro('Todas')
    setPosicaoFiltro('Todas')
    setTelaAtual('atletas')
    mostrarMensagem('sucesso', editandoAtleta ? 'Atleta atualizado com sucesso.' : 'Atleta cadastrado com sucesso.')
  }

  function editarAtleta(atleta) {
    setFormulario({
      ...formularioInicial,
      id: atleta.id,
      foto: atleta.foto || '',
      fotoArquivo: null,
      nome: atleta.nome,
      posicao: atleta.posicao,
      categoria: atleta.categoria,
      peDominante: atleta.peDominante || 'Direito',
      altura: atleta.altura || '',
      peso: atleta.peso || '',
      telefone: atleta.telefone || '',
      instagram: atleta.instagram || '',
      facebook: atleta.facebook || '',
      x: atleta.x || '',
      identidadeArquivo: atleta.identidadeArquivo || '',
      identidadeArquivoUrl: atleta.identidadeArquivoUrl || '',
      identidadeArquivoFile: null,
      certidaoNascimentoArquivo: atleta.certidaoNascimentoArquivo || '',
      certidaoNascimentoArquivoUrl: atleta.certidaoNascimentoArquivoUrl || '',
      certidaoNascimentoArquivoFile: null,
      status: atleta.status || 'Ativo',
      responsavel: atleta.responsavel || '',
      telefoneResponsavel: atleta.telefoneResponsavel || '',
      planoSaudeSus: atleta.planoSaudeSus || '',
      carteiraPlanoSusArquivo: atleta.carteiraPlanoSusArquivo || '',
      carteiraPlanoSusArquivoUrl: atleta.carteiraPlanoSusArquivoUrl || '',
      carteiraPlanoSusArquivoFile: null,
      declaracaoEscolarArquivo: atleta.declaracaoEscolarArquivo || '',
      declaracaoEscolarArquivoUrl: atleta.declaracaoEscolarArquivoUrl || '',
      declaracaoEscolarArquivoFile: null,
      clube: atleta.clube || '',
      clubesAnteriores: atleta.clubesAnteriores || '',
      caracteristicasTecnicas: atleta.caracteristicasTecnicas || '',
      caracteristicasFisicas: atleta.caracteristicasFisicas || '',
      observacoesTreinador: atleta.observacoesTreinador || '',
      observacoesGerais: atleta.observacoesGerais || '',
    })
    setTelaAtual('cadastro')
  }

  function verAtleta(atleta) {
    setAtletaSelecionadoId(atleta.id)
    setTelaAtual('perfil')
  }

  function abrirCategoria(categoria) {
    setBuscaAtleta('')
    setCategoriaFiltro(categoria.nome)
    setPosicaoFiltro('Todas')
    setTelaAtual('atletas')
  }

  function novoCadastro() {
    setFormulario(formularioInicial)

    if (fotoAtletaRef.current) {
      fotoAtletaRef.current.value = ''
    }

    setTelaAtual('cadastro')
  }

  async function executarExclusaoAtleta(id) {
    const { error } = await supabase.from('atletas').delete().eq('id', id)

    if (error) {
      mostrarMensagem('erro', `Erro ao excluir atleta: ${error.message}`)
      return
    }

    setAtletas(atletas.filter((atleta) => atleta.id !== id))
    setDocumentosPorAtleta((documentosAtuais) => {
      const { [id]: documentosRemovidos, ...documentosRestantes } = documentosAtuais
      return documentosRestantes
    })
    mostrarMensagem('sucesso', 'Atleta excluido com sucesso.')
  }

  function pedirExclusaoAtleta(atleta) {
    setConfirmacao({
      titulo: 'Excluir atleta',
      texto: `Tem certeza que deseja excluir ${atleta.nome}? Essa acao tambem remove os documentos vinculados.`,
      textoConfirmar: 'Excluir atleta',
      acao: () => executarExclusaoAtleta(atleta.id),
    })
  }

  function atualizarDocumento(campo, valor) {
    setDocumento({
      ...documento,
      [campo]: valor,
    })
  }

  async function adicionarDocumento(event) {
    event.preventDefault()

    if (!atletaSelecionado) {
      return
    }

    if (!documento.arquivo) {
      mostrarMensagem('erro', 'Selecione um arquivo para adicionar.')
      return
    }

    const nomeArquivo = `${atletaSelecionado.id}-${Date.now()}-${limparNomeArquivo(documento.arquivo.name)}`
    const caminhoArquivo = `perfil/${atletaSelecionado.id}/${nomeArquivo}`

    const { error: uploadError } = await supabase.storage
      .from('documentos-atletas')
      .upload(caminhoArquivo, documento.arquivo, {
        upsert: true,
        contentType: documento.arquivo.type,
      })

    if (uploadError) {
      mostrarMensagem('erro', `Erro ao enviar documento: ${uploadError.message}`)
      return
    }

    const { data, error } = await supabase
      .from('documentos_atleta')
      .insert({
        atleta_id: atletaSelecionado.id,
        tipo: documento.tipo,
        nome_arquivo: documento.arquivo.name,
        arquivo_url: caminhoArquivo,
        tamanho: documento.arquivo.size,
      })
      .select()
      .single()

    if (error) {
      mostrarMensagem('erro', `Erro ao salvar documento: ${error.message}`)
      return
    }

    const documentoFormatado = await documentoDoBanco(data)

    setDocumentosPorAtleta({
      ...documentosPorAtleta,
      [atletaSelecionado.id]: [documentoFormatado, ...documentosDoAtleta],
    })
    setDocumento(documentoInicial)

    if (arquivoDocumentoRef.current) {
      arquivoDocumentoRef.current.value = ''
    }
    mostrarMensagem('sucesso', 'Documento adicionado com sucesso.')
  }

  function visualizarDocumento(documentoSelecionado) {
    setDocumentoPreview(documentoSelecionado)
  }

  function prepararArquivoPdf(arquivo, campoNome, campoUrl, campoFile) {
    if (!arquivo) {
      setFormulario((formularioAtual) => ({
        ...formularioAtual,
        [campoNome]: '',
        [campoUrl]: '',
        [campoFile]: null,
      }))
      return
    }

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [campoNome]: arquivo.name,
      [campoUrl]: URL.createObjectURL(arquivo),
      [campoFile]: arquivo,
    }))
  }

  function visualizarArquivoDoCadastro(tipo, nome, url) {
    if (!url) {
      mostrarMensagem('erro', 'Nenhum arquivo foi selecionado para visualizacao.')
      return
    }

    setDocumentoPreview({
      tipo,
      nome,
      url,
    })
  }

  async function executarExclusaoDocumento(idDocumento) {
    if (!atletaSelecionado) {
      return
    }

    const documentoEncontrado = documentosDoAtleta.find((item) => item.id === idDocumento)
    const { error } = await supabase.from('documentos_atleta').delete().eq('id', idDocumento)

    if (error) {
      mostrarMensagem('erro', `Erro ao excluir documento: ${error.message}`)
      return
    }

    if (documentoEncontrado?.caminho) {
      await supabase.storage.from('documentos-atletas').remove([documentoEncontrado.caminho])
    }

    setDocumentosPorAtleta({
      ...documentosPorAtleta,
      [atletaSelecionado.id]: documentosDoAtleta.filter((item) => item.id !== idDocumento),
    })
    mostrarMensagem('sucesso', 'Documento excluido com sucesso.')
  }

  function pedirExclusaoDocumento(documentoItem) {
    setConfirmacao({
      titulo: 'Excluir documento',
      texto: `Tem certeza que deseja excluir ${documentoItem.nome}?`,
      textoConfirmar: 'Excluir documento',
      acao: () => executarExclusaoDocumento(documentoItem.id),
    })
  }

  async function confirmarAcao() {
    if (!confirmacao) {
      return
    }

    const acaoConfirmada = confirmacao.acao
    setConfirmacao(null)
    await acaoConfirmada()
  }

  if (carregandoSessao) {
    return (
      <main className="app app-login">
        <section className="login-card">
          <div className="logo login-logo">BS</div>
          <h1>Base Scout</h1>
          <p>Carregando sessao...</p>
        </section>
      </main>
    )
  }

  if (!sessao) {
    return (
      <main className="app app-login">
        <section className="login-card">
          <div className="logo login-logo">BS</div>

          <h1>Base Scout</h1>
          <p>
            {modoRecuperacaoSenha
              ? 'Defina sua nova senha de acesso.'
              : 'Entre para gerenciar atletas e documentos.'}
          </p>

          {modoRecuperacaoSenha ? (
            <form className="formulario-login" onSubmit={atualizarSenha}>
              <label>
                <span>Nova senha</span>
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={novaSenha}
                  onChange={(event) => {
                    setNovaSenha(event.target.value)
                    setErroLogin('')
                  }}
                  required
                />
              </label>

              <label>
                <span>Confirmar nova senha</span>
                <input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmacaoNovaSenha}
                  onChange={(event) => {
                    setConfirmacaoNovaSenha(event.target.value)
                    setErroLogin('')
                  }}
                  required
                />
              </label>

              {erroLogin && <p className="mensagem-erro-login">{erroLogin}</p>}
              {mensagemLogin && <p className="mensagem-sucesso-login">{mensagemLogin}</p>}

              <button type="submit">Salvar nova senha</button>
            </form>
          ) : (
            <form className="formulario-login" onSubmit={entrar}>
              <label>
                <span>E-mail</span>
                <input
                  type="email"
                  placeholder="coordenador@email.com"
                  value={emailLogin}
                  onChange={(event) => {
                    setEmailLogin(event.target.value)
                    setErroLogin('')
                    setMensagemLogin('')
                  }}
                  required
                />
              </label>

              <label>
                <span>Senha</span>
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={senhaLogin}
                  onChange={(event) => {
                    setSenhaLogin(event.target.value)
                    setErroLogin('')
                    setMensagemLogin('')
                  }}
                  required
                />
              </label>

              {erroLogin && <p className="mensagem-erro-login">{erroLogin}</p>}
              {mensagemLogin && <p className="mensagem-sucesso-login">{mensagemLogin}</p>}

              <button type="submit" disabled={entrando}>
                {entrando ? 'Entrando...' : 'Entrar'}
              </button>

              <button type="button" className="botao-recuperar-senha" onClick={enviarRecuperacaoSenha}>
                Esqueci minha senha
              </button>
            </form>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      {mensagemGlobal && (
        <div className={`mensagem-global ${mensagemGlobal.tipo}`}>
          {mensagemGlobal.texto}
        </div>
      )}

      <header className="barra-superior">
        <div className="marca">
          <div className="logo">BS</div>

          <div>
            <strong>Base Scout</strong>
            <span>GESTAO DE ATLETAS</span>
          </div>
        </div>

        <nav className="menu" aria-label="Navegacao principal">
          <button
            type="button"
            className={telaAtual === 'dashboard' ? 'ativo' : ''}
            onClick={() => abrirTela('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={telaAtual === 'categorias' ? 'ativo' : ''}
            onClick={() => abrirTela('categorias')}
          >
            Categorias
          </button>
          <button
            type="button"
            className={telaAtual === 'atletas' ? 'ativo' : ''}
            onClick={() => abrirTela('atletas')}
          >
            Atletas
          </button>
          <button
            type="button"
            className={telaAtual === 'cadastro' ? 'ativo' : ''}
            onClick={novoCadastro}
          >
            Cadastrar
          </button>
          <button type="button" onClick={sair}>
            Sair
          </button>
        </nav>
      </header>

      {telaAtual === 'dashboard' && (
        <section className="painel">
          <header className="cabecalho-pagina">
            <div>
              <h1>Dashboard</h1>
              <p>Visao geral dos atletas</p>
            </div>

            <button type="button" className="botao-principal" onClick={novoCadastro}>
              Novo Atleta
            </button>
          </header>

          <section className="cards-resumo" aria-label="Resumo geral">
            <article className="card-resumo">
              <div className="icone-resumo verde">AT</div>
              <div>
                <strong>{totalAtletas}</strong>
                <span>Total de Atletas</span>
              </div>
            </article>

            <article className="card-resumo">
              <div className="icone-resumo claro">OK</div>
              <div>
                <strong>{totalAtivos}</strong>
                <span>Ativos</span>
              </div>
            </article>

            <article className="card-resumo">
              <div className="icone-resumo amarelo">CT</div>
              <div>
                <strong>{categorias.length}</strong>
                <span>Categorias</span>
              </div>
            </article>

            <article className="card-resumo">
              <div className="icone-resumo azul">PS</div>
              <div>
                <strong>{posicoes}</strong>
                <span>Posicoes</span>
              </div>
            </article>
          </section>

          <section className="grade-dashboard">
            <article className="card-dashboard">
              <header className="titulo-card">
                <h2>Atletas por Categoria</h2>
              </header>

              <div className="grafico-categorias">
                {atletasPorCategoria.map((categoria) => (
                  <div className="barra-categoria" key={categoria.nome}>
                    <div className="barra-area">
                      <div
                        className="barra-preenchida"
                        style={{ height: `${(categoria.total / maiorTotalCategoria) * 100}%` }}
                      />
                    </div>
                    <strong>{categoria.total}</strong>
                    <span>{categoria.nome}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="card-dashboard">
              <header className="titulo-card linha">
                <h2>Ultimos Cadastros</h2>
                <button type="button" className="botao-link">Ver todos</button>
              </header>

              <div className="lista-recentes">
                {ultimosCadastros.map((atleta) => (
                  <article className="atleta-recente" key={atleta.id}>
                    <div className="avatar">
                      {atleta.foto ? <img src={atleta.foto} alt={atleta.nome} /> : 'P'}
                    </div>

                    <div className="info-atleta">
                      <strong>{atleta.nome}</strong>
                      <div>
                        <span className="tag">{atleta.posicao}</span>
                        <span className="tag categoria">{atleta.categoria}</span>
                      </div>
                    </div>

                    <time>{atleta.dataCadastro}</time>
                  </article>
                ))}
              </div>
            </article>
          </section>
        </section>
      )}

      {telaAtual === 'categorias' && (
        <section className="painel">
          <header className="cabecalho-pagina">
            <div>
              <h1>Categorias</h1>
            </div>
          </header>

          <section className="grade-categorias" aria-label="Categorias cadastradas">
            {atletasPorCategoria.map((categoria) => (
              <article className={`card-categoria ${categoria.cor}`} key={categoria.nome}>
                <div className="icone-categoria">CT</div>

                <div>
                  <strong>{categoria.nome}</strong>
                  <span>
                    {categoria.total} {categoria.total === 1 ? 'atleta' : 'atletas'}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={`Abrir categoria ${categoria.nome}`}
                  onClick={() => abrirCategoria(categoria)}
                >
                  ›
                </button>
              </article>
            ))}
          </section>
        </section>
      )}

      {telaAtual === 'atletas' && (
        <section className="painel">
          <header className="cabecalho-pagina">
            <div>
              <h1>Atletas</h1>
            </div>

            <button type="button" className="botao-principal" onClick={novoCadastro}>
              Cadastrar
            </button>
          </header>

          <section className="filtros-atletas" aria-label="Filtros de atletas">
            <label className="campo-filtro">
              <span>Buscar</span>
              <input
                type="search"
                placeholder="Buscar por nome..."
                value={buscaAtleta}
                onChange={(event) => setBuscaAtleta(event.target.value)}
              />
            </label>

            <label className="campo-filtro">
              <span>Categoria</span>
              <select
                value={categoriaFiltro}
                onChange={(event) => setCategoriaFiltro(event.target.value)}
              >
                {opcoesCategorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </label>

            <label className="campo-filtro">
              <span>Posicao</span>
              <select
                value={posicaoFiltro}
                onChange={(event) => setPosicaoFiltro(event.target.value)}
              >
                {opcoesPosicoes.map((posicao) => (
                  <option key={posicao} value={posicao}>
                    {posicao}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="grade-atletas" aria-label="Atletas cadastrados">
            {carregandoAtletas && (
              <div className="estado-lista">Carregando atletas...</div>
            )}

            {!carregandoAtletas && atletasFiltrados.length === 0 && (
              <div className="estado-lista">Nenhum atleta encontrado.</div>
            )}

            {!carregandoAtletas && atletasFiltrados.map((atleta) => (
              <article className="card-atleta" key={atleta.id}>
                <div className="foto-atleta">
                  {atleta.foto ? <img src={atleta.foto} alt={atleta.nome} /> : 'P'}
                </div>

                <div className="conteudo-atleta">
                  <h2>{atleta.nome}</h2>

                  <div className="badges-atleta">
                    <span className="tag">{atleta.posicao}</span>
                    <span className="tag categoria">{atleta.categoria}</span>
                    <span className="tag idade">{atleta.idade} anos</span>
                  </div>

                  <p>{atleta.clube}</p>

                  <div className="acoes-atleta">
                    <button type="button" className="botao-mini destaque" onClick={() => verAtleta(atleta)}>
                      Ver
                    </button>
                    <button type="button" className="botao-mini" onClick={() => editarAtleta(atleta)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="botao-excluir"
                      onClick={() => pedirExclusaoAtleta(atleta)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </section>
      )}

      {telaAtual === 'cadastro' && (
        <section className="painel painel-formulario">
          <header className="cabecalho-cadastro">
            <button type="button" className="botao-voltar" onClick={() => abrirTela('atletas')}>
              ‹
            </button>

            <div>
              <h1>{editandoAtleta ? 'Editar Atleta' : 'Cadastrar Atleta'}</h1>
              <p>
                {editandoAtleta
                  ? 'Atualize os dados do atleta'
                  : 'Preencha os dados do novo atleta'}
              </p>
            </div>
          </header>

          <form className="formulario-cadastro" onSubmit={salvarAtleta}>
            <section className="secao-formulario">
              <h2>Foto do Atleta</h2>

              <div className="area-foto">
                <div className="preview-foto">
                  {formulario.foto ? <img src={formulario.foto} alt="Previa do atleta" /> : 'P'}
                </div>

                <div>
                  <label className="botao-upload" htmlFor="foto-atleta">
                    Escolher foto
                  </label>
                  <input
                    ref={fotoAtletaRef}
                    id="foto-atleta"
                    className="input-arquivo-escondido"
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(event) => atualizarFotoAtleta(event.target.files[0])}
                  />
                  <p>JPG, PNG. Max 5MB.</p>
                </div>
              </div>
            </section>

            <section className="secao-formulario">
              <h2>Dados Pessoais</h2>

              <div className="grade-formulario-cadastro">
                <label className="campo-formulario campo-inteiro">
                  <span>Nome Completo *</span>
                  <input
                    type="text"
                    placeholder="Nome completo do atleta"
                    value={formulario.nome}
                    onChange={(event) => atualizarFormulario('nome', event.target.value)}
                  />
                </label>

                <label className="campo-formulario">
                  <span>Data de Nascimento *</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/aaaa"
                    value={formulario.dataNascimento}
                    onChange={(event) =>
                      atualizarFormulario('dataNascimento', formatarDataNascimento(event.target.value))
                    }
                  />
                </label>

                <label className="campo-formulario">
                  <span>Posicao *</span>
                  <select
                    value={formulario.posicao}
                    onChange={(event) => atualizarFormulario('posicao', event.target.value)}
                  >
                    <option value="" disabled>Selecione</option>
                    <option>Goleiro</option>
                    <option>Fixo</option>
                    <option>Ala</option>
                    <option>Pivo</option>
                    <option>Universal</option>
                  </select>
                </label>

                <label className="campo-formulario">
                  <span>Categoria *</span>
                  <select
                    value={formulario.categoria}
                    onChange={(event) => atualizarFormulario('categoria', event.target.value)}
                  >
                    <option value="" disabled>Selecione</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.nome}>{categoria.nome}</option>
                    ))}
                  </select>
                </label>

                <label className="campo-formulario">
                  <span>Pe Dominante</span>
                  <select
                    value={formulario.peDominante}
                    onChange={(event) => atualizarFormulario('peDominante', event.target.value)}
                  >
                    <option>Direito</option>
                    <option>Esquerdo</option>
                    <option>Ambos</option>
                  </select>
                </label>

                <label className="campo-formulario">
                  <span>Altura (cm)</span>
                  <input
                    type="number"
                    placeholder="170"
                    value={formulario.altura}
                    onChange={(event) => atualizarFormulario('altura', event.target.value)}
                  />
                </label>

                <label className="campo-formulario">
                  <span>Peso (kg)</span>
                  <input
                    type="number"
                    placeholder="65"
                    value={formulario.peso}
                    onChange={(event) => atualizarFormulario('peso', event.target.value)}
                  />
                </label>

                <label className="campo-formulario">
                  <span>Telefone</span>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formulario.telefone}
                    onChange={(event) => atualizarFormulario('telefone', event.target.value)}
                  />
                </label>

                <label className="campo-formulario">
                  <span>Status</span>
                  <select
                    value={formulario.status}
                    onChange={(event) => atualizarFormulario('status', event.target.value)}
                  >
                    <option>Ativo</option>
                    <option>Inativo</option>
                    <option>Em avaliacao</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="secao-formulario">
              <h2>Documentos Pessoais</h2>

              <div className="grade-formulario-cadastro">
                <label className="campo-formulario campo-inteiro">
                  <span>Identidade do atleta em PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) =>
                      prepararArquivoPdf(
                        event.target.files[0],
                        'identidadeArquivo',
                        'identidadeArquivoUrl',
                        'identidadeArquivoFile'
                      )
                    }
                  />
                  {formulario.identidadeArquivo && (
                    <div className="linha-arquivo-selecionado">
                      <small className="arquivo-selecionado">
                        Arquivo selecionado: {formulario.identidadeArquivo}
                      </small>
                      <button
                        type="button"
                        className="botao-mini"
                        onClick={() =>
                          visualizarArquivoDoCadastro(
                            'Identidade do atleta',
                            formulario.identidadeArquivo,
                            formulario.identidadeArquivoUrl
                          )
                        }
                      >
                        Visualizar
                      </button>
                    </div>
                  )}
                </label>

                <label className="campo-formulario campo-inteiro">
                  <span>Certidao de nascimento do atleta em PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) =>
                      prepararArquivoPdf(
                        event.target.files[0],
                        'certidaoNascimentoArquivo',
                        'certidaoNascimentoArquivoUrl',
                        'certidaoNascimentoArquivoFile'
                      )
                    }
                  />
                  {formulario.certidaoNascimentoArquivo && (
                    <div className="linha-arquivo-selecionado">
                      <small className="arquivo-selecionado">
                        Arquivo selecionado: {formulario.certidaoNascimentoArquivo}
                      </small>
                      <button
                        type="button"
                        className="botao-mini"
                        onClick={() =>
                          visualizarArquivoDoCadastro(
                            'Certidao de nascimento',
                            formulario.certidaoNascimentoArquivo,
                            formulario.certidaoNascimentoArquivoUrl
                          )
                        }
                      >
                        Visualizar
                      </button>
                    </div>
                  )}
                </label>
              </div>
            </section>

            <section className="secao-formulario">
              <h2>Redes Sociais</h2>

              <div className="grade-formulario-cadastro">
                <label className="campo-formulario">
                  <span>Instagram</span>
                  <input
                    type="text"
                    placeholder="@usuario"
                    value={formulario.instagram}
                    onChange={(event) => atualizarFormulario('instagram', event.target.value)}
                  />
                </label>

                <label className="campo-formulario">
                  <span>Facebook</span>
                  <input
                    type="text"
                    placeholder="Nome ou link do perfil"
                    value={formulario.facebook}
                    onChange={(event) => atualizarFormulario('facebook', event.target.value)}
                  />
                </label>

                <label className="campo-formulario campo-inteiro">
                  <span>X</span>
                  <input
                    type="text"
                    placeholder="@usuario ou link do perfil"
                    value={formulario.x}
                    onChange={(event) => atualizarFormulario('x', event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="secao-formulario">
              <h2>Responsavel</h2>

              <div className="grade-formulario-cadastro">
                <label className="campo-formulario">
                  <span>Nome do Responsavel</span>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={formulario.responsavel}
                    onChange={(event) => atualizarFormulario('responsavel', event.target.value)}
                  />
                </label>

                <label className="campo-formulario">
                  <span>Telefone do Responsavel</span>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formulario.telefoneResponsavel}
                    onChange={(event) => atualizarFormulario('telefoneResponsavel', event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="secao-formulario">
              <h2>Parte Medica</h2>

              <div className="grade-formulario-cadastro">
                <label className="campo-formulario campo-inteiro">
                  <span>Plano de saude ou SUS</span>
                  <input
                    type="text"
                    placeholder="Nome do plano, numero da carteirinha ou SUS"
                    value={formulario.planoSaudeSus}
                    onChange={(event) => atualizarFormulario('planoSaudeSus', event.target.value)}
                  />
                </label>

                <label className="campo-formulario campo-inteiro">
                  <span>Carteira do plano de saude ou SUS em PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) =>
                      prepararArquivoPdf(
                        event.target.files[0],
                        'carteiraPlanoSusArquivo',
                        'carteiraPlanoSusArquivoUrl',
                        'carteiraPlanoSusArquivoFile'
                      )
                    }
                  />
                  {formulario.carteiraPlanoSusArquivo && (
                    <div className="linha-arquivo-selecionado">
                      <small className="arquivo-selecionado">
                        Arquivo selecionado: {formulario.carteiraPlanoSusArquivo}
                      </small>
                      <button
                        type="button"
                        className="botao-mini"
                        onClick={() =>
                          visualizarArquivoDoCadastro(
                            'Carteira do plano/SUS',
                            formulario.carteiraPlanoSusArquivo,
                            formulario.carteiraPlanoSusArquivoUrl
                          )
                        }
                      >
                        Visualizar
                      </button>
                    </div>
                  )}
                </label>
              </div>
            </section>

            <section className="secao-formulario">
              <h2>Declaracao Escolar</h2>

              <div className="grade-formulario-cadastro">
                <label className="campo-formulario campo-inteiro">
                  <span>Documento em PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) =>
                      prepararArquivoPdf(
                        event.target.files[0],
                        'declaracaoEscolarArquivo',
                        'declaracaoEscolarArquivoUrl',
                        'declaracaoEscolarArquivoFile'
                      )
                    }
                  />
                  {formulario.declaracaoEscolarArquivo && (
                    <div className="linha-arquivo-selecionado">
                      <small className="arquivo-selecionado">
                        Arquivo selecionado: {formulario.declaracaoEscolarArquivo}
                      </small>
                      <button
                        type="button"
                        className="botao-mini"
                        onClick={() =>
                          visualizarArquivoDoCadastro(
                            'Declaracao escolar',
                            formulario.declaracaoEscolarArquivo,
                            formulario.declaracaoEscolarArquivoUrl
                          )
                        }
                      >
                        Visualizar
                      </button>
                    </div>
                  )}
                </label>
              </div>
            </section>

            <section className="secao-formulario">
              <h2>Dados Esportivos</h2>

              <div className="grade-formulario-cadastro">
                <label className="campo-formulario campo-inteiro">
                  <span>Clube Atual</span>
                  <input
                    type="text"
                    placeholder="Nome do clube"
                    value={formulario.clube}
                    onChange={(event) => atualizarFormulario('clube', event.target.value)}
                  />
                </label>

                <label className="campo-formulario campo-inteiro">
                  <span>Clubes Anteriores</span>
                  <textarea
                    placeholder="Liste os clubes anteriores"
                    rows="3"
                    value={formulario.clubesAnteriores}
                    onChange={(event) => atualizarFormulario('clubesAnteriores', event.target.value)}
                  />
                </label>

                <label className="campo-formulario campo-inteiro">
                  <span>Caracteristicas Tecnicas</span>
                  <textarea
                    placeholder="Passe curto, finalizacao, drible..."
                    rows="3"
                    value={formulario.caracteristicasTecnicas}
                    onChange={(event) => atualizarFormulario('caracteristicasTecnicas', event.target.value)}
                  />
                </label>

                <label className="campo-formulario campo-inteiro">
                  <span>Caracteristicas Fisicas</span>
                  <textarea
                    placeholder="Velocidade, resistencia, forca..."
                    rows="3"
                    value={formulario.caracteristicasFisicas}
                    onChange={(event) => atualizarFormulario('caracteristicasFisicas', event.target.value)}
                  />
                </label>

                <label className="campo-formulario campo-inteiro">
                  <span>Observacoes do Treinador</span>
                  <textarea
                    placeholder="Notas e avaliacoes"
                    rows="4"
                    value={formulario.observacoesTreinador}
                    onChange={(event) => atualizarFormulario('observacoesTreinador', event.target.value)}
                  />
                </label>

                <label className="campo-formulario campo-inteiro">
                  <span>Observacoes Gerais</span>
                  <textarea
                    placeholder="Informacoes adicionais"
                    rows="3"
                    value={formulario.observacoesGerais}
                    onChange={(event) => atualizarFormulario('observacoesGerais', event.target.value)}
                  />
                </label>
              </div>
            </section>

            <button type="submit" className="botao-salvar-grande">
              {editandoAtleta ? 'Salvar Alteracoes' : 'Salvar Atleta'}
            </button>
          </form>
        </section>
      )}

      {telaAtual === 'perfil' && atletaSelecionado && (
        <section className="painel painel-formulario">
          <header className="cabecalho-cadastro">
            <button type="button" className="botao-voltar" onClick={() => abrirTela('atletas')}>
              ‹
            </button>

            <div>
              <h1>Perfil do Atleta</h1>
              <p>Informacoes completas do cadastro</p>
            </div>
          </header>

          <section className="perfil-topo">
            <div className="perfil-foto">
              {atletaSelecionado.foto ? (
                <img src={atletaSelecionado.foto} alt={atletaSelecionado.nome} />
              ) : (
                'P'
              )}
            </div>

            <div className="perfil-identidade">
              <h2>{atletaSelecionado.nome}</h2>

              <div className="badges-atleta">
                <span className="tag">{atletaSelecionado.posicao}</span>
                <span className="tag categoria">{atletaSelecionado.categoria}</span>
                {atletaSelecionado.idade !== '' && (
                  <span className="tag idade">{atletaSelecionado.idade} anos</span>
                )}
              </div>

              <p>{atletaSelecionado.clube}</p>
            </div>

            <button type="button" className="botao-principal" onClick={() => editarAtleta(atletaSelecionado)}>
              Editar
            </button>
          </section>

          <section className="secao-formulario">
            <h2>Dados Pessoais</h2>

            <div className="grade-detalhes">
              <div>
                <span>Status</span>
                <strong>{atletaSelecionado.status || 'Nao informado'}</strong>
              </div>

              <div>
                <span>Pe dominante</span>
                <strong>{atletaSelecionado.peDominante || 'Nao informado'}</strong>
              </div>

              <div>
                <span>Altura</span>
                <strong>{atletaSelecionado.altura ? `${atletaSelecionado.altura} cm` : 'Nao informado'}</strong>
              </div>

              <div>
                <span>Peso</span>
                <strong>{atletaSelecionado.peso ? `${atletaSelecionado.peso} kg` : 'Nao informado'}</strong>
              </div>

              <div>
                <span>Telefone</span>
                <strong>{atletaSelecionado.telefone || 'Nao informado'}</strong>
              </div>

              <div>
                <span>Cadastro</span>
                <strong>{atletaSelecionado.dataCadastro}</strong>
              </div>
            </div>
          </section>

          <section className="secao-formulario">
            <h2>Documentos Pessoais</h2>

            <div className="grade-detalhes">
              <div>
                <span>Identidade do atleta</span>
                <strong>{atletaSelecionado.identidadeArquivo || 'Nenhum arquivo informado'}</strong>
                {atletaSelecionado.identidadeArquivoUrl && (
                  <button
                    type="button"
                    className="botao-mini botao-detalhe"
                    onClick={() =>
                      visualizarArquivoDoCadastro(
                        'Identidade do atleta',
                        atletaSelecionado.identidadeArquivo,
                        atletaSelecionado.identidadeArquivoUrl
                      )
                    }
                  >
                    Visualizar
                  </button>
                )}
              </div>

              <div>
                <span>Certidao de nascimento</span>
                <strong>{atletaSelecionado.certidaoNascimentoArquivo || 'Nenhum arquivo informado'}</strong>
                {atletaSelecionado.certidaoNascimentoArquivoUrl && (
                  <button
                    type="button"
                    className="botao-mini botao-detalhe"
                    onClick={() =>
                      visualizarArquivoDoCadastro(
                        'Certidao de nascimento',
                        atletaSelecionado.certidaoNascimentoArquivo,
                        atletaSelecionado.certidaoNascimentoArquivoUrl
                      )
                    }
                  >
                    Visualizar
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="secao-formulario">
            <h2>Redes Sociais</h2>

            <div className="grade-detalhes">
              <div>
                <span>Instagram</span>
                <strong>{atletaSelecionado.instagram || 'Nao informado'}</strong>
              </div>

              <div>
                <span>Facebook</span>
                <strong>{atletaSelecionado.facebook || 'Nao informado'}</strong>
              </div>

              <div>
                <span>X</span>
                <strong>{atletaSelecionado.x || 'Nao informado'}</strong>
              </div>
            </div>
          </section>

          <section className="secao-formulario">
            <h2>Responsavel</h2>

            <div className="grade-detalhes">
              <div>
                <span>Nome</span>
                <strong>{atletaSelecionado.responsavel || 'Nao informado'}</strong>
              </div>

              <div>
                <span>Telefone</span>
                <strong>{atletaSelecionado.telefoneResponsavel || 'Nao informado'}</strong>
              </div>
            </div>
          </section>

          <section className="secao-formulario">
            <h2>Parte Medica</h2>

            <div className="grade-detalhes">
              <div>
                <span>Plano de saude ou SUS</span>
                <strong>{atletaSelecionado.planoSaudeSus || 'Nao informado'}</strong>
              </div>

              <div>
                <span>Carteira do plano/SUS</span>
                <strong>{atletaSelecionado.carteiraPlanoSusArquivo || 'Nenhum arquivo informado'}</strong>
                {atletaSelecionado.carteiraPlanoSusArquivoUrl && (
                  <button
                    type="button"
                    className="botao-mini botao-detalhe"
                    onClick={() =>
                      visualizarArquivoDoCadastro(
                        'Carteira do plano/SUS',
                        atletaSelecionado.carteiraPlanoSusArquivo,
                        atletaSelecionado.carteiraPlanoSusArquivoUrl
                      )
                    }
                  >
                    Visualizar
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="secao-formulario">
            <h2>Declaracao Escolar</h2>

            <div className="grade-detalhes">
              <div>
                <span>Documento em PDF</span>
                <strong>{atletaSelecionado.declaracaoEscolarArquivo || 'Nenhum arquivo informado'}</strong>
                {atletaSelecionado.declaracaoEscolarArquivoUrl && (
                  <button
                    type="button"
                    className="botao-mini botao-detalhe"
                    onClick={() =>
                      visualizarArquivoDoCadastro(
                        'Declaracao escolar',
                        atletaSelecionado.declaracaoEscolarArquivo,
                        atletaSelecionado.declaracaoEscolarArquivoUrl
                      )
                    }
                  >
                    Visualizar
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="secao-formulario">
            <h2>Dados Esportivos</h2>

            <div className="lista-observacoes">
              <div>
                <span>Clubes anteriores</span>
                <p>{atletaSelecionado.clubesAnteriores || 'Nenhuma informacao cadastrada.'}</p>
              </div>

              <div>
                <span>Caracteristicas tecnicas</span>
                <p>{atletaSelecionado.caracteristicasTecnicas || 'Nenhuma informacao cadastrada.'}</p>
              </div>

              <div>
                <span>Caracteristicas fisicas</span>
                <p>{atletaSelecionado.caracteristicasFisicas || 'Nenhuma informacao cadastrada.'}</p>
              </div>

              <div>
                <span>Observacoes do treinador</span>
                <p>{atletaSelecionado.observacoesTreinador || 'Nenhuma informacao cadastrada.'}</p>
              </div>

              <div>
                <span>Observacoes gerais</span>
                <p>{atletaSelecionado.observacoesGerais || 'Nenhuma informacao cadastrada.'}</p>
              </div>
            </div>
          </section>

          <section className="secao-formulario">
            <header className="cabecalho-secao">
              <div>
                <h2>Documentos</h2>
                <p>{documentosDoAtleta.length} documentos cadastrados</p>
              </div>
            </header>

            <form className="formulario-documento" onSubmit={adicionarDocumento}>
              <label className="campo-formulario">
                <span>Tipo do documento</span>
                <select
                  value={documento.tipo}
                  onChange={(event) => atualizarDocumento('tipo', event.target.value)}
                >
                  {tiposDocumento.map((tipo) => (
                    <option key={tipo}>{tipo}</option>
                  ))}
                </select>
              </label>

              <label className="campo-formulario">
                <span>Arquivo</span>
                <input
                  ref={arquivoDocumentoRef}
                  type="file"
                  onChange={(event) => atualizarDocumento('arquivo', event.target.files[0])}
                />
              </label>

              <button type="submit" className="botao-principal">
                Adicionar Documento
              </button>
            </form>

            {carregandoDocumentos ? (
              <div className="estado-vazio-documentos">
                Carregando documentos...
              </div>
            ) : documentosDoAtleta.length === 0 ? (
              <div className="estado-vazio-documentos">
                Nenhum documento cadastrado para este atleta.
              </div>
            ) : (
              <div className="lista-documentos">
                {documentosDoAtleta.map((item) => (
                  <article
                    className="documento-item"
                    key={item.id}
                    onClick={() => visualizarDocumento(item)}
                    role="button"
                    tabIndex="0"
                  >
                    <div>
                      <strong>{item.tipo}</strong>
                      <span>{item.nome}</span>
                      <small>Enviado em {item.dataEnvio}</small>
                    </div>

                    <div className="acoes-documento">
                      <button type="button" onClick={(event) => {
                        event.stopPropagation()
                        visualizarDocumento(item)
                      }}>
                        Visualizar
                      </button>
                      <button type="button" className="botao-excluir" onClick={(event) => {
                        event.stopPropagation()
                        pedirExclusaoDocumento(item)
                      }}>
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      )}

      {documentoPreview && (
        <section className="modal-documento" role="dialog" aria-modal="true">
          <div className="conteudo-modal-documento">
            <header>
              <div>
                <h2>{documentoPreview.tipo}</h2>
                <p>{documentoPreview.nome}</p>
              </div>

              <button type="button" onClick={() => setDocumentoPreview(null)}>
                Fechar
              </button>
            </header>

            <iframe src={documentoPreview.url} title={documentoPreview.nome} />
          </div>
        </section>
      )}

      {confirmacao && (
        <section className="modal-confirmacao" role="dialog" aria-modal="true">
          <div className="conteudo-modal-confirmacao">
            <h2>{confirmacao.titulo}</h2>
            <p>{confirmacao.texto}</p>

            <div className="acoes-confirmacao">
              <button type="button" className="botao-cancelar" onClick={() => setConfirmacao(null)}>
                Cancelar
              </button>
              <button type="button" className="botao-confirmar-exclusao" onClick={confirmarAcao}>
                {confirmacao.textoConfirmar}
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
