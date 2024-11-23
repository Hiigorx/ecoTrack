import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import ecoTrackLogo from "../images/ecotrackcolor.png";
import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [consumoImovel, setConsumoImovel] = useState(0);
  const [consumoCondominio, setConsumoCondominio] = useState(0);
  const [historicoConsumo, setHistoricoConsumo] = useState([]);
  const [usuarioNome, setUsuarioNome] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPassword, setAdminPassword] = useState(""); 
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/"); 
      } else {
        const fetchUserData = async () => {
          const userDoc = await getDocs(query(collection(db, "usuarios"), where("email", "==", user.email)));
          const userData = userDoc.docs[0].data();
          setUsuarioNome(userData.nome);
          await carregarConsumos(userData);
          await carregarHistoricoImovel(userData);
        };
        fetchUserData();
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const carregarConsumos = async (userData) => {
    try {
      const imovelRef = collection(db, "condominios", userData.condominio, "imoveis", userData.imovel, "consumo");
      const ultimaLeituraImovel = await getDocs(query(imovelRef, orderBy("dataLetura", "desc"), limit(1)));

      if (!ultimaLeituraImovel.empty) {
        const ultimoConsumo = ultimaLeituraImovel.docs[0].data().potenciaW || 0;
        setConsumoImovel(Number(ultimoConsumo));
      }

      const condominioRef = collection(db, "condominios", userData.condominio, "imoveis");
      const condominioSnapshot = await getDocs(condominioRef);

      let totalConsumoCondominio = 0;
      for (const imovelDoc of condominioSnapshot.docs) {
        const consumoRef = collection(db, "condominios", userData.condominio, "imoveis", imovelDoc.id, "consumo");
        const ultimaLeitura = await getDocs(query(consumoRef, orderBy("dataLetura", "desc"), limit(1)));

        if (!ultimaLeitura.empty) {
          const consumo = ultimaLeitura.docs[0].data().potenciaW || 0;
          totalConsumoCondominio += Number(consumo);
        }
      }
      setConsumoCondominio(totalConsumoCondominio);
    } catch (error) {
      console.error("Erro ao carregar consumos: ", error);
    }
  };

  const carregarHistoricoImovel = async (userData) => {
    try {
      const imovelRef = collection(db, "condominios", userData.condominio, "imoveis", userData.imovel, "consumo");
      const historicoSnapshot = await getDocs(query(imovelRef, orderBy("dataLetura", "asc"), limit(10))); 
      const historico = historicoSnapshot.docs.map((doc) => ({
        data: new Date(doc.data().dataLetura.seconds * 1000).toLocaleDateString("pt-BR"),
        consumo: doc.data().potenciaW || 0,
      }));
      setHistoricoConsumo(historico);
    } catch (error) {
      console.error("Erro ao carregar histórico do imóvel: ", error);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => navigate("/"))
      .catch((error) => console.error("Erro ao realizar logout: ", error));
  };

  const handleAdminLogin = () => {
    if (adminUser === "admin" && adminPassword === "1234") {
      setIsModalOpen(false);
      navigate("/admin");
    } else {
      alert("Usuário ou senha incorretos!");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(130deg, rgba(68,231,76,1) 0%, rgba(47,175,224,1) 63%, rgba(225,181,252,1) 100%)",
      }}
    >

      <aside
        className={`w-64 bg-white text-gray-800 shadow-xl py-6 px-4 space-y-6 flex flex-col fixed right-0 top-0 bottom-0 z-10 transform transition-all duration-300 ${isMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
      >
        <div className="flex items-center justify-center">
          <img src={ecoTrackLogo} alt="EcoTrack Logo" className="h-20" />
        </div>
        <nav className="space-y-4 flex-grow">
          <ul>
            <li>
              <button
                className="w-full py-3 px-4 text-gray-800 font-semibold rounded-lg hover:bg-blue-100 transition-all duration-300"
                onClick={() => navigate("/perfil")}
              >
                Meu Perfil
              </button>
            </li>

            <li>
              <button
                className="w-full py-3 px-4 text-gray-800 font-semibold rounded-lg hover:bg-blue-100 transition-all duration-300"
                onClick={() => setIsModalOpen(true)}
              >
                Painel do Administrador
              </button>
            </li>
          </ul>
        </nav>
        <button
          className="w-full py-3 px-4 text-gray-800 font-semibold rounded-lg hover:bg-blue-100 transition-all duration-300"
          onClick={() => setIsMenuOpen(false)}
        >
          Fechar Menu
        </button>
        <button
          className="w-full py-3 px-4 text-white font-semibold rounded-lg bg-red-600 hover:bg-red-700 mt-4"
          onClick={handleLogout}
        >
          Sair
        </button>
      </aside>

   
      {isModalOpen && (
      <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-50 z-20">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-semibold text-center mb-4">Painel do Administrador</h2>
          <div className="mb-4">
            <label htmlFor="adminUser" className="block text-gray-700">Usuário:</label>
            <input
              type="text"
              id="adminUser"
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="adminPassword" className="block text-gray-700">Senha:</label>
            <input
              type="password"
              id="adminPassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              Fechar
            </button>
            <button
              onClick={handleAdminLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    )}


      <main className="flex-1 p-6 space-y-8 overflow-hidden max-w-screen-lg mx-auto">
     
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide p-4 inline-block">
            Olá, {usuarioNome}! Bem-vindo(a) ao seu dashboard de consumo!
          </h1>
   
          <button
            className="text-white p-2 bg-blue-500 hover:bg-blue-600 rounded-lg z-60"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

     
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-lg p-6 text-white transition-transform transform hover:scale-105">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 mr-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3h6a2 2 0 012 2v12a2 2 0 01-2 2h-6l-4 4V7a2 2 0 012-2z" />
              </svg>
              <h2 className="text-2xl font-semibold">Consumo do Imóvel</h2>
            </div>
            <p className="text-xl font-medium">Última leitura: {consumoImovel} W</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-400 to-red-500 rounded-lg shadow-lg p-6 text-white transition-transform transform hover:scale-105">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 mr-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l7-7-7-7" />
              </svg>
              <h2 className="text-2xl font-semibold">Consumo do Condomínio</h2>
            </div>
            <p className="text-xl font-medium">Total da última leitura: {consumoCondominio} W</p>
          </div>
        </section>

      
        <section className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Histórico de Consumo</h2>
          <Line
            data={{
              labels: historicoConsumo.map((item) => item.data),
              datasets: [
                {
                  label: "Consumo (W)",
                  data: historicoConsumo.map((item) => item.consumo),
                  borderColor: "rgb(34,197,94)",
                  backgroundColor: "rgba(34,197,94,0.2)",
                  tension: 0.3,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
