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
        const apiUrl = process.env.FESOFT_API_URL;
        const user = process.env.FESOFT_USER;
        const password = process.env.FESOFT_PASSWORD;

        if (!apiUrl || !user || !password) {
            throw new Error('❌ Faltan variables de entorno: FESOFT_API_URL, FESOFT_USER, FESOFT_PASSWORD');
        }

        console.log('🔐 Iniciando proceso de login...');
        console.log(`📡 API URL: ${apiUrl}`);
        console.log(`👤 Usuario: ${user}`);

        // Configurar la petición de login
        const loginData = {
            email: user,
            password: password
        };

        // Realizar petición POST al endpoint de login
        const response = await axios.post(`${apiUrl}/auth`, loginData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000 // Timeout de 10 segundos
        });

        // Verificar que la respuesta sea exitosa
        if (response.status === 200 && response.data) {
            const token = response.data.token || response.data.access_token || response.data.accessToken;
            
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

/**
 * Función para validar si un token sigue siendo válido
 * @param {string} token - Token a validar
 * @returns {Promise<boolean>} True si el token es válido
 */
async function validateToken(token) {
    try {
        const apiUrl = process.env.FESOFT_API_URL;
        
        const response = await axios.get(`${apiUrl}/auth/validate`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            timeout: 5000
        });

        return response.status === 200;
    } catch (error) {
        console.log('⚠️  Token inválido o expirado');
        return false;
    }
}

/**
 * Función para hacer logout (opcional)
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si el logout fue exitoso
 */
async function logout(token) {
    try {
        const apiUrl = process.env.FESOFT_API_URL;
        
        const response = await axios.post(`${apiUrl}/auth/logout`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            timeout: 5000
        });

        if (response.status === 200) {
            console.log('✅ Logout exitoso');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Error en logout:', error.message);
        return false;
    }
}

/**
 * Función de prueba para el sistema de login
 */
async function testLogin() {
    try {
        console.log('🧪 Iniciando pruebas de login...\n');
        
        // Realizar login
        const token = await login();
        
        if (token) {
            console.log('✅ Test de login: EXITOSO');
            
            // Validar token (opcional)
            console.log('\n🔍 Validando token...');
            const isValid = await validateToken(token);
            console.log(`✅ Test de validación: ${isValid ? 'EXITOSO' : 'FALLIDO'}`);
            
            return token;
        }
    } catch (error) {
        console.error('❌ Test de login: FALLIDO');
        console.error('📄 Error:', error.message);
        throw error;
    }
}

// Exportar funciones
export { login, validateToken, logout, testLogin };
