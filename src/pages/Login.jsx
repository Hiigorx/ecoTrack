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
    "auth/user-disabled": "O usuário correspondente à credencial fornecida foi desativado.",
    "auth/user-not-found": "O usuário não está cadastrado.",
    "auth/weak-password": "A senha é muito fraca. Ela deve conter números, letras maiúsculas e minúsculas, caracteres especiais e ao menos 8 caracteres",
    "auth/email-already-in-use": "Já existe uma conta cadastrada com o endereço de email fornecido.",
    "auth/invalid-email": "O endereço de e-mail não é válido.",
    "auth/wrong-password": "Senha incorreta. Tente novamente.",
    "auth/too-many-requests": "Muitas tentativas consecutivas, aguarde para tentar novamente.",
    "auth/network-request-failed": "Falha de conexão com a rede.",
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
