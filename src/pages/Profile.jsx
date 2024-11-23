import React, { useState, useEffect } from "react";
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const Profile = () => {
  const [usuario, setUsuario] = useState(null);
  const [condominioNome, setCondominioNome] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      const auth = getAuth(); 
      const currentUser = auth.currentUser; 

      if (currentUser) {
        const userRef = doc(db, 'usuarios', currentUser.uid); 
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUsuario(userDoc.data());

          
          const condominioRef = doc(db, 'condominios', userDoc.data().condominio);
          const condominioDoc = await getDoc(condominioRef);
          if (condominioDoc.exists()) {
            setCondominioNome(condominioDoc.data().nome);
          }
        } else {
          console.log('Usuário não encontrado');
        }
      } else {
        console.log('Usuário não está autenticado');
      }

      setLoading(false);
    }

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando informações...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Usuário não encontrado ou não autenticado.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(130deg, rgba(68,231,76,1) 0%, rgba(47,175,224,1) 63%, rgba(225,181,252,1) 100%)",
      }}
    >
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Meu Perfil</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome:</label>
            <input
              type="text"
              value={usuario.nome}
              onChange={(e) => setUsuario({ ...usuario, nome: e.target.value })}
              className="text-gray-800 w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail:</label>
            <input
              type="email"
              value={usuario.email}
              onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
              className="text-gray-800 w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Imóvel:</label>
            <p className="text-gray-800">{usuario.imovel}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Condomínio:</label>
            <p className="text-gray-800">{condominioNome}</p>
          </div>
        </div>

        <button
          className="mt-6 w-full py-2 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:bg-blue-700"
        >
          Atualizar Perfil
        </button>

        <button
          className="mt-4 w-full py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          onClick={() => window.history.back()}
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default Profile;
