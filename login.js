import axios from 'axios';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Función para hacer login a la API de FESOFT y obtener el token
 * @returns {Promise<string>} Token de autenticación
 */
export default async function login() {
    try {
        // Validar que existan las variables de entorno necesarias
        const apiUrl = process.env.MH_URL;
        const user = process.env.NIT;
        const pwd = process.env.API_PASSWORD;

        if (!apiUrl || !user || !pwd) {
            throw new Error('❌ Faltan variables de entorno: MH_URL, NIT, API_PASSWORD');
        }

        console.log('🔐 Iniciando proceso de login...');
        console.log(`📡 API URL: ${apiUrl}`);
        console.log(`👤 Usuario: ${user}`);

        // Configurar la petición de login
        const loginData = { user, pwd };

        // Realizar petición POST al endpoint de login
        const response = await axios.post(`${apiUrl}/seguridad/auth`, loginData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 10000 // Timeout de 10 segundos
        });

        // Verificar que la respuesta sea exitosa
        if (response.status === 200 && response.data) {
            const token = response.data.body.token;
            
            if (token) {
                console.log('✅ Login exitoso');
                console.log(`🔑 Token obtenido: ${token.substring(0, 20)}...`);
                return token;
            } else {
                throw new Error('❌ Token no encontrado en la respuesta de la API');
            }
        } else {
            throw new Error(`❌ Error en la respuesta de la API: ${response.status}`);
        }

    } catch (error) {
        // Manejo específico de errores de Axios
        if (error.response) {
            // El servidor respondió con un código de estado que no está en el rango 2xx
            console.error('❌ Error del servidor:', error.response.status);
            console.error('📄 Mensaje:', error.response.data?.message || error.response.data);
            throw new Error(`Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error('❌ Error de conexión: No se pudo conectar con la API');
            throw new Error('Error de conexión: No se pudo conectar con la API');
        } else {
            // Algo más salió mal
            console.error('❌ Error:', error.message);
            throw new Error(error.message);
        }
    }
}

// Exportar funciones
export { login };
