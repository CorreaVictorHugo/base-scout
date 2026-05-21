# Guia de Operacao - Base Scout

Este guia contem os passos mais importantes para operar, testar e manter o app Base Scout.

## Link do app publicado

App em producao:

```txt
https://base-scout-sigma.vercel.app
```

## Rodar o app no computador

Abra o PowerShell na pasta do projeto:

```powershell
cd "C:\Users\Victor Hugo\Documents\New project 2"
```

Para rodar apenas no PC:

```powershell
npm run dev
```

Abra:

```txt
http://localhost:5173
```

## Rodar no celular pela mesma rede

Use:

```powershell
npm run dev -- --host 0.0.0.0
```

O terminal vai mostrar uma linha parecida com:

```txt
Network: http://192.168.1.47:5173/
```

Abra esse endereco no navegador do celular.

Importante:

- computador e celular precisam estar no mesmo Wi-Fi;
- nao use `localhost` no celular;
- se nao abrir, verificar Firewall do Windows.

## Instalar no celular como app

Abra no celular:

```txt
https://base-scout-sigma.vercel.app
```

No Android/Chrome:

```txt
Menu > Instalar app
```

No iPhone/Safari:

```txt
Compartilhar > Adicionar a Tela de Inicio
```

## Criar usuario/coordenador no Supabase

1. Abra o Supabase.
2. Entre no projeto `base-scout`.
3. Va em:

```txt
Authentication > Users
```

4. Clique em:

```txt
Add user
```

ou:

```txt
Create user
```

5. Preencha:

```txt
Email: email do coordenador
Password: senha inicial
```

6. Se houver opcao, marque:

```txt
Auto confirm user
```

ou confirme o e-mail do usuario manualmente.

7. Salve/crie o usuario.

Depois disso, o coordenador pode entrar no app usando esse e-mail e senha.

## Redefinir senha de um usuario

Opcao pelo app:

1. Abra a tela de login.
2. Digite o e-mail.
3. Clique em:

```txt
Esqueci minha senha
```

4. O Supabase envia um e-mail de recuperacao.

Opcao pelo Supabase:

1. Va em:

```txt
Authentication > Users
```

2. Clique no usuario.
3. Use a opcao de enviar link de recuperacao ou alterar senha, se disponivel.

## Configurar URLs no Supabase

No Supabase, va em:

```txt
Authentication > URL Configuration
```

Site URL:

```txt
https://base-scout-sigma.vercel.app
```

Redirect URLs:

```txt
https://base-scout-sigma.vercel.app
http://localhost:5173
```

Durante testes pelo celular na rede local, pode adicionar tambem:

```txt
http://SEU_IP_LOCAL:5173
```

Exemplo:

```txt
http://192.168.1.47:5173
```

## Subir alteracoes para GitHub e Vercel

Depois de alterar o codigo:

```powershell
git status
git add .
git commit -m "descricao da alteracao"
git push
```

A Vercel faz o deploy automaticamente depois do push para a branch `main`.

## Variaveis de ambiente

No arquivo local `.env.local`:

```env
VITE_SUPABASE_URL=https://xhmqxttatxfdvwmftyut.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key
```

Na Vercel, configurar as mesmas variaveis em:

```txt
Project Settings > Environment Variables
```

Nunca usar no frontend:

```txt
service_role key
secret key
database password
```

## Buckets do Supabase Storage

Buckets usados:

```txt
fotos-atletas
documentos-atletas
```

Uso:

- `fotos-atletas`: fotos dos atletas;
- `documentos-atletas`: PDFs e documentos dos atletas.

## Tabelas principais

Tabelas usadas:

```txt
atletas
documentos_atleta
```

`atletas` guarda os dados principais do atleta.

`documentos_atleta` guarda documentos adicionados no perfil do atleta.

## Checklist para testar antes de apresentar

1. Abrir o app publicado no celular.
2. Fazer login.
3. Cadastrar atleta com foto.
4. Editar atleta.
5. Abrir perfil.
6. Adicionar documento PDF.
7. Visualizar documento PDF.
8. Filtrar por categoria.
9. Abrir atleta pela aba Categorias.
10. Excluir documento de teste.
11. Sair e entrar novamente.

## Observacoes importantes

- O app publicado funciona fora da rede do trabalho.
- O app local com `localhost` so funciona no computador.
- Para celular na mesma rede, usar o endereco `Network` do Vite.
- Para mostrar ao cliente na rua, usar o link da Vercel.
- Usuarios devem ser criados no Supabase Auth.
- Dados e documentos reais ficam no Supabase.
