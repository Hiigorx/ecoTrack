
# EcoTrack

**EcoTrack** é uma plataforma desenvolvida para monitoramento de consumo de energia elétrica em condomínios e comunidades. O sistema oferece aos moradores e administradores acesso a informações detalhadas sobre o consumo de energia de cada imóvel e do condomínio como um todo, promovendo economia e sustentabilidade.

---

## 🎯 **Objetivo do Projeto**

- Monitorar o consumo de energia elétrica individual e coletivo.
- Proporcionar aos moradores maior controle sobre seus gastos energéticos.
- Permitir aos administradores acesso centralizado para gerenciar o consumo do condomínio.

---

## 🚀 **Funcionalidades**

### 1. **Login e Cadastro**
- **Usuários**: Podem se cadastrar e realizar login com e-mail e senha.
- **Dados do cadastro**:
  - Nome
  - Data de nascimento
  - E-mail
  - Senha
- **Recuperação de Senha**: Caso o usuário esqueça sua senha, pode redefini-la através de um e-mail de recuperação.

### 2. **Dashboard do Morador**
- Exibe o consumo atual do imóvel do usuário em watts.
- Mostra o consumo total do condomínio.
- Inclui um gráfico de linha mostrando o histórico de consumo do imóvel.
- Acesso rápido às seguintes seções:
  - Meu Perfil
  - Painel do Administrador (restrito).

### 3. **Painel do Administrador**
- Acesso restrito com usuário e senha padrão.
  - **Usuário**: `admin`
  - **Senha**: `1234`
- Funcionalidades:
  - Visualizar consumo detalhado de cada imóvel.
  - Alterar cargos de usuários (ex.: promover um morador a síndico).
  - Gerenciar moradores e imóveis.

---

## 🛠️ **Tecnologias Utilizadas**

### **Frontend**
- React.js
- Tailwind CSS (para estilização)
- Chart.js (para gráficos)

### **Backend**
- Firebase:
  - **Firestore**: Banco de dados em nuvem para armazenar informações de usuários, imóveis e consumo.
  - **Authentication**: Gerenciamento de autenticação e login.

### **Hospedagem**
- **Vercel**: A aplicação está hospedada em **[ecotrack1.vercel.app](https://ecotrack1.vercel.app)**.

---

## 📂 **Estrutura do Banco de Dados**

O Firestore foi organizado da seguinte maneira:

```
condominios
  └── [nomeCondominio]
        └── imoveis
              └── [nomeImovel]
                    ├── moradorId: "user123"
                    └── consumo
                          ├── documento
                                ├── dataLetura: timestamp
                                ├── correnteA: number
                                ├── idSensor: string
                                ├── potenciaW: number
                                └── tensaoV: number

usuarios
  └── [userId]
        ├── nome: string
        ├── email: string
        ├── condominio: string
        ├── imovel: string
        └── cargo: string (morador ou sindico)
```

---

## 🖥️ **Como Usar**

### 1. **Acessar a Plataforma**
- Acesse **[ecotrack1.vercel.app](https://ecotrack1.vercel.app)** no navegador.

### 2. **Clonar o Repositório** (Opcional)
```bash
git clone https://github.com/Hiigorx/EcoTrack.git
cd EcoTrack
```

### 3. **Instalar Dependências**
Certifique-se de ter o Node.js instalado. Em seguida, execute:
```bash
npm install
```

### 4. **Configurar Firebase**
- Crie um projeto no [Firebase](https://firebase.google.com/).
- Ative o **Firestore Database** e **Authentication**.
- Baixe o arquivo `firebaseConfig` e substitua pelo existente na pasta `/src/firebase.js`.

### 5. **Executar o Projeto Localmente**
```bash
npm start
```

---

## 🔒 **Login no Painel do Administrador**

Apenas usuários com as credenciais corretas podem acessar o painel do administrador.

- **Usuário**: `admin`
- **Senha**: `1234`

---

## 🛡️ **Segurança e Privacidade**

- Todos os dados são armazenados com segurança no Firebase Firestore.
- As senhas são protegidas com autenticação do Firebase.

---

## 👥 **Contribuidores**

- **Higor Kauan** - RM 558907  
- **Kauê Pires** - RM 554403  
- **Athos Alves** - RM 555515

---

## 📄 **Licença**

Este projeto está licenciado sob a MIT License. Consulte o arquivo `LICENSE` para obter mais detalhes.


