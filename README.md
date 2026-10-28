# Base Scout

Aplicação para organizar atletas de categorias de base, com dashboard, filtros, perfis e documentos. Desenvolvida em React, Vite e Supabase.

**[Explorar demonstração pública](https://base-scout-sigma.vercel.app/?demo=1)** · [Acesso da equipe](https://base-scout-sigma.vercel.app/)

## Demonstração de portfólio

A demonstração permite navegar pelo dashboard, categorias, lista com busca e filtros e perfis resumidos. Usa exclusivamente registros fictícios incluídos no código. Não consulta o Supabase, não solicita documentos e não permite criar ou alterar cadastros.

O ambiente administrativo é separado e exige conta autorizada. Atualmente, o projeto Supabase associado está inativo; por isso, o funcionamento da área administrativa e suas políticas de acesso precisam ser verificados antes do uso real.

## Recursos do aplicativo

- Login e recuperação de senha com Supabase Auth.
- Indicadores e listagem por categoria e posição.
- Cadastro e edição de atletas, fotos e documentos na área restrita.
- Interface responsiva e instalável como aplicativo web.

## Executar localmente

Requer Node.js compatível com a versão do Vite definida em `package.json` e um projeto Supabase configurado.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Preencha em `.env.local` a URL e a **chave publicável** do seu projeto Supabase. Essas variáveis são expostas ao navegador; nunca coloque `service_role`, chave secreta ou senha de banco nelas. O arquivo local não deve ser versionado.

Para testar a demonstração sem Supabase, abra `http://localhost:5173/?demo=1` após iniciar o servidor. Para verificar o código:

```bash
npm run lint
npm run build
```

## Segurança e privacidade

O cadastro inclui informações pessoais de atletas e responsáveis. Antes de usar com pessoas reais, confirme RLS, permissões das tabelas e políticas dos buckets no Supabase; também revise o acesso a fotos e documentos. A tela de login por si só não protege a API. Não use registros reais em screenshots públicos.

## Autor

Desenvolvido por [Victor Hugo Corrêa](https://github.com/CorreaVictorHugo).
