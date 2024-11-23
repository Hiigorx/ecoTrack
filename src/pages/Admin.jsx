import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import alterarCargo from '../utils/firestoreUtils';

function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [novoCargo, setNovoCargo] = useState('');
  const [consumos, setConsumos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsuarios() {
      const usersRef = collection(db, 'usuarios');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(users);
    }

    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (selectedUsuario) {
      async function fetchConsumo() {
        const usuarioDocRef = doc(db, 'usuarios', selectedUsuario);
        const usuarioDoc = await getDoc(usuarioDocRef);
        if (usuarioDoc.exists()) {
          const usuarioData = usuarioDoc.data();
          const imovelRef = doc(db, 'condominios', usuarioData.condominio, 'imoveis', usuarioData.imovel);
          const consumoRef = collection(imovelRef, 'consumo');
          const consumoSnapshot = await getDocs(consumoRef);
          const consumoData = consumoSnapshot.docs.map((doc) => doc.data());
          setConsumos(consumoData);
        }
      }
      fetchConsumo();
    }
  }, [selectedUsuario]);

  const handleAlterarCargo = async (e) => {
    e.preventDefault();

    if (!selectedUsuario || !novoCargo) {
      alert('Por favor, selecione um usuário e o novo cargo.');
      return;
    }

    try {
      await alterarCargo(selectedUsuario, novoCargo);
      alert(`Cargo alterado para "${novoCargo}" com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar o cargo:', error);
      alert('Não foi possível alterar o cargo. Verifique os dados e tente novamente.');
    }
  };

  const handleExcluirMorador = async () => {
    if (!selectedUsuario) {
      alert('Por favor, selecione um usuário para excluir.');
      return;
    }

    const confirmar = window.confirm('Tem certeza de que deseja excluir este morador e todos os seus dados?');
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'usuarios', selectedUsuario));

      const usuarioDocRef = doc(db, 'usuarios', selectedUsuario);
      const usuarioDoc = await getDoc(usuarioDocRef);
      if (usuarioDoc.exists()) {
        const usuarioData = usuarioDoc.data();
        const imovelRef = doc(db, 'condominios', usuarioData.condominio, 'imoveis', usuarioData.imovel);
        const consumoRef = collection(imovelRef, 'consumo');
        const consumoSnapshot = await getDocs(consumoRef);
        consumoSnapshot.forEach(async (consumoDoc) => {
          await deleteDoc(consumoDoc.ref);
        });
      }

      alert('Morador excluído com sucesso!');
      setUsuarios((prevUsuarios) => prevUsuarios.filter((usuario) => usuario.id !== selectedUsuario));
      setSelectedUsuario('');
      setConsumos([]);
    } catch (error) {
      console.error('Erro ao excluir o morador:', error);
      alert('Não foi possível excluir o morador. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(130deg, rgba(68,231,76,1) 0%, rgba(47,175,224,1) 63%, rgba(225,181,252,1) 100%)",
      }}
    >
      <h1 className="text-4xl font-extrabold text-white text-center mb-6">
        Gerenciamento de Moradores
      </h1>

      <form
        onSubmit={handleAlterarCargo}
        className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg space-y-6"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Alterar Cargo</h2>

        <div className="space-y-2">
          <label htmlFor="usuario" className="text-lg font-medium text-gray-700">
            Usuário
          </label>
          <select
            id="usuario"
            className="w-full px-4 py-2 border rounded-lg text-gray-700"
            value={selectedUsuario}
            onChange={(e) => setSelectedUsuario(e.target.value)}
          >
            <option value="">Selecione um usuário</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="cargo" className="text-lg font-medium text-gray-700">
            Novo Cargo
          </label>
          <select
            id="cargo"
            className="w-full px-4 py-2 border rounded-lg text-gray-700"
            value={novoCargo}
            onChange={(e) => setNovoCargo(e.target.value)}
          >
            <option value="">Selecione o novo cargo</option>
            <option value="morador">Morador</option>
            <option value="sindico">Síndico</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg mt-4 hover:bg-green-700 transition-all duration-300"
        >
          Alterar Cargo
        </button>
      </form>

      {selectedUsuario && (
        <button
          onClick={handleExcluirMorador}
          className="w-full bg-red-600 text-white py-2 rounded-lg mt-6 hover:bg-red-700 transition-all duration-300"
        >
          Excluir Morador
        </button>
      )}

      {selectedUsuario && consumos.length > 0 && (
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Consumo de Energia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consumos.map((consumo, index) => (
              <div
                key={index}
                className="bg-gray-100 p-4 rounded-lg shadow-md space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-800">Leitura {index + 1}</h3>
                <p><strong>Data:</strong> {consumo.dataLetura}</p>
                <p><strong>Potência (W):</strong> {consumo.potenciaW} W</p>
                <p><strong>Tensão (V):</strong> {consumo.tensaoV} V</p>
                <p><strong>Corrente (A):</strong> {consumo.correnteA} A</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all duration-300"
      >
        Voltar ao Dashboard
      </button>
    </div>
  );
}

export default Admin;
