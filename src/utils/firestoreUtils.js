import { doc, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const db = getFirestore();

async function alterarCargo(uid, novoCargo) {
  try {
    const usuarioRef = doc(db, "usuarios", uid);
    await updateDoc(usuarioRef, { cargo: novoCargo });
    console.log(`Cargo alterado para ${novoCargo} com sucesso!`);
  } catch (error) {
    console.error("Erro ao alterar o cargo:", error);
  }
}

export default alterarCargo;
