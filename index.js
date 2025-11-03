import readline from 'readline';
import login from './login.js';
import { ccfTest, facturaTest } from './documents.js';

// Configurar interfaz de readline para entrada de usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para solicitar número de pruebas
async function solicitarNumeroPruebas(tipoDocumento) {
    return new Promise((resolve) => {
        rl.question(`📊 ¿Cuántas pruebas de ${tipoDocumento} deseas realizar? (1-100): `, (answer) => {
            const numero = parseInt(answer.trim());
            if (isNaN(numero) || numero < 1 || numero > 100) {
                console.log('❌ Número inválido. Usando 1 prueba por defecto.');
                resolve(1);
            } else {
                resolve(numero);
            }
        });
    });
}

// Función genérica para ejecutar múltiples pruebas
async function ejecutarPruebas(tipoDocumento, funcionPrueba, requiresToken = false) {
    console.log(`\n${tipoDocumento.emoji} Ejecutando Pruebas de ${tipoDocumento.nombre}...`);
    const numeroPruebas = await solicitarNumeroPruebas(tipoDocumento.nombre);
    
    console.log(`\n🚀 Ejecutando ${numeroPruebas} prueba(s) de ${tipoDocumento.nombre}...\n`);

    // Obtener token si es necesario
    let token = null;
    if (requiresToken) {
        token = await login();
    }

    for (let i = 1; i <= numeroPruebas; i++) {
        console.log(`\n📄 Ejecutando prueba ${i} de ${numeroPruebas}:`);
        console.log('─'.repeat(40));
        
        try {
            const response = await funcionPrueba(token, i);
            
            if (response && response.codigoGeneracion && response.selloRecibido) {
                console.log(`✅ Prueba ${i} completada exitosamente: Código de Generación: ${response.codigoGeneracion}, Sello Recibido: ${response.selloRecibido}`);
            } else if (response && typeof response === 'string') {
                console.log(`✅ Prueba ${i} completada exitosamente: ${response}`);
            } else {
                console.log(`✅ Prueba ${i} completada exitosamente`);
            }
        } catch (error) {
            console.error(`❌ Error en prueba ${i}:`, error.message, error?.response?.data || '');
        }
        
        // Pausa entre pruebas si hay más de una
        if (i < numeroPruebas) {
            console.log('\n⏳ Esperando 2 segundos antes de la siguiente prueba...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log(`\n🎉 Completadas ${numeroPruebas} prueba(s) de ${tipoDocumento.nombre}`);
    await pausa();
}

// Funciones para cada opción del menú
async function pruebasFactura() {
    const tipoDocumento = {
        emoji: '🧾',
        nombre: 'Factura'
    };
    
    await ejecutarPruebas(tipoDocumento, facturaTest, true);
}

async function pruebasCCF() {
    const tipoDocumento = {
        emoji: '📋',
        nombre: 'CCF'
    };
    
    await ejecutarPruebas(tipoDocumento, ccfTest, true);
}

async function pruebasNotaCredito() {
    const tipoDocumento = {
        emoji: '💳',
        nombre: 'Nota de Crédito'
    };
    
    // Función temporal hasta implementar notaCreditoTest
    const notaCreditoTest = async (token, numeroIteracion) => {
        return `Nota de Crédito ${numeroIteracion} - Funcionalidad pendiente de implementar`;
    };
    
    await ejecutarPruebas(tipoDocumento, notaCreditoTest, false);
}

async function pruebasNotaDebito() {
    const tipoDocumento = {
        emoji: '💰',
        nombre: 'Nota de Débito'
    };
    
    // Función temporal hasta implementar notaDebitoTest
    const notaDebitoTest = async (token, numeroIteracion) => {
        return `Nota de Débito ${numeroIteracion} - Funcionalidad pendiente de implementar`;
    };
    
    await ejecutarPruebas(tipoDocumento, notaDebitoTest, false);
}

async function pruebasComprobanteRetencion() {
    const tipoDocumento = {
        emoji: '📊',
        nombre: 'Comprobante de Retención'
    };
    
    // Función temporal hasta implementar comprobanteRetencionTest
    const comprobanteRetencionTest = async (token, numeroIteracion) => {
        return `Comprobante de Retención ${numeroIteracion} - Funcionalidad pendiente de implementar`;
    };
    
    await ejecutarPruebas(tipoDocumento, comprobanteRetencionTest, false);
}

async function pruebasFacturaExportacion() {
    const tipoDocumento = {
        emoji: '🌍',
        nombre: 'Factura de Exportación'
    };
    
    // Función temporal hasta implementar facturaExportacionTest
    const facturaExportacionTest = async (token, numeroIteracion) => {
        return `Factura de Exportación ${numeroIteracion} - Funcionalidad pendiente de implementar`;
    };
    
    await ejecutarPruebas(tipoDocumento, facturaExportacionTest, false);
}

async function pruebasSujetosExcluidos() {
    const tipoDocumento = {
        emoji: '👥',
        nombre: 'Sujetos Excluidos'
    };
    
    // Función temporal hasta implementar sujetosExcluidosTest
    const sujetosExcluidosTest = async (token, numeroIteracion) => {
        return `Sujetos Excluidos ${numeroIteracion} - Funcionalidad pendiente de implementar`;
    };
    
    await ejecutarPruebas(tipoDocumento, sujetosExcluidosTest, false);
}

async function pruebasAnulaciones() {
    const tipoDocumento = {
        emoji: '❌',
        nombre: 'Anulaciones'
    };
    
    // Función temporal hasta implementar anulacionesTest
    const anulacionesTest = async (token, numeroIteracion) => {
        return `Anulaciones ${numeroIteracion} - Funcionalidad pendiente de implementar`;
    };
    
    await ejecutarPruebas(tipoDocumento, anulacionesTest, false);
}

// Función para pausar y esperar entrada del usuario
function pausa() {
    return new Promise((resolve) => {
        rl.question('\nPresiona Enter para continuar...', () => {
            resolve();
        });
    });
}

// Función para mostrar el menú
function mostrarMenu() {
    console.clear();
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    🏃 FESOFT RUNNER                      ║');
    console.log('║                  Sistema de Pruebas                       ║');
    console.log('║                                                           ║');
    console.log('║          📊 Puedes ejecutar múltiples pruebas            ║');
    console.log('║             por cada tipo de documento                    ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║                                                           ║');
    console.log('║  1. 🧾 Pruebas de Factura                                ║');
    console.log('║  2. 📋 Pruebas de CCF                                    ║');
    console.log('║  3. 💳 Pruebas de Nota de Crédito                        ║');
    console.log('║  4. 💰 Pruebas de Nota de Débito                         ║');
    console.log('║  5. 📊 Pruebas de Comprobante de Retención               ║');
    console.log('║  6. 🌍 Pruebas de Facturas de Exportación                ║');
    console.log('║  7. 👥 Pruebas de Sujetos Excluidos                      ║');
    console.log('║  8. ❌ Pruebas de Anulaciones                             ║');
    console.log('║  0. 🚪 Salir                                              ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log();
}

// Función para procesar la opción seleccionada
async function procesarOpcion(opcion) {
    switch (opcion) {
        case '1':
            await pruebasFactura();
            break;
        case '2':
            await pruebasCCF();
            break;
        case '3':
            await pruebasNotaCredito();
            break;
        case '4':
            await pruebasNotaDebito();
            break;
        case '5':
            await pruebasComprobanteRetencion();
            break;
        case '6':
            await pruebasFacturaExportacion();
            break;
        case '7':
            await pruebasSujetosExcluidos();
            break;
        case '8':
            await pruebasAnulaciones();
            break;
        case '0':
            console.log('\n👋 ¡Gracias por usar FESOFT Runner!');
            console.log('Saliendo del programa...\n');
            return false;
        default:
            console.log('\n❌ Opción no válida. Por favor, selecciona una opción del 0 al 8.');
            await pausa();
            break;
    }
    return true;
}

// Función principal
async function main() {
    console.log('🚀 Iniciando FESOFT Runner...\n');
    
    let continuar = true;
    
    while (continuar) {
        mostrarMenu();
        
        const opcion = await new Promise((resolve) => {
            rl.question('Selecciona una opción: ', (answer) => {
                resolve(answer.trim());
            });
        });
        
        continuar = await procesarOpcion(opcion);
    }
    
    rl.close();
    process.exit(0);
}

// Manejo de errores y cierre del programa
process.on('SIGINT', () => {
    console.log('\n\n👋 Programa interrumpido. ¡Hasta luego!');
    rl.close();
    process.exit(0);
});

// Ejecutar el programa principal
main().catch((error) => {
    console.error('❌ Error en la ejecución del programa:', error);
    rl.close();
    process.exit(1);
});
