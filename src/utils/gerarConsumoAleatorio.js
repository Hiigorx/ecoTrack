import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";


const firebaseConfig = {
    apiKey: "AIzaSyD9VUp7jsxfj0NnDv3JkN9RcVIFZnEEl4c",
    authDomain: "ecotrack-f19db.firebaseapp.com",
    projectId: "ecotrack-f19db",
    storageBucket: "ecotrack-f19db.firebasestorage.app",
    messagingSenderId: "873268483863",
    appId: "1:873268483863:web:47281dca90b5c9f9204952",
  };


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


function gerarConsumoAleatorio() {
  const correnteA = (Math.random() * (20 - 1) + 1).toFixed(2);
  const potenciaW = (Math.random() * (5000 - 100) + 100).toFixed(0);
  const tensaoV = 220;
  const idSensor = `sensor-${Math.floor(Math.random() * 1000)}`;
  const dataLetura = new Date().toISOString();

  return { correnteA, potenciaW, tensaoV, idSensor, dataLetura };
}


async function gerarLeituraMensal(db, condominioId) {
  const imoveisRef = collection(db, "condominios", condominioId, "imoveis");
  const imoveisSnapshot = await getDocs(imoveisRef);

  imoveisSnapshot.forEach(async (docSnap) => {
    const imovelId = docSnap.id;
    const consumo = gerarConsumoAleatorio(); 


    const consumoRef = doc(db, "condominios", condominioId, "imoveis", imovelId, "consumo", `leitura-${new Date().getTime()}`);
    await setDoc(consumoRef, consumo);
    console.log(`Leitura de consumo registrada para o imóvel ${imovelId}:`, consumo);
  });
}

const condominioId = "recantoDosPassaros";
gerarLeituraMensal(db, condominioId);
