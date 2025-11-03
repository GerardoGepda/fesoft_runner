import fs from 'fs/promises';
import axios from 'axios';
import dayjs from 'dayjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Función para aplicar datos del .env al template de documento
 * @param {Object} template - Template del documento a modificar
 * @param {string} numeroInterno - Número interno generado para el documento
 * @returns {Object} Template modificado
 */
function aplicarDatosEmpresa(template, numeroInterno, tipoDocumento = null) {
    // Número interno generado y datos de identificación
    template.identificacion.numeroInternoEcom = numeroInterno;
    template.identificacion.fecEmi = dayjs().format('YYYY-MM-DD');
    template.identificacion.horEmi = dayjs().format('HH:mm:ss');
    
    // Datos del emisor desde .env
    template.emisor.nit = process.env.EMPRESA_NIT || null;
    template.emisor.nrc = process.env.EMPRESA_NRC || null;
    template.emisor.codActividad = process.env.EMPRESA_CODACTIVIDAD || null;
    template.emisor.descActividad = process.env.EMPRESA_CODACTIVIDAD || null;
    template.emisor.nombre = process.env.EMPRESA_NOMBRE || null;
    template.emisor.nombreComercial = process.env.EMPRESA_NOMBRE || null;
    template.emisor.direccion.departamento = process.env.EMPRESA_DEPARTAMENTO || null;
    template.emisor.direccion.municipio = process.env.EMPRESA_MUNICIPIO || null;
    template.emisor.codEstableMH = process.env.EMPRESA_ESTABLECIMIENTO || null;
    template.emisor.codPuntoVentaMH = process.env.EMPRESA_POS || null;

    if (tipoDocumento === 'SE') {
        delete template.emisor.nombreComercial;
    }
    
    return template;
}

/**
 * Función para aplicar datos del .env al template de documento en el receptor
 * @param {Object} template - Template del documento a modificar
 * @returns {Object} Template modificado
 */
function aplicarDatosReceptor(template) {
    // Datos del receptor desde .env
    template.receptor.nit = process.env.EMPRESA_NIT || "06142105831057";
    template.receptor.nrc = process.env.EMPRESA_NRC || null;
    template.receptor.nombre = process.env.EMPRESA_NOMBRE || null;
    template.receptor.codActividad = process.env.EMPRESA_CODACTIVIDAD || null;
    template.receptor.descActividad = process.env.EMPRESA_CODACTIVIDAD || null;
    template.receptor.nombreComercial = process.env.EMPRESA_NOMBRE || null;
    template.receptor.direccion.departamento = process.env.EMPRESA_DEPARTAMENTO || null;
    template.receptor.direccion.municipio = process.env.EMPRESA_MUNICIPIO || null;
    
    return template;
}

/**
 * Función para enviar documento a la API de FESOFT
 * @param {Object} template - Template del documento
 * @param {string} token - Token de autenticación
 * @returns {Promise<AxiosResponse>} Respuesta de la API
 */
async function enviarDocumentoAPI(template, token) {
    const apiUrl = process.env.FESOFT_API_URL;
    
    const response = await axios.post(`${apiUrl}/fe/send`, {
        document: template
    }, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response;
}

/**
 * Función para guardar documento procesado
 * @param {Object} template - Template del documento
 * @param {string} tipoDocumento - Tipo de documento (FACTURA, CCF, etc.)
 * @returns {Promise<string>} Ruta del archivo guardado
 */
async function guardarDocumento(template, tipoDocumento) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const outputDir = `output/${year}/${month}/${process.env.EMPRESA_NIT}/${tipoDocumento}`;
    
    await fs.mkdir(outputDir, { recursive: true });
    
    const filename = `${template.identificacion.numeroInternoEcom}.json`;
    const filepath = `${outputDir}/${filename}`;
    
    await fs.writeFile(filepath, JSON.stringify(template, null, 2));
    
    return filepath;
}

export async function facturaTest(token) {
    const data = await fs.readFile('templates/FACTURA.json', 'utf-8');
    let template = JSON.parse(data);
    
    // Generar número interno único
    const numeroInterno = `TEST-${Date.now()}`;
    
    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template, numeroInterno);

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.codigoGeneracion = response?.data?.result?.codigoGeneracion || null;
    template.identificacion.numeroControl = response?.data?.result?.numeroControl || null;
    template.identificacion.selloRecibido = response?.data?.result?.selloRecibido || null;
    
    // Guardar documento procesado
    await guardarDocumento(template, 'FACTURA');

    return {
        codigoGeneracion: response?.data?.result?.codigoGeneracion || null,
        selloRecibido: response?.data?.result?.selloRecibido || null
    };
}

export async function ccfTest(token) {
    const data = await fs.readFile('templates/CCF.json', 'utf-8');
    let template = JSON.parse(data);

    // Generar número interno único
    const numeroInterno = `CCF-${Date.now()}`;

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template, numeroInterno);

    // Aplicar datos del receptor
    template = aplicarDatosReceptor(template);
    
    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.codigoGeneracion = response?.data?.result?.codigoGeneracion || null;
    template.identificacion.numeroControl = response?.data?.result?.numeroControl || null;
    template.identificacion.selloRecibido = response?.data?.result?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'CCF');

    return {
        codigoGeneracion: response?.data?.result?.codigoGeneracion || null,
        selloRecibido: response?.data?.result?.selloRecibido || null
    };
}

export async function notaCreditoTest(token) {
    const data = await fs.readFile('templates/NC.json', 'utf-8');
    let template = JSON.parse(data);

    // Generar número interno único
    const numeroInterno = `NC-${Date.now()}`;

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template, numeroInterno);

    // Aplicar datos del receptor
    template = aplicarDatosReceptor(template);

    //Aplicar datos al documento relacionado
    const docRelated = crypto.randomUUID().toUpperCase();
    template.documentoRelacionado[0].numeroDocumento = docRelated;
    template.documentoRelacionado[0].fechaEmision = dayjs().format('YYYY-MM-DD');

    // Aplicar datos a los items
    template.cuerpoDocumento[0].numeroDocumento = docRelated;

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.codigoGeneracion = response?.data?.result?.codigoGeneracion || null;
    template.identificacion.numeroControl = response?.data?.result?.numeroControl || null;
    template.identificacion.selloRecibido = response?.data?.result?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'NC');

    return {
        codigoGeneracion: response?.data?.result?.codigoGeneracion || null,
        selloRecibido: response?.data?.result?.selloRecibido || null
    };
}

export async function notaDebitoTest(token) {
    const data = await fs.readFile('templates/ND.json', 'utf-8');
    let template = JSON.parse(data);

    // Generar número interno único
    const numeroInterno = `ND-${Date.now()}`;

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template, numeroInterno);

    // Aplicar datos del receptor
    template = aplicarDatosReceptor(template);

    //Aplicar datos al documento relacionado
    const docRelated = crypto.randomUUID().toUpperCase();
    template.documentoRelacionado[0].numeroDocumento = docRelated;
    template.documentoRelacionado[0].fechaEmision = dayjs().format('YYYY-MM-DD');

    // Aplicar datos a los items
    template.cuerpoDocumento[0].numeroDocumento = docRelated;

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.codigoGeneracion = response?.data?.result?.codigoGeneracion || null;
    template.identificacion.numeroControl = response?.data?.result?.numeroControl || null;
    template.identificacion.selloRecibido = response?.data?.result?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'ND');

    return {
        codigoGeneracion: response?.data?.result?.codigoGeneracion || null,
        selloRecibido: response?.data?.result?.selloRecibido || null
    };
}

export async function sujetoExcluidoTest(token) {
    const data = await fs.readFile('templates/SE.json', 'utf-8');
    let template = JSON.parse(data);

    // Generar número interno único
    const numeroInterno = `SE-${Date.now()}`;

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template, numeroInterno, 'SE');

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.codigoGeneracion = response?.data?.result?.codigoGeneracion || null;
    template.identificacion.numeroControl = response?.data?.result?.numeroControl || null;
    template.identificacion.selloRecibido = response?.data?.result?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'SE');

    return {
        codigoGeneracion: response?.data?.result?.codigoGeneracion || null,
        selloRecibido: response?.data?.result?.selloRecibido || null
    };
}

export async function facturaExportacionTest(token) {
    const data = await fs.readFile('templates/FEX.json', 'utf-8');
    let template = JSON.parse(data);
    
    // Generar número interno único
    const numeroInterno = `FEX-${Date.now()}`;

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template, numeroInterno);

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.codigoGeneracion = response?.data?.result?.codigoGeneracion || null;
    template.identificacion.numeroControl = response?.data?.result?.numeroControl || null;
    template.identificacion.selloRecibido = response?.data?.result?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'FEX');

    return {
        codigoGeneracion: response?.data?.result?.codigoGeneracion || null,
        selloRecibido: response?.data?.result?.selloRecibido || null
    };
}