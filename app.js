const SHEET_ID = '1iDgcn20UoPUDRwFwWxW5O7QdCRvG7GUAF6lokDOqAWE';
const SERVICE_ACCOUNT_EMAIL = 'codigos@codigos-446612.iam.gserviceaccount.com';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDMXQT119z7vCsr
gy23V/0lsJOlpne2I+pwpUHnBs3lJmGSm1S/+DXYTeykkL5GzrMw8+peXijHtJdZ
tPvg9t31Ap6njYDT/PymPSHOly1L0RakHxlV+k2+QUt04OQyRXehpXCNEihIzyGS
c88Wkzrd7uxZXpYF36U7+YVttd6uk9rWWcAwByQxs6lhCGzI/AOEBXFbLjdOvEXN
PrJopfndQtFdgeiTU50IV88kmrgM+Z689Hcor7R9Hi2BgOsjQYW6PqqETeYNYOOh
QNgfSxlwdGaVLLouilbaA63mE1JXnVjvtPemWUUvnxahTbD57KU/IZwOQ398PgBU
d6ft62YhAgMBAAECggEAARxdNEcz6YMX3JO+xpuvIIGeIzDcvwjMlPXh8+EtXlKX
EGu3hRx7kc08EaFSQgFt+WRnIeW9Ke0LEFvILYDgaH5CffxLfnek8KIjgs2d1k/1
7lL2JlAbZpdlbNxE89KE9diMQsPgj3944b4qFWAmQKm5X/3w9oiHr5Il5NsQ/krC
RfZwt7Mfyk5MM06lpn4qFd9cg82jPb7Ksmf4nrjh7DPQLnqQvOtBtVTynyPpT4K1
l8+/LqUxggjYJEpVb2x1e+wlMrcAO5cfz8BnsJ0/LDrxhyK6vIBT3nJWtT3+z+SW
Y9bMVYdZWe+hQi37MHZ/mitN+PNzZiY1JAtlKGVEVwKBgQD0/GxSFEr9mi34HHlk
ZG+2CR9z5iH0mp1vTliIq9QOGS80ITSfnlwk0Ol8yG/yXcZV22CSDfkw0K9USN/E
LC5l3azjPKGC2VnlbUWKBvATM3zbu9unrbs4GbXc3qLmiIa0Dx0B4sfKzC1X5WK5
MdMepFQXwq+wJVE4r09p+SWORwKBgQDVjRCDyHSqfKriuOdmjSCQFmHS4XDtRH1E
kRNGoeIHnhdkORsnYMw+i54EOMy/61oanQhHXWSiq7SeTz3fdev+xg3rOiJ1FveK
X3Z/BZYt3faUqpdvPs4FOocVPkyMxmSdwgfJuD1wNWgBBCDybpBYSfpNZJzxrU2A
/hKFxWGUVwKBgCdNf8tDOiypWYqedtMmUc2wdP1RBE2LqIo81XNHrcN9QtdoJFsf
OsUlRvAf7+XAKZuIkFueJkYwlJA/CLceJ2tsPtpN1dN6LzPhbfCQ4F8UOYm+/6RM
+OYtKcH/bb7yVDn62rp8uXTNgNDDGi1/0tDtqBgPwcPOmNMxPNpRgDbtAoGAOtJ0
bhhVKnDUkUblVnYhNg80OuYmOPTYnH5plNcab4a4Yr7oH9yl5cSHbhpHK8YkN5hx
o1ayVax+P+0L2fWdX7wmMVj+DMqavN62wR5E07WEKkcjF11xWjdY5h0W8N/k7x93
DbVWFwZe84izmpOh5u/Zpl/Eaz2VT6asa3SHAFkCgYB59Jupad0lDqWgfQq1Rnwn
y0oF2Ygcdgdxaa3oCxrOI7cIfszROqgTFMcEmYB85Yoh2Zim9V9eZNHIagCmRFlh
yAY9+V5e+wydSgXThor+89iYCpIAX6dE0SemPtEbh2V2B7PZAcgVk/h42g1FfFT+
qhw9GkrrqueiD1riNCh2Vw==
-----END PRIVATE KEY-----`;

const GOOGLE_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/CODIGO`;

let descripcionMadreGlobal = ""; // Variable global para almacenar la descripción madre
let hijosGlobal = []; // Nueva variable para almacenar los hijos del producto madre

async function authenticate() {
    try {
        const jwtToken = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: await createJwtToken()
            })
        });

        const tokenResponse = await jwtToken.json();
        if (tokenResponse.access_token) {
            console.log("Credenciales válidas. Acceso a la API otorgado.");
        } else {
            console.error("Error al autenticar: ", tokenResponse);
        }
        return tokenResponse;
    } catch (error) {
        console.error("Error al autenticar: ", error);
    }
}

async function createJwtToken() {
    const encoder = new TextEncoder();

    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: SERVICE_ACCOUNT_EMAIL,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now
    };

    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(payload));

    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = await signJwt(unsignedToken, PRIVATE_KEY);

    return `${unsignedToken}.${signature}`;
}

async function signJwt(unsignedToken, privateKeyPem) {
    const privateKey = await importPrivateKey(privateKeyPem);
    const encoder = new TextEncoder();
    const signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        privateKey,
        encoder.encode(unsignedToken)
    );
    return base64urlEncode(signature);
}

async function importPrivateKey(pemKey) {
    const keyData = parsePemKey(pemKey);
    return crypto.subtle.importKey(
        "pkcs8",
        keyData,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256"
        },
        false,
        ["sign"]
    );
}

function parsePemKey(pemKey) {
    const base64 = pemKey
        .replace(/-----BEGIN PRIVATE KEY-----/, "")
        .replace(/-----END PRIVATE KEY-----/, "")
        .replace(/\n/g, "");
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
}

function base64urlEncode(buffer) {
    const base64 = btoa(
        typeof buffer === "string"
            ? buffer
            : String.fromCharCode(...new Uint8Array(buffer))
    );
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

document.getElementById("buscarDescripcion").addEventListener("input", async () => {
    const descripcion = document.getElementById("buscarDescripcion").value.trim();

    if (descripcion) {
        buscarPorDescripcion(descripcion);
    } else {
        document.getElementById("sugerencias").innerHTML = ""; // Limpiar sugerencias
    }
});

async function buscarPorDescripcion(descripcion) {
    const token = await authenticate();

    if (token && token.access_token) {
        try {
            const response = await fetch(`${GOOGLE_API_URL}!A2:D`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token.access_token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.values) {
                const coincidencias = data.values.filter(row => 
                    row[1]?.toLowerCase().includes(descripcion.toLowerCase())
                );

                mostrarSugerencias(coincidencias);
            } else {
                console.error("Error al obtener datos:", data.error);
                document.getElementById("sugerencias").innerHTML = "Error al buscar.";
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            document.getElementById("sugerencias").innerHTML = "Error en la búsqueda.";
        }
    }
}

function mostrarSugerencias(coincidencias) {
    const sugerenciasDiv = document.getElementById("sugerencias");

    if (coincidencias.length > 0) {
        sugerenciasDiv.innerHTML = `
            <ul>
                ${coincidencias.map(row => `
                    <li onclick="seleccionarCoincidencia('${row[0]}', '${row[1]}')">
                        <strong>${row[0]}</strong>: ${row[1]}
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        sugerenciasDiv.innerHTML = "<p>No se encontraron coincidencias.</p>";
    }
}

function seleccionarCoincidencia(codigoMadre, descripcionMadre) {
    document.getElementById("codigo").value = codigoMadre;
    buscarProductoMadre(codigoMadre); // Realizar la búsqueda con el código seleccionado
    document.getElementById("sugerencias").innerHTML = ""; // Limpiar sugerencias
}


async function buscarProductoMadre(codigoMadre) {
    const token = await authenticate();

    if (token && token.access_token) {
        try {
            const response = await fetch(`${GOOGLE_API_URL}!A2:D`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token.access_token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.values) {
                const resultados = data.values.filter(row => row[0] === codigoMadre);

                if (resultados.length > 0) {
                    descripcionMadreGlobal = resultados[0][1]; // Guardar descripción madre globalmente
                    hijosGlobal = resultados.map(row => ({
                        codigoHijo: row[2],
                        descripcionHijo: row[3]
                    })); // Guardar hijos globalmente

                    console.log("Resultado de búsqueda:", { descripcionMadre: descripcionMadreGlobal, hijos: hijosGlobal });
                    mostrarResultadosBusqueda(descripcionMadreGlobal, hijosGlobal);
                    actualizarListaEliminar(hijosGlobal);
                } else {
                    descripcionMadreGlobal = ""; // Reiniciar la variable global si no hay resultados
                    hijosGlobal = []; // Reiniciar la lista de hijos
                    mostrarErrorBusqueda("No se encontraron resultados para el código proporcionado.");
                }
            } else {
                console.error("Error al obtener datos:", data.error);
                mostrarErrorBusqueda("Hubo un error al obtener los datos.");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            mostrarErrorBusqueda("Hubo un error al realizar la búsqueda.");
        }
    }
}

function mostrarResultadosBusqueda(descripcionMadre, hijos) {
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = `
        <h3>Producto Madre Encontrado</h3>
        <p><strong>Descripción:</strong> ${descripcionMadre}</p>
        <h4>Códigos Hijos Asociados:</h4>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ccc; padding: 8px;">Código Hijo</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Descripción</th>
                </tr>
            </thead>
            <tbody>
                ${hijos.map(hijo => `
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px;">${hijo.codigoHijo}</td>
                        <td style="border: 1px solid #ccc; padding: 8px;">${hijo.descripcionHijo}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    habilitarBotones();
}

function mostrarErrorBusqueda(mensaje) {
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = `<p style="color: red;">${mensaje}</p>`;
    deshabilitarBotones();
}

function habilitarBotones() {
    document.getElementById("agregarHijo").disabled = false;
    document.getElementById("eliminarHijo").disabled = false;
}

function deshabilitarBotones() {
    document.getElementById("agregarHijo").disabled = true;
    document.getElementById("eliminarHijo").disabled = true;
}

function actualizarListaEliminar(hijos) {
    const eliminarCodigoSelect = document.getElementById("eliminarCodigo");
    eliminarCodigoSelect.innerHTML = "<option value=''>Seleccione un código</option>";

    hijos.forEach(hijo => {
        const option = document.createElement("option");
        option.value = hijo.codigoHijo;
        option.textContent = `${hijo.codigoHijo} - ${hijo.descripcionHijo}`;
        eliminarCodigoSelect.appendChild(option);
    });

    eliminarCodigoSelect.disabled = hijos.length === 0;
}

async function agregarCodigoHijo(codigoMadre, descripcionMadre, codigoHijo, descripcionHijo) {
    const token = await authenticate();

    if (token && token.access_token) {
        try {
            // Primero, obtener todos los datos de la hoja
            const response = await fetch(`${GOOGLE_API_URL}!A2:D`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token.access_token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.values) {
                // Verificar si ya existe el código hijo en la columna C
                const codigoHijoExistente = data.values.some(row => row[2] === codigoHijo);

                if (codigoHijoExistente) {
                    alert(`El código hijo ${codigoHijo} ya existe. No se puede agregar un código duplicado.`);
                    return; // Detener la ejecución si el código hijo ya existe
                }

                // Si no existe, proceder a agregar el código hijo
                const valores = [
                    [codigoMadre, descripcionMadre, codigoHijo, descripcionHijo]
                ];

                const insertResponse = await fetch(`${GOOGLE_API_URL}:append?valueInputOption=RAW`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ values: valores })
                });

                if (insertResponse.ok) {
                    alert("Código hijo agregado correctamente.");
                    limpiarCampos();
                    buscarProductoMadre(codigoMadre); // Redirigir a la búsqueda del código madre
                    document.querySelector(".tab[data-tab='buscar']").click(); // Cambiar a la pestaña de búsqueda
                } else {
                    console.error("Error al agregar código hijo:", await insertResponse.json());
                    alert("Error al agregar el código hijo.");
                }
            } else {
                console.error("Error al obtener datos:", data.error);
                alert("Hubo un error al obtener los datos para verificar duplicados.");
            }
        } catch (error) {
            console.error("Error en la solicitud para agregar código hijo:", error);
            alert("Error en la solicitud para agregar el código hijo.");
        }
    }
}


function limpiarCampos() {
    document.getElementById("nuevoCodigo").value = "";
    document.getElementById("nuevoNombre").value = "";
}

async function eliminarCodigoHijo(codigoHijo) {
    const token = await authenticate();

    if (token && token.access_token) {
        try {
            // Obtener todas las filas de la hoja para buscar el índice del código hijo
            const response = await fetch(`${GOOGLE_API_URL}!A2:D`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token.access_token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.values) {
                // Encontrar el índice de la fila donde está el código hijo
                const rowIndex = data.values.findIndex(row => row[2] === codigoHijo);

                if (rowIndex !== -1) {
                    // Calcular el número de fila real en Sheets (A1 notation)
                    const sheetRow = rowIndex + 2; // +2 porque empieza desde la fila 2 (A2)
                    const deleteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/CODIGO!A${sheetRow}:D${sheetRow}:clear`;

                    // Hacer la solicitud para limpiar la fila
                    const deleteResponse = await fetch(deleteUrl, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token.access_token}`
                        }
                    });

                    if (deleteResponse.ok) {
                        alert("Código hijo eliminado correctamente.");
                        
                        // Redirigir a la pestaña inicial (Buscar Producto Madre)
                        document.querySelector(".tab[data-tab='buscar']").click();
                        
                        // Actualizar la búsqueda automáticamente
                        const codigoMadre = document.getElementById("codigo").value.trim();
                        buscarProductoMadre(codigoMadre);
                    } else {
                        console.error("Error al eliminar fila:", await deleteResponse.json());
                        alert("Error al eliminar el código hijo.");
                    }
                } else {
                    alert("El código hijo no se encontró en la hoja.");
                }
            } else {
                console.error("Error al obtener datos para eliminar:", data.error);
                alert("Error al obtener los datos para eliminar el código hijo.");
            }
        } catch (error) {
            console.error("Error en la solicitud para eliminar código hijo:", error);
            alert("Error en la solicitud para eliminar el código hijo.");
        }
    }
}


document.getElementById("eliminarHijo").addEventListener("click", () => {
    const codigoHijo = document.getElementById("eliminarCodigo").value.trim();

    if (!codigoHijo) {
        alert("Por favor, seleccione un código hijo para eliminar.");
        return;
    }

    eliminarCodigoHijo(codigoHijo);
});


document.getElementById("agregarHijo").addEventListener("click", () => {
    const codigoMadre = document.getElementById("codigo").value.trim();
    const descripcionMadre = descripcionMadreGlobal; // Usar la variable global
    const codigoHijo = document.getElementById("nuevoCodigo").value.trim();
    const descripcionHijo = document.getElementById("nuevoNombre").value.trim();

    console.log("Datos a insertar (para debug):", { codigoMadre, descripcionMadre, codigoHijo, descripcionHijo });

    if (!codigoMadre || !descripcionMadre) {
        alert("Debe realizar una búsqueda válida antes de agregar un hijo.");
        return;
    }

    if (!codigoHijo || !descripcionHijo) {
        alert("Por favor, complete todos los campos para agregar un hijo.");
        return;
    }

    agregarCodigoHijo(codigoMadre, descripcionMadre, codigoHijo, descripcionHijo);
});

document.getElementById("codigo").addEventListener("input", () => {
    const codigoMadre = document.getElementById("codigo").value.trim();
    if (codigoMadre) {
        buscarProductoMadre(codigoMadre);
    } else {
        mostrarErrorBusqueda("Ingrese un código para buscar.");
    }
});