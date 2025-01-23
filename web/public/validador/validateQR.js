async function validateQR() {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const scannedQR = params.get("qr");
  const userEmail = params.get("email");  // Obtener el email de la URL
  console.log(`QR escaneado: ${scannedQR}`);
  console.log(`Correo electrónico: ${userEmail}`);

  const db = firebase.firestore();
  const usersRef = db.collection("users");
  let qrFound = false;
  let qrValid = false;
  let qrData = null;

  try {
    const userDocs = await usersRef.get();
    let userId;
    for (const userDoc of userDocs.docs) {
      userId = userDoc.id;
      const qrsRef = usersRef.doc(userId).collection("qrs");
      const qrDocs = await qrsRef.get();
      const qrList = qrDocs.docs.map(doc => doc.id);

      if (qrList.includes(scannedQR)) {
        const qrDoc = qrDocs.docs.find(doc => doc.id === scannedQR);
        qrData = qrDoc.data();
        qrFound = true;
        break;
      }
    }

    const loadingContainer = document.getElementById("loading-container");
    const spiner = document.getElementsByClassName("spinner")[0];

    if (loadingContainer) {
      spiner.style.display = "none";
    }

    if (qrFound) {



      const vecesEscaneadoRef = db.collection("users")
  .doc(userId)
  .collection("qrs")
  .doc(scannedQR);

const vecesEscaneadoDoc = await vecesEscaneadoRef.get();
let vecesEscaneado = vecesEscaneadoDoc.exists ? vecesEscaneadoDoc.data().vecesEscaneado : "0"; // Asegúrate de que el valor sea un string

// Si el valor es un string, conviértelo a número
if (typeof vecesEscaneado === 'string') {
  vecesEscaneado = parseInt(vecesEscaneado, 10) || 0; // Convertirlo a número o asignar 0 si no es válido
}

// Actualiza el contador
await vecesEscaneadoRef.update({
  vecesEscaneado: (vecesEscaneado + 1).toString() // Asegúrate de almacenar el valor como string
});














      if (qrData.fechaExpiracion) {
        const currentDate = new Date();
        const expirationDate = new Date(qrData.fechaExpiracion);

        if (currentDate < expirationDate) {
          qrValid = true;
          document.title = "QR Válido";
          document.getElementById("status").innerText = "Estado: QR Válido.";
          loadingContainer.innerHTML = '<span class="icon">✓</span>';
          loadingContainer.style.backgroundColor = "#28a745";
        } else {
          qrValid = false;
          document.title = "QR Expirado";
          document.getElementById("status").innerText = "Estado: QR Expirado.";
          loadingContainer.innerHTML = '<span class="icon">✗</span>';
          loadingContainer.style.backgroundColor = "#dc3545";
        }
      } else {
        qrValid = true;
        document.title = "QR Válido";
        document.getElementById("status").innerText = "Estado: QR Válido.";
        loadingContainer.innerHTML = '<span class="icon">✓</span>';
        loadingContainer.style.backgroundColor = "#28a745";
      }

      if (qrValid) {
        console.log("El QR era válido");

        const userAccessRef = db.collection("users").doc(userId).collection("qrs").doc(scannedQR).collection("informacion").doc("usuarios con acceso");
        const userAccessDoc = await userAccessRef.get();

        // Imprime el documento completo para ver qué contiene
        console.log("Documento veo : ", userAccessDoc.data()['usuarios permitidos']);

        let isUserAllowed = false;

        if (userAccessDoc.exists) {
          const allowedUsers = userAccessDoc.data()['usuarios permitidos'];

          console.log("Usuarios permitidos:", allowedUsers);
          
          if ((allowedUsers === "" || (allowedUsers && allowedUsers.split(",").map(email => email.trim()).includes(userEmail)))) {
            isUserAllowed = true;
            console.log("Correo electrónico encontrado");
          }
        } else {
          console.log("No se encontró el documento de acceso.");
        }

        if (isUserAllowed) {
          document.getElementById("status").innerText += " - Acceso Permitido";
          loadingContainer.style.backgroundColor = "#28a745";

          // Crear el contenedor div que ocupará toda la pantalla
          const divContainer = document.createElement('div');
          divContainer.classList.add('full-screen-container'); // Asignar clase CSS

          let url = qrData.url;
          if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
          }

          const linkElement = document.createElement('a');
          linkElement.href = url;
          linkElement.target = "_blank";
          linkElement.innerText = "Ir a la URL";
          linkElement.classList.add("button-link");





          linkElement.addEventListener('click', async () => {
            try {
              const vecesIngresadoRef = db.collection("users")
                .doc(userId)
                .collection("qrs")
                .doc(scannedQR);
                
          
              const vecesIngresadoDoc = await vecesIngresadoRef.get();
              let vecesIngresado = vecesIngresadoDoc.exists ? vecesIngresadoDoc.data().vecesIngresado : "0"; // Asegúrate de que el valor sea un string
          
              // Si el valor es un string, conviértelo a número
              if (typeof vecesIngresado === 'string') {
                vecesIngresado = parseInt(vecesIngresado, 10) || 0; // Convertirlo a número o asignar 0 si no es válido
              }
          
              // Actualizar el contador
              await vecesIngresadoRef.update({
                vecesIngresado: (vecesIngresado + 1).toString() // Asegúrate de almacenar el valor como string
              });
          
              console.log("Contador de vecesIngresado incrementado");
            } catch (error) {
              console.error("Error al actualizar el contador de vecesIngresado:", error);
            }
          });






          const informacionRef = db.collection("users")
    .doc(userId)
    .collection("qrs")
    .doc(scannedQR)
    .collection("informacion");

  const informacionDocs = await informacionRef.get();

  if (!informacionDocs.empty) {
    const listElement = document.createElement('ul'); // Crear lista para mostrar la información
    listElement.classList.add('ul');
    let hasValidInfo = false; // Bandera para verificar si hay información válida
  
    informacionDocs.forEach(doc => {
      const data = doc.data();
  
      // Excluir el campo "usuarios permitidos"
      if (data["usuarios permitidos"]) {
        return; // Omitir esta entrada
      }
  
      const mensaje = data.mensaje || null;
      const timestamp = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : null;
  
      // Validar que al menos uno de los campos (mensaje o timestamp) exista
      if (!mensaje && !timestamp) {
        return; // Omitir entradas sin datos válidos
      }
  
      const listItem = document.createElement('li'); // Crear elemento de lista
      listItem.classList.add('li');

      listItem.innerText = `${timestamp || "Sin fecha"} - ${mensaje || "Sin mensaje"}`;
      listElement.appendChild(listItem);
  
      hasValidInfo = true; // Indicar que se encontró información válida
    });
  
    if (hasValidInfo) {
      divContainer.appendChild(listElement); // Agregar lista al contenedor
    } else {
      const noInfoMessage = document.createElement('p');
      noInfoMessage.innerText = "No hay información adicional disponible.";
      divContainer.appendChild(noInfoMessage);
    }
  } else {
    const noInfoMessage = document.createElement('p');
    noInfoMessage.innerText = "No hay información adicional disponible.";
    divContainer.appendChild(noInfoMessage);
  }

  const linkContainer = document.createElement('div');

  linkContainer.classList.add('full-screen-container');
  linkContainer.appendChild(linkElement);

          //divContainer.appendChild(linkElement);
          document.body.appendChild(linkContainer);

          document.body.appendChild(divContainer);
        } else {
          document.getElementById("status").innerText += " - Acceso Denegado";
          loadingContainer.innerHTML = '<span class="icon">✗</span>';
          loadingContainer.style.backgroundColor = "#dc3545";
          document.title = "Acceso denegado";

        }
      }
    } else {
      document.title = "QR Inválido";
      document.getElementById("status").innerText = "Estado: QR no encontrado.";
      loadingContainer.innerHTML = '<span class="icon">✗</span>';
      loadingContainer.style.backgroundColor = "#dc3545";
    }

  } catch (error) {
    console.error("Error al validar el QR:", error);
    document.title = "Error al Validar QR";
    document.getElementById("status").innerText = "Estado: Error al validar el QR.";
  }
}

validateQR();
