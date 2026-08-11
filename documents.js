import fs from 'fs/promises';
import axios from 'axios';
import dayjs from 'dayjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Función para aplicar datos del .env al template de documento
 * @param {Object} template - Template del documento a modificar
 * @returns {Object} Template modificado
 */
function aplicarDatosEmpresa(template, tipoDocumento = null) {
    // Número interno generado y datos de identificación
    template.identificacion.codigoGeneracion = crypto.randomUUID().toUpperCase();
    template.identificacion.numeroControl = `DTE-${template.identificacion.tipoDte}-${process.env.EMPRESA_ESTABLECIMIENTO}${process.env.EMPRESA_POS}-${Date.now().toString().padStart(15, 0)}`;
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

    if (['NC', 'ND'].includes(tipoDocumento)) {
        delete template.emisor.codEstableMH;
        delete template.emisor.codPuntoVentaMH;
    }

    if (tipoDocumento === 'CR') {
        // El Comprobante de Retención nombra distinto el establecimiento y el punto de venta
        template.emisor.codigoMH = template.emisor.codEstableMH;
        template.emisor.puntoVentaMH = template.emisor.codPuntoVentaMH;
        delete template.emisor.codEstableMH;
        delete template.emisor.codPuntoVentaMH;
    }

    return template;
}

/**
 * Función para aplicar datos del .env al template de documento
 * @param {Object} template - Template del documento a modificar
 * @returns {Object} Template modificado
 */
function aplicarDatosEmpresaAnulacion(template) {
    // Número interno generado y datos de identificación
    template.identificacion.codigoGeneracion = crypto.randomUUID().toUpperCase();
    template.identificacion.fecAnula = dayjs().format('YYYY-MM-DD');
    template.identificacion.horAnula = dayjs().format('HH:mm:ss');

    // Datos del emisor desde .env
    template.emisor.nit = process.env.EMPRESA_NIT || null;
    template.emisor.nombre = process.env.EMPRESA_NOMBRE || null;
    template.emisor.nomEstablecimiento = process.env.EMPRESA_NOMBRE || null;
    
    return template;
}

/**
 * Función para aplicar datos del .env al template de documento
 * @param {Object} template - Template del documento a modificar
 * @returns {Object} Template modificado
 */
function aplicarDatosEmpresaContingencia(template) {
    // Número interno generado y datos de identificación
    template.identificacion.codigoGeneracion = crypto.randomUUID().toUpperCase();
    template.identificacion.fTransmision = dayjs().format('YYYY-MM-DD');
    template.identificacion.hTransmision = dayjs().format('HH:mm:ss');

    // Datos del emisor desde .env
    template.emisor.nit = process.env.EMPRESA_NIT || null;
    template.emisor.nombre = process.env.EMPRESA_NOMBRE || null;
    template.emisor.codEstableMH = process.env.EMPRESA_ESTABLECIMIENTO || null;
    template.emisor.codPuntoVenta = process.env.EMPRESA_POS || null;
    template.motivo.fInicio = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    template.motivo.fFin = dayjs().format('YYYY-MM-DD');
    template.motivo.hInicio = dayjs().format('HH:mm:ss');
    template.motivo.hFin = dayjs().format('HH:mm:ss');

    template.detalleDTE = [{
        noItem: 1,
        codigoGeneracion: crypto.randomUUID().toUpperCase(),
        tipoDoc: "01"
    }]

    return template;
}

/**
 * Función para aplicar datos del .env al template de documento
 * El Comprobante de Donación nombra "donatario" al emisor y "donante" al receptor
 * @param {Object} template - Template del documento a modificar
 * @returns {Object} Template modificado
 */
function aplicarDatosEmpresaDonacion(template) {
    // Número interno generado y datos de identificación
    template.identificacion.codigoGeneracion = crypto.randomUUID().toUpperCase();
    template.identificacion.numeroControl = `DTE-${template.identificacion.tipoDte}-${process.env.EMPRESA_ESTABLECIMIENTO}${process.env.EMPRESA_POS}-${Date.now().toString().padStart(15, 0)}`;
    template.identificacion.fecEmi = dayjs().format('YYYY-MM-DD');
    template.identificacion.horEmi = dayjs().format('HH:mm:ss');

    // Datos del donatario (emisor) desde .env
    template.donatario.numDocumento = process.env.EMPRESA_NIT || null;
    template.donatario.nrc = process.env.EMPRESA_NRC || null;
    template.donatario.codActividad = process.env.EMPRESA_CODACTIVIDAD || null;
    template.donatario.descActividad = process.env.EMPRESA_CODACTIVIDAD || null;
    template.donatario.nombre = process.env.EMPRESA_NOMBRE || null;
    template.donatario.nombreComercial = process.env.EMPRESA_NOMBRE || null;
    template.donatario.direccion.departamento = process.env.EMPRESA_DEPARTAMENTO || null;
    template.donatario.direccion.municipio = process.env.EMPRESA_MUNICIPIO || null;
    template.donatario.codEstableMH = process.env.EMPRESA_ESTABLECIMIENTO || null;
    template.donatario.codPuntoVentaMH = process.env.EMPRESA_POS || null;

    return template;
}

/**
 * Función para aplicar datos del .env al template de documento en el receptor
 * @param {Object} template - Template del documento a modificar
 * @returns {Object} Template modificado
 */
function aplicarDatosReceptor(template, tipoDocumento = null) {
    // Datos del receptor desde .env
    template.receptor.nrc = process.env.RECEPTOR_NRC;
    template.receptor.nombre = process.env.RECEPTOR_NOMBRE;
    template.receptor.codActividad = process.env.RECEPTOR_CODACTIVIDAD;
    template.receptor.descActividad = process.env.RECEPTOR_CODACTIVIDAD;
    template.receptor.nombreComercial = process.env.RECEPTOR_NOMBRE;
    template.receptor.direccion.departamento = process.env.RECEPTOR_DEPARTAMENTO;
    template.receptor.direccion.municipio = process.env.RECEPTOR_MUNICIPIO;

    if (['NR', 'CR'].includes(tipoDocumento)) {
        // Estos documentos identifican al receptor con tipoDocumento/numDocumento, no con nit
        template.receptor.numDocumento = process.env.RECEPTOR_NIT;
    } else {
        template.receptor.nit = process.env.RECEPTOR_NIT;
    }

    return template;
}

/**
 * Función para enviar documento a la API de FESOFT
 * @param {Object} template - Template del documento
 * @param {string} token - Token de autenticación
 * @returns {Promise<AxiosResponse>} Respuesta de la API
 */
async function firmarDocumento(template) {
    const url = process.env.SIGNER_URL;
    
    const response = await axios.post(`${url}/firmardocumento/`, {
        nit: process.env.NIT,
        activo: true,
        passwordPri: process.env.PRIVATE_KEY,
        dteJson: template
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    return response?.data?.body || null;
}

/**
 * Función para enviar documento a la API de FESOFT
 * @param {Object} template - Template del documento
 * @param {string} token - Token de autenticación
 * @returns {Promise<AxiosResponse>} Respuesta de la API
 */
async function enviarDocumentoAPI(template, token) {
    // firmando el documento
    const signedDocument = await firmarDocumento(template);

    const apiUrl = process.env.MH_URL;
    const response = await axios.post(`${apiUrl}/fesv/recepciondte/`, {
        ambiente: "00",
        idEnvio: 1,
        version: template.identificacion.version,
        tipoDte: template.identificacion.tipoDte,
        documento: signedDocument
    }, {
        headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
        }
    });

    return response?.data;
}

/**
 * Función para enviar documento a la API de FESOFT
 * @param {Object} template - Template del documento
 * @param {string} token - Token de autenticación
 * @returns {Promise<AxiosResponse>} Respuesta de la API
 */
async function enviarAnulacionAPI(template, token) {
    // firmando el documento
    const signedDocument = await firmarDocumento(template);

    const apiUrl = process.env.MH_URL;
    const response = await axios.post(`${apiUrl}/fesv/anulardte/`, {
        ambiente: "00",
        idEnvio: 1,
        version: 2,
        documento: signedDocument
    }, {
        headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response?.data;
}

/**
 * Función para enviar documento a la API de FESOFT
 * @param {Object} template - Template del documento
 * @param {string} token - Token de autenticación
 * @returns {Promise<AxiosResponse>} Respuesta de la API
 */
async function enviarContingenciaAPI(template, token) {
    // firmando el documento
    const signedDocument = await firmarDocumento(template);

    const apiUrl = process.env.MH_URL;
    const response = await axios.post(`${apiUrl}/fesv/contingencia/`, {
        nit: process.env.NIT,
        documento: signedDocument
    }, {
        headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response?.data;
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

    const filename = `${template.identificacion.numeroControl || template.identificacion.codigoGeneracion}.json`;
    const filepath = `${outputDir}/${filename}`;
    
    await fs.writeFile(filepath, JSON.stringify(template, null, 2));
    
    return filepath;
}

export async function facturaTest(token) {
    const data = await fs.readFile('templates/FACTURA.json', 'utf-8');
    let template = JSON.parse(data);
    
    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template);

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.selloRecibido = response?.selloRecibido || null;
    
    // Guardar documento procesado
    await guardarDocumento(template, 'FACTURA');

    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
}

export async function ccfTest(token) {
    const data = await fs.readFile('templates/CCF.json', 'utf-8');
    let template = JSON.parse(data);

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template);

    // Aplicar datos del receptor
    template = aplicarDatosReceptor(template);
    
    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.selloRecibido = response?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'CCF');

    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
}

export async function notaRemisionTest(token) {
    const data = await fs.readFile('templates/NR.json', 'utf-8');
    let template = JSON.parse(data);

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template);

    // Aplicar datos del receptor
    template = aplicarDatosReceptor(template, 'NR');

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.selloRecibido = response?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'NR');

    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
}

export async function notaCreditoTest(token) {
    const data = await fs.readFile('templates/NC.json', 'utf-8');
    let template = JSON.parse(data);

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template, 'NC');

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
    template.identificacion.selloRecibido = response?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'NC');

    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
}

export async function notaDebitoTest(token) {
    const data = await fs.readFile('templates/ND.json', 'utf-8');
    let template = JSON.parse(data);

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template, 'ND');

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
    template.identificacion.selloRecibido = response?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'ND');

    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
}

export async function comprobanteRetencionTest(token) {
    const data = await fs.readFile('templates/CR.json', 'utf-8');
    let template = JSON.parse(data);

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template, 'CR');

    // Aplicar datos del receptor
    template = aplicarDatosReceptor(template, 'CR');

    // El documento retenido es físico (tipoDoc = 1), se inventa un correlativo distinto por prueba
    template.cuerpoDocumento[0].numDocumento = Date.now().toString().slice(-11);
    template.cuerpoDocumento[0].fechaEmision = dayjs().format('YYYY-MM-DD');

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.selloRecibido = response?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'CR');

    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
}

export async function sujetoExcluidoTest(token) {
    const data = await fs.readFile('templates/SE.json', 'utf-8');
    let template = JSON.parse(data);

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template, 'SE');

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.selloRecibido = response?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'SE');

    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
}

export async function facturaExportacionTest(token) {
    const data = await fs.readFile('templates/FEX.json', 'utf-8');
    let template = JSON.parse(data);

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresa(template);

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.selloRecibido = response?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'FEX');

    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
}

export async function donacionTest(token) {
    const data = await fs.readFile('templates/CD.json', 'utf-8');
    let template = JSON.parse(data);

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresaDonacion(template);

    // Enviar documento a la API
    const response = await enviarDocumentoAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.selloRecibido = response?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'CD');

    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
}

export async function anulacionTest(token) {
    const data = await fs.readFile('templates/ANULACION.json', 'utf-8');
    let template = JSON.parse(data);

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresaAnulacion(template);

    // Buscando la primera factura emitida para anular
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const outputSearch = `output/${year}/${month}/${process.env.EMPRESA_NIT}/FACTURA`;

    // validar si existe el directorio y si hay archivos en el directorio
    const files = await fs.readdir(outputSearch).catch(() => []);
    if (files.length === 0) {
        throw new Error('❌ No se encontraron facturas emitidas para anular.');
    }

    // Leer el primer archivo encontrado que no sea una carpeta
    let firstFile = null;
    for (const file of files) {
        const fileStat = await fs.stat(`${outputSearch}/${file}`);
        if (fileStat.isFile()) {
            firstFile = file;
            break;
        }
    }
    const facturaData = await fs.readFile(`${outputSearch}/${firstFile}`, 'utf-8');
    const facturaTemplate = JSON.parse(facturaData);

    // modificando template de anulacion con los datos de la factura encontrada
    template.documento.tipoDte = facturaTemplate.identificacion.tipoDte;
    template.documento.codigoGeneracion = facturaTemplate.identificacion.codigoGeneracion;
    template.documento.selloRecibido = facturaTemplate.identificacion.selloRecibido;
    template.documento.numeroControl = facturaTemplate.identificacion.numeroControl;
    template.documento.fecEmi = facturaTemplate.identificacion.fecEmi;
    template.documento.montoIva = facturaTemplate.resumen.totalIva;
    template.documento.tipoDocumento = facturaTemplate.receptor.tipoDocumento || null;
    template.documento.numDocumento = facturaTemplate.receptor.numDocumento || null;
    template.documento.nombre = facturaTemplate.receptor.nombre || null;
    template.documento.telefono = facturaTemplate.receptor.telefono || null;
    template.documento.correo = facturaTemplate.receptor.correo || null;

    // Enviar documento a la API
    const response = await enviarAnulacionAPI(template, token);

    // Actualizar template con datos de respuesta
    template.identificacion.selloRecibido = response?.selloRecibido || null;

    // Guardar documento procesado
    await guardarDocumento(template, 'ANULACION');

    // Moviendo la factura anulada a una carpeta de anulados
    const anuladasDir = `${outputSearch}/ANULADOS`;
    await fs.mkdir(anuladasDir, { recursive: true });
    await fs.rename(`${outputSearch}/${firstFile}`, `${anuladasDir}/${firstFile}`);

    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
    
}

export async function contingenciaTest(token) {
    const data = await fs.readFile('templates/CONTINGENCIA.json', 'utf-8');
    let template = JSON.parse(data);

    // Aplicar datos de la empresa
    template = aplicarDatosEmpresaContingencia(template);

    // Enviar documento a la API
    const response = await enviarContingenciaAPI(template, token);
    
    return {
        codigoGeneracion: response?.codigoGeneracion || null,
        selloRecibido: response?.selloRecibido || null
    };
}