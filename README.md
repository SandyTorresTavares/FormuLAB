# 🧪 FormuLab

O **FormuLab** é uma aplicação web desenvolvida para a centralização, organização e consulta rápida de informações sobre formulações químicas e produtos de limpeza.

A interface foi projetada para proporcionar uma experiência intuitiva na pesquisa de matérias-primas, consulta de dosagens, gerenciamento de formulações e acompanhamento do histórico de alterações.

> 🎓 Projeto desenvolvido no âmbito da disciplina **Projeto Integrador II — UNIVESP**.

---

## 🎯 Funcionalidades

### 📥 Cadastro de Formulações

- Cadastro de novas formulações;
- Importação de arquivos **PDF**, **Excel (`.xlsx`, `.csv`)** e **Imagens (`.png`, `.jpg`)**;
- Pré-visualização, mapeamento de colunas e importação revisada de planilhas;
- Registro de composição, dosagens e orientações técnicas.

### 🔍 Busca de Formulações

Sistema de pesquisa com filtros para facilitar a localização das formulações por:

- Ingrediente / Matéria-prima;
- Nome do produto;
- Laboratório;
- Tipo de arquivo.

### ✏️ Gerenciamento de Formulações

- Visualização das formulações cadastradas;
- Edição de informações;
- Atualização dos dados;
- Remoção de registros.

### 📜 Histórico de Alterações

Visualização das alterações realizadas nas formulações, permitindo acompanhar:

- Data da alteração;
- Responsável;
- Informações modificadas;
- Histórico de versões.

---

## 🛠️ Tecnologias

- **React** — desenvolvimento da interface e componentes;
- **Vite** — ambiente de desenvolvimento e build;
- **Tailwind CSS** — estilização e responsividade;
- **Lucide React** — biblioteca de ícones.
- **Node.js, Express e MongoDB** — API e persistência das formulações.

Veja o [diagrama de arquitetura](docs/arquitetura.md) para os componentes e
fluxos de dados da aplicação.

---

## 🚀 Backend local (Node.js + MongoDB Atlas)

O backend fica na pasta `backend/` e oferece uma API REST para cadastrar, listar,
consultar, editar e excluir formulações, além de receber PDFs e imagens PNG/JPEG
de até 10 MB. O backend extrai texto selecionável de PDFs e usa OCR local em
português e inglês em imagens e páginas escaneadas. Os arquivos são salvos
localmente em `backend/uploads/`; seus metadados e, depois da revisão, as páginas
selecionadas são registrados no MongoDB. Após preencher e confirmar os campos da
formulação, ela é salva na coleção de formulações e aparece nas abas de busca e
gerenciamento. O arquivo não fica acessível por uma rota pública.

### Pré-requisitos

- Node.js instalado (versão LTS);
- Um cluster MongoDB Atlas;
- O endereço de conexão do cluster e as credenciais do usuário do banco.

### Configuração

1. No terminal, abra a pasta `backend`:

   ```powershell
   cd backend
   ```

2. Instale as dependências:

   ```powershell
   npm.cmd install
   ```

3. Copie `.env.example` para `.env` e substitua `MONGODB_URI` pelo endereço de
   conexão do seu cluster. Troque também `<db_password>` pela senha do usuário
   do banco. Se a senha tiver caracteres especiais, use a versão codificada
   indicada pelo MongoDB Atlas.

   **Nunca compartilhe nem publique o arquivo `.env`.** Ele contém credenciais.

4. No arquivo `backend/.env`, defina `SESSION_SECRET` com um segredo aleatório
   de pelo menos 32 caracteres. Para gerar um no PowerShell, execute
   `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`
   e copie o resultado para `SESSION_SECRET`.

5. Defina `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` para criar a primeira
   conta administradora. A senha deve ter ao menos 12 caracteres e incluir
   letras maiúsculas, minúsculas e números. O administrador inicial é criado
   somente quando ainda não existe uma conta administradora no banco. Depois
   que o primeiro início do backend criar a conta, remova `ADMIN_PASSWORD` do
   arquivo `.env` e guarde essa senha em local seguro.

6. Inicie o servidor:

   ```powershell
   npm.cmd run dev
   ```

   O servidor local usa `http://localhost:3001`. A rota
   `http://localhost:3001/api/health` confirma se a API e o banco estão prontos.

7. Com o backend ativo, inicie o frontend em outro terminal, na pasta raiz do
   projeto:

   ```powershell
   npm.cmd run dev
   ```

8. Abra o endereço do Vite, selecione um PDF ou uma imagem PNG/JPEG de até
   10 MB na aba de cadastro e envie para extração. O primeiro uso do OCR precisa
   de conexão com a internet para baixar os modelos de português e inglês do
   Tesseract.js; o conteúdo dos documentos é processado localmente no backend.
   Revise e edite o texto reconhecido por página, selecione as páginas a guardar
   e confirme. Em seguida, preencha os dados da formulação e clique em
   **Confirmar e salvar formulação**. O registro e o texto de origem selecionado
   ficam no MongoDB; a formulação passa a aparecer na busca.

O OCR pode confundir caracteres, nomes e números: a interface identifica páginas
processadas por OCR e exige revisão antes de salvar. O sistema não identifica ou
valida automaticamente produtos, ingredientes, concentrações, procedimentos ou
patentes. Na confirmação, regras locais tentam preencher campos vazios quando
encontram rótulos como “Composição”, “Procedimento”, “Resumo”, “Fabricante” ou
“Patentes”; campos sem rótulo reconhecido precisam ser preenchidos manualmente.
Também é possível selecionar um trecho do texto extraído, escolher o campo de
destino e inseri-lo na revisão sem copiar e colar. Os valores sugeridos sempre
devem ser revisados. Para manter a prévia controlada, o limite atual é de 100
páginas e 30.000 caracteres exibidos por página; páginas maiores aparecem como truncadas.

### Importação de planilhas

Selecione um arquivo `.xlsx` ou `.csv` de até 10 MB. O backend mostra uma prévia
editável das abas e linhas (até 200 linhas e 50 colunas por aba). Associe as
colunas a nome do produto, laboratório, ingredientes/composição, resumo,
procedimento e observações sobre patentes; cabeçalhos comuns são sugeridos
automaticamente. Linhas não mapeadas continuam preservadas no texto de origem.
Escolha importar as linhas selecionadas como uma única formulação ou uma
formulação por linha, revise os valores e confirme para gravar no MongoDB. O
nome do produto e o laboratório são obrigatórios; a importação não inventa
valores ausentes.

### Rotas CRUD

| Método | Rota | Ação |
|---|---|---|
| `GET` | `/api/formulations` | Lista formulações |
| `GET` | `/api/formulations/:id` | Consulta uma formulação |
| `POST` | `/api/formulations` | Cadastra uma formulação |
| `PATCH` | `/api/formulations/:id` | Atualiza os campos enviados |
| `DELETE` | `/api/formulations/:id` | Exclui uma formulação |
| `POST` | `/api/uploads` | Recebe PDF, PNG ou JPEG no campo `document` como `multipart/form-data` |
| `GET` | `/api/uploads/:id/text` | Extrai texto selecionável e aplica OCR em imagens/páginas escaneadas |
| `PATCH` | `/api/uploads/:id/selection` | Salva somente as páginas revisadas selecionadas |
| `POST` | `/api/uploads/:id/formulation` | Cria a formulação usando as páginas selecionadas e os campos revisados |
| `POST` | `/api/spreadsheets/preview` | Lê um arquivo `.xlsx` ou `.csv` e retorna abas, colunas e linhas para revisão |
| `POST` | `/api/formulations/import` | Salva de 1 a 200 formulações revisadas em lote |

O backend usa sessões armazenadas no MongoDB. Visitantes sem senha podem
consultar somente formulações públicas; novas contas solicitadas pela interface
ficam pendentes até aprovação do administrador. O administrador ativa ou
desativa contas e define, por pessoa, se pode consultar registros privados,
criar/editar formulações e publicar ou tornar registros privados. Novas
formulações são privadas por padrão. Uploads, OCR e importação de planilhas
exigem a permissão de edição. Os arquivos enviados são gravados no disco local
e devem ser tratados como dados privados.

| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/api/auth/me` | Público; consulta a sessão atual |
| `POST` | `/api/auth/register` | Público; solicita uma conta pendente |
| `POST` | `/api/auth/login` | Público; inicia uma sessão |
| `POST` | `/api/auth/logout` | Encerra a sessão atual |
| `GET` | `/api/auth/users` | Administrador |
| `PATCH` | `/api/auth/users/:id` | Administrador; aprova/desativa e define permissões |
| `GET` | `/api/formulations` | Público vê apenas registros públicos; `read_private` também consulta privados |
| `GET` | `/api/formulations/:id` | Mesma regra de visibilidade; dados de origem são ocultados do público |
| `POST` | `/api/formulations` e `/api/formulations/import` | `edit_private` |
| `PATCH` | `/api/formulations/:id` | `edit_private`; `publish` permite apenas alterar visibilidade |
| `DELETE` | `/api/formulations/:id` | `edit_private` |
| `/api/uploads` | Upload, OCR e gravação da revisão | `edit_private` |
| `POST` | `/api/spreadsheets/preview` | `edit_private` |

O cookie de sessão é `HttpOnly` e `SameSite=Strict`; em produção ele também é
marcado como `Secure`, portanto a aplicação deve ser servida por HTTPS. Configure
`FRONTEND_URL` com a origem exata do frontend publicado.

---

## 🎨 Interface

A interface do FormuLab foi desenvolvida com foco em:

- Usabilidade;
- Organização das informações;
- Navegação intuitiva;
- Responsividade;
- Consistência visual.

---

## 🎓 Projeto Acadêmico

O FormuLab foi desenvolvido como parte do **Projeto Integrador II da UNIVESP**, aplicando conceitos de desenvolvimento de interfaces, organização de dados e experiência do usuário na construção de uma solução voltada ao gerenciamento de formulações.

---
