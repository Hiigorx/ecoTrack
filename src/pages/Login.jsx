import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, setDoc, collection, getDocs, query, getDoc } from "firebase/firestore";
import ecoTrackLogo from "../images/ecotrackcolor.png";

function Toast({ message, type, onClose }) {
  return (
    <div
      className={`fixed top-5 right-5 p-4 rounded-lg shadow-md text-white text-sm ${type === "error" ? "bg-red-500" : "bg-green-500"}`}
    >
      {message}
      <button onClick={onClose} className="ml-4 font-bold">✕</button>
    </div>
  );
}

function translateFirebaseError(errorCode) {
  const errorMessages = {
    'auth/app-deleted': 'O banco de dados não foi localizado.',
    'auth/expired-action-code': 'O código da ação o ou link expirou.',
    'auth/invalid-action-code': 'O código da ação é inválido. Isso pode acontecer se o código estiver malformado ou já tiver sido usado.',
    'auth/user-disabled': 'O usuário correspondente à credencial fornecida foi desativado.',
    'auth/user-not-found': 'O usuário não correponde à nenhuma credencial.',
    'auth/weak-password': 'A senha é muito fraca. Sua senha deve conter no mínimo 8 caracteres, com letras maiúsculas e minúsculas, números e caracteres especiais',
    'auth/email-already-in-use': 'Já existi uma conta com o endereço de email fornecido.',
    'auth/invalid-email': 'O endereço de e-mail não é válido.',
    'auth/operation-not-allowed': 'O tipo de conta correspondente à esta credencial, ainda não encontra-se ativada.',
    'auth/account-exists-with-different-credential': 'E-mail já associado a outra conta.',
    'auth/auth-domain-config-required': 'A configuração para autenticação não foi fornecida.',
    'auth/credential-already-in-use': 'Já existe uma conta para esta credencial.',
    'auth/operation-not-supported-in-this-environment': 'Esta operação não é suportada no ambiente que está sendo executada. Verifique se deve ser http ou https.',
    'auth/timeout': 'Excedido o tempo de resposta. O domínio pode não estar autorizado para realizar operações.',
    'auth/missing-android-pkg-name': 'Deve ser fornecido um nome de pacote para instalação do aplicativo Android.',
    'auth/missing-continue-uri': 'A próxima URL deve ser fornecida na solicitação.',
    'auth/missing-ios-bundle-id': 'Deve ser fornecido um nome de pacote para instalação do aplicativo iOS.',
    'auth/invalid-continue-uri': 'A próxima URL fornecida na solicitação é inválida.',
    'auth/unauthorized-continue-uri': 'O domínio da próxima URL não está na lista de autorizações.',
    'auth/invalid-dynamic-link-domain': 'O domínio de link dinâmico fornecido, não está autorizado ou configurado no projeto atual.',
    'auth/argument-error': 'Verifique a configuração de link para o aplicativo.',
    'auth/invalid-persistence-type': 'O tipo especificado para a persistência dos dados é inválido.',
    'auth/unsupported-persistence-type': 'O ambiente atual não suportar o tipo especificado para persistência dos dados.',
    'auth/invalid-credential': 'A credencial expirou ou está mal formada.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-verification-code': 'O código de verificação da credencial não é válido.',
    'auth/invalid-verification-id': 'O ID de verificação da credencial não é válido.',
    'auth/custom-token-mismatch': 'O token está diferente do padrão solicitado.',
    'auth/invalid-custom-token': 'O token fornecido não é válido.',
    'auth/invalid-email': 'O endereço de e-mail não é válido.',
    'auth/captcha-check-failed': 'O token de resposta do reCAPTCHA não é válido, expirou ou o domínio não é permitido.',
    'auth/invalid-phone-number': 'O número de telefone está em um formato inválido (padrão E.164).',
    'auth/missing-phone-number': 'O número de telefone é requerido.',
    'auth/quota-exceeded': 'A cota de SMS foi excedida.',
    'auth/cancelled-popup-request': 'Somente uma solicitação de janela pop-up é permitida de uma só vez.',
    'auth/popup-blocked': 'A janela pop-up foi bloqueado pelo navegador.',
    'auth/popup-closed-by-user': 'A janela pop-up foi fechada pelo usuário sem concluir o login no provedor.',
    'auth/unauthorized-domain': 'O domínio do aplicativo não está autorizado para realizar operações.',
    'auth/invalid-user-token': 'O usuário atual não foi identificado.',
    'auth/user-token-expired': 'O token do usuário atual expirou.',
    'auth/null-user': 'O usuário atual é nulo.',
    'auth/app-not-authorized': 'Aplicação não autorizada para autenticar com a chave informada.',
    'auth/invalid-api-key': 'A chave da API fornecida é inválida.',
    'auth/network-request-failed': 'Falha de conexão com a rede.',
    'auth/requires-recent-login': 'O último horário de acesso do usuário não atende ao limite de segurança.',
    'auth/too-many-requests': 'As solicitações foram bloqueadas devido a atividades incomuns. Tente novamente depois que algum tempo.',
    'auth/web-storage-unsupported': 'O navegador não suporta armazenamento ou se o usuário desativou este recurso.',
    'auth/invalid-claims': 'Os atributos de cadastro personalizado são inválidos.',
    'auth/claims-too-large': 'O tamanho da requisição excede o tamanho máximo permitido de 1 Megabyte.',
    'auth/id-token-expired': 'O token informado expirou.',
    'auth/id-token-revoked': 'O token informado perdeu a validade.',
    'auth/invalid-argument': 'Um argumento inválido foi fornecido a um método.',
    'auth/invalid-creation-time': 'O horário da criação precisa ser uma data UTC válida.',
    'auth/invalid-disabled-field': 'A propriedade para usuário desabilitado é inválida.',
    'auth/invalid-display-name': 'O nome do usuário é inválido.',
    'auth/invalid-email-verified': 'O e-mail é inválido.',
    'auth/invalid-hash-algorithm': 'O algoritmo de HASH não é uma criptografia compatível.',
    'auth/invalid-hash-block-size': 'O tamanho do bloco de HASH não é válido.',
    'auth/invalid-hash-derived-key-length': 'O tamanho da chave derivada do HASH não é válido.',
    'auth/invalid-hash-key': 'A chave de HASH precisa ter um buffer de byte válido.',
    'auth/invalid-hash-memory-cost': 'O custo da memória HASH não é válido.',
    'auth/invalid-hash-parallelization': 'O carregamento em paralelo do HASH não é válido.',
    'auth/invalid-hash-rounds': 'O arredondamento de HASH não é válido.',
    'auth/invalid-hash-salt-separator': 'O campo do separador de SALT do algoritmo de geração de HASH precisa ser um buffer de byte válido.',
    'auth/invalid-id-token': 'O código do token informado não é válido.',
    'auth/invalid-last-sign-in-time': 'O último horário de login precisa ser uma data UTC válida.',
    'auth/invalid-page-token': 'A próxima URL fornecida na solicitação é inválida.',
    'auth/invalid-password': 'A senha é inválida, precisa ter pelo menos 6 caracteres.',
    'auth/invalid-password-hash': 'O HASH da senha não é válida.',
    'auth/invalid-password-salt': 'O SALT da senha não é válido.',
    'auth/invalid-photo-url': 'A URL da foto de usuário é inválido.',
    'auth/invalid-provider-id': 'O identificador de provedor não é compatível.',
    'auth/invalid-session-cookie-duration': 'A duração do COOKIE da sessão precisa ser um número válido em milissegundos, entre 5 minutos e 2 semanas.',
    'auth/invalid-uid': 'O identificador fornecido deve ter no máximo 128 caracteres.',
    'auth/invalid-user-import': 'O registro do usuário a ser importado não é válido.',
    'auth/invalid-provider-data': 'O provedor de dados não é válido.',
    'auth/maximum-user-count-exceeded': 'O número máximo permitido de usuários a serem importados foi excedido.',
    'auth/missing-hash-algorithm': 'É necessário fornecer o algoritmo de geração de HASH e seus parâmetros para importar usuários.',
    'auth/missing-uid': 'Um identificador é necessário para a operação atual.',
    'auth/reserved-claims': 'Uma ou mais propriedades personalizadas fornecidas usaram palavras reservadas.',
    'auth/session-cookie-revoked': 'O COOKIE da sessão perdeu a validade.',
    'auth/uid-alread-exists': 'O indentificador fornecido já está em uso.',
    'auth/email-already-exists': 'O e-mail fornecido já está em uso.',
    'auth/phone-number-already-exists': 'O telefone fornecido já está em uso.',
    'auth/project-not-found': 'Nenhum projeto foi encontrado.',
    'auth/insufficient-permission': 'A credencial utilizada não tem permissão para acessar o recurso solicitado.',
    'auth/internal-error': 'O servidor de autenticação encontrou um erro inesperado ao tentar processar a solicitação.',
  };
  return errorMessages[errorCode] || "Ocorreu um erro desconhecido.";
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [condominio, setCondominio] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [condominios, setCondominios] = useState([]);
  const [apartamentos, setApartamentos] = useState([]);
  const navigate = useNavigate();
  const db = getFirestore();

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchCondominios = async () => {
      const q = query(collection(db, "condominios"));
      const querySnapshot = await getDocs(q);
      const condominiosData = [];
      querySnapshot.forEach((doc) => {
        const nome = doc.data().nome || doc.id;
        condominiosData.push({ id: doc.id, nome });
      });
      setCondominios(condominiosData);
    };
    fetchCondominios();
  }, [db]);

  const fetchApartamentos = async (condominioId) => {
    if (!condominioId) {
      setApartamentos([]);
      return;
    }

    const q = query(collection(db, "condominios", condominioId, "imoveis"));
    const querySnapshot = await getDocs(q);
    const apartamentosData = [];
    querySnapshot.forEach((doc) => {
      apartamentosData.push(doc.id);
    });
    setApartamentos(apartamentosData);
  };

  useEffect(() => {
    fetchApartamentos(condominio);
  }, [condominio]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Login realizado com sucesso!", "success");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = translateFirebaseError(error.code);
      showToast(`Falha no login: ${errorMessage}`, "error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !birthDate || !email || !password || !condominio || !apartamento) {
      showToast("Por favor, preencha todos os campos.", "error");
      return;
    }
  
    const apartamentoRef = doc(db, "condominios", condominio, "imoveis", apartamento);
    const apartamentoDoc = await getDoc(apartamentoRef);
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, "usuarios", userCredential.user.uid);
      
  
      if (apartamentoDoc.exists()) {
        const apartamentoData = apartamentoDoc.data();
        const moradores = apartamentoData.moradores || [];
        moradores.push(userCredential.user.uid);
        await setDoc(apartamentoRef, { moradores }, { merge: true });
      } else {
        await setDoc(apartamentoRef, { moradores: [userCredential.user.uid] });
      }
  
    
      await setDoc(userDocRef, {
        nome: name,
        condominio: condominio,
        imovel: apartamento,
        email: email,
        cargo: "morador",
        dataNascimento: birthDate,
        dataCriacao: new Date().toISOString(),
      });
  
      showToast("Conta criada com sucesso! Você pode fazer login agora.", "success");
      setIsRegistering(false);
    } catch (error) {
      const errorMessage = translateFirebaseError(error.code);
      showToast(`Erro ao criar conta: ${errorMessage}`, "error");
    }
  };
  

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast("Por favor, informe um email para redefinir sua senha.", "error");
      return;
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        showToast("Este email não está cadastrado.", "error");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      showToast("Email de redefinição de senha enviado com sucesso!", "success");
      setIsResettingPassword(false);
    } catch (error) {
      const errorMessage = translateFirebaseError(error.code);
      showToast(`Erro: ${errorMessage}`, "error");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background:
          "linear-gradient(130deg, rgba(68,231,76,1) 0%, rgba(47,175,224,1) 63%, rgba(225,181,252,1) 100%)",
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full transform transition-all hover:scale-105 duration-300">
        <img
          src={ecoTrackLogo}
          alt="EcoTrack Logo"
          className="mx-auto w-24 mb-6 "
        />

        {!isResettingPassword ? (
          <>
            <p className="text-sm text-gray-600 text-center mb-8">
              {isRegistering
                ? "Crie uma conta para começar a usar o EcoTrack."
                : "Monitore e otimize o consumo de energia."}
            </p>
            <form
              onSubmit={isRegistering ? handleRegister : handleLogin}
              className="space-y-6"
            >
              {isRegistering && (
                <>
                  <input
                    type="text"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="date"
                    placeholder="Nascimento"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={condominio}
                    onChange={(e) => setCondominio(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Selecione o Condomínio</option>
                    {condominios.map((condominio) => (
                      <option key={condominio.id} value={condominio.id}>
                        {condominio.nome}
                      </option>
                    ))}
                  </select>

                  <select
                    value={apartamento}
                    onChange={(e) => setApartamento(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Selecione o Apartamento</option>
                    {apartamentos.map((apartamento) => (
                      <option key={apartamento} value={apartamento}>
                        {apartamento}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />

              <button
                type="submit"
                className="w-full bg-green-500 text-white px-4 py-3 rounded-lg"
              >
                {isRegistering ? "Registrar" : "Entrar"}
              </button>

              <p className="text-sm text-gray-600 text-center mt-4">
                {isRegistering ? (
                  <span>
                    Já tem uma conta?{" "}
                    <button
                      onClick={() => setIsRegistering(false)}
                      className="text-green-500 font-semibold"
                    >
                      Faça login aqui
                    </button>
                  </span>
                ) : (
                  <span>
                    Não tem uma conta?{" "}
                    <button
                      onClick={() => setIsRegistering(true)}
                      className="text-green-500 font-semibold"
                    >
                      Crie uma conta
                    </button>
                  </span>
                )}
              </p>
            </form>
          </>
        ) : (
          <>
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />

              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg"
              >
                Enviar link de redefinição de senha
              </button>

              <p className="text-sm text-gray-600 text-center mt-4">
                <button
                  onClick={() => setIsResettingPassword(false)}
                  className="text-green-500 font-semibold"
                >
                  Voltar para login
                </button>
              </p>
            </form>
          </>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Login;
