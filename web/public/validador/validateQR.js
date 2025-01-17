async function validateQR() {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const scannedQR = params.get("qr");
  console.log(`QR escaneado: ${scannedQR}`);

  const db = firebase.firestore();
  const usersRef = db.collection("users");
  let qrFound = false;
  let qrValid = false;
  let qrData = null;

  try {
    // Recorremos todos los usuarios
    const userDocs = await usersRef.get();
    for (const userDoc of userDocs.docs) {
      const userId = userDoc.id;
      const qrsRef = usersRef.doc(userId).collection("qrs");
      const qrDocs = await qrsRef.get();
      const qrList = qrDocs.docs.map(doc => doc.id);

      // Comprobamos si el QR existe
      if (qrList.includes(scannedQR)) {
        const qrDoc = qrDocs.docs.find(doc => doc.id === scannedQR);
        qrData = qrDoc.data();
        qrFound = true;
        break;
      }
    }

    if (qrFound) {
      const loadingContainer = document.getElementById("loading-container");
      const spiner = document.getElementsByClassName("spinner")[0];

      if (loadingContainer) {
        spiner.style.display = "none";
      }
      // Si el QR es dinámico, comprobamos su fecha de expiración
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
        // Si el QR es estático, no tiene fecha de expiración
        qrValid = true;
        document.title = "QR Válido";
        document.getElementById("status").innerText = "Estado: QR Válido.";
        loadingContainer.innerHTML = '<span class="icon">✓</span>';
        loadingContainer.style.backgroundColor = "#28a745";
      }

      // Solo mostrar el enlace si el QR es válido
      if (qrValid) {
        // Crear el contenedor div que ocupará toda la pantalla
        const divContainer = document.createElement('div');
        divContainer.classList.add('full-screen-container'); // Asignar clase CSS

        // Verificar que la URL sea absoluta
        let url = qrData.url;
        if (!/^https?:\/\//i.test(url)) {
          url = `https://${url}`;
        }

        const linkElement = document.createElement('a');
        linkElement.href = url;  // Asignar la nueva URL
        linkElement.target = "_blank";  // Abrir en una nueva pestaña
        linkElement.innerText = "Ir a la URL";  // Texto del enlace
        linkElement.classList.add("button-link");  // Asignar clase CSS

        // Añadir el enlace al div contenedor
        divContainer.appendChild(linkElement);

        // Mostrar el div en la página
        document.body.appendChild(divContainer);
      }
    } else {
      // Si el QR no se encuentra
      document.title = "QR Inválido";
      document.getElementById("status").innerText = "Estado: QR no encontrado.";
    }

  } catch (error) {
    console.error("Error al validar el QR:", error);
    document.title = "Error al Validar QR";
    document.getElementById("status").innerText = "Estado: Error al validar el QR.";
  }
}

// Llamar a la función de validación
validateQR();



